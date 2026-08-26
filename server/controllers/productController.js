import mongoose from "mongoose";
import Product from "../models/Product.js";
import { createMongoImageRecord, deleteImageFile } from "../middlewares/imageUploader.js";
import { createNotificationsForRole } from "./notificationController.js";

const CATEGORIES = [
  "Mobile Phones",
  "Laptops",
  "Desktops",
  "iPads & Tablets",
  "Speakers & Audios",
];

// Builds the Mongo filter object shared by the list + facet-count queries
const buildFilter = (query = {}) => {
  const {
    category, // comma-separated list e.g. "Mobile Phones,Laptops"
    minPrice,
    maxPrice,
    minRating,
    inStock,
    search,
  } = query;

  const filter = { isActive: { $ne: false } };

  if (category) {
    const cats = category.split(",").map((c) => c.trim()).filter(Boolean);
    if (cats.length > 0) {
      filter.category = { $in: cats };
    }
  }

  if (minPrice !== undefined && minPrice !== null && minPrice !== "" && !isNaN(Number(minPrice))) {
    filter.price = filter.price || {};
    filter.price.$gte = Number(minPrice);
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "" && !isNaN(Number(maxPrice))) {
    filter.price = filter.price || {};
    filter.price.$lte = Number(maxPrice);
  }

  if (minRating !== undefined && minRating !== null && minRating !== "" && !isNaN(Number(minRating))) {
    filter.rating = { $gte: Number(minRating) };
  }

  if (inStock === "true") {
    filter.stock = { $gt: 0 };
  } else if (inStock === "false") {
    filter.stock = { $lte: 0 };
  }

  if (search && typeof search === "string" && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
      { category: { $regex: escaped, $options: "i" } },
      { brand: { $regex: escaped, $options: "i" } },
    ];
  }

  return filter;
};

// Maps sort query param to Mongoose sort object
const buildSort = (sort) => {
  switch (sort) {
    case "price-asc":
      return { price: 1 };
    case "price-desc":
      return { price: -1 };
    case "sold-desc":
      return { sold: -1 };
    case "rating-desc":
      return { rating: -1 };
    case "newest":
      return { createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
};

// GET /api/products
// Supports: category, minPrice, maxPrice, minRating, inStock, search, sort, page, limit
export const getProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 9);
    const skip = (page - 1) * limit;

    const filter = buildFilter(req.query);
    const sort = buildSort(req.query.sort);

    const [products, totalItems] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    res.json({
      products,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Error in getProducts:", err.message);
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// GET /api/products/facets
// Returns dynamic counts per category and rating, and the current price range min/max
export const getProductFacets = async (req, res) => {
  try {
    const baseFilter = { isActive: { $ne: false } };

    // Run category facet counts
    const categoryCounts = await Promise.all(
      CATEGORIES.map(async (cat) => {
        const count = await Product.countDocuments({ ...baseFilter, category: cat });
        return { category: cat, count };
      })
    );

    // Run rating facet counts
    const ratingCounts = await Promise.all(
      [5, 4, 3].map(async (r) => {
        const count = await Product.countDocuments({ ...baseFilter, rating: { $gte: r } });
        return { rating: r, count };
      })
    );

    // Min and Max price in catalog
    let priceRange = { min: 0, max: 600000 };
    try {
      const priceStats = await Product.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            min: { $min: "$price" },
            max: { $max: "$price" },
          },
        },
      ]);
      if (priceStats && priceStats[0]) {
        priceRange = {
          min: priceStats[0].min || 0,
          max: priceStats[0].max || 600000,
        };
      }
    } catch {
      // Keep default priceRange
    }

    res.json({
      categories: categoryCounts,
      ratings: ratingCounts,
      priceRange,
    });
  } catch (err) {
    console.error("Error in getProductFacets:", err.message);
    res.status(500).json({ message: "Failed to fetch facets", error: err.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).lean();
    }

    if (!product) {
      product = await Product.findOne({ $or: [{ name: id }] }).lean();
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("Error in getProductById:", err.message);
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
};

// POST /api/products
// Expects multipart/form-data — text fields + up to 10 files under "images" (or JSON)
export const createProduct = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    const newImages = files
      .map((file) => createMongoImageRecord(file))
      .filter(Boolean);

    // Also support images array if passed in req.body
    let initialImages = [];
    if (req.body.images) {
      try {
        const parsed = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        if (Array.isArray(parsed)) {
          initialImages = parsed.map((img) =>
            typeof img === 'string'
              ? { url: img, filename: 'product-image.jpg', path: img }
              : { url: img.url || img.path || '', filename: img.filename || 'product-image.jpg', path: img.path || img.url || '' }
          );
        }
      } catch {
        // Not a JSON string
      }
    }

    const images = [...initialImages, ...newImages];

    const productData = {
      ...req.body,
      images,
      price: Number(req.body.price),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 0,
      rating: req.body.rating !== undefined ? Number(req.body.rating) : 5,
      sold: req.body.sold !== undefined ? Number(req.body.sold) : 0,
    };

    const product = new Product(productData);
    await product.save();

    // Trigger low stock notification
    if (product.stock > 0 && product.stock <= 5) {
      await createNotificationsForRole("admin", {
        title: "Low Stock Alert",
        message: `Product "${product.name}" is running low on stock (${product.stock} left).`,
        type: "inventory",
        link: "/admin/products",
      });
    }

    res.status(201).json(product);
  } catch (err) {
    console.error("Error in createProduct:", err.message);
    res.status(400).json({ message: "Failed to create product", error: err.message });
  }
};

// PUT /api/products/:id
// Expects multipart/form-data — text fields + new images (stored in MongoDB), or JSON
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Handle image removals requested by client
    if (req.body.removeImages) {
      const toRemove = Array.isArray(req.body.removeImages)
        ? req.body.removeImages
        : [req.body.removeImages];

      toRemove.forEach((itemToRemove) => {
        const targetPath = typeof itemToRemove === 'object' ? itemToRemove.url || itemToRemove.path : itemToRemove;
        if (targetPath) {
          // If it was a legacy disk upload path, clean it up
          if (targetPath.includes('/uploads/')) {
            deleteImageFile(targetPath);
          }
          product.images = product.images.filter(
            (img) => img.path !== targetPath && img.url !== targetPath && img.filename !== targetPath
          );
        }
      });
    }

    // Handle new uploaded images (converted to MongoDB Base64 Data URIs)
    const files = req.files || (req.file ? [req.file] : []);
    if (files && files.length > 0) {
      const newImages = files
        .map((file) => createMongoImageRecord(file))
        .filter(Boolean);
      product.images = [...(product.images || []), ...newImages];
    }

    // Update text / numeric fields
    const allowedFields = [
      "name",
      "price",
      "originalPrice",
      "category",
      "brand",
      "color",
      "stock",
      "description",
      "rating",
      "sold",
      "availability",
      "features",
      "specifications",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "price" || field === "originalPrice" || field === "stock" || field === "rating" || field === "sold") {
          product[field] = Number(req.body[field]);
        } else if (field === "features" || field === "specifications") {
          try {
            product[field] = typeof req.body[field] === "string" ? JSON.parse(req.body[field]) : req.body[field];
          } catch {
            product[field] = req.body[field];
          }
        } else {
          product[field] = req.body[field];
        }
      }
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Error in updateProduct:", err.message);
    res.status(400).json({ message: "Failed to update product", error: err.message });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Clean up any legacy disk files if applicable
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img.path && img.path.includes('/uploads/')) {
          deleteImageFile(img.path);
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error in deleteProduct:", err.message);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};