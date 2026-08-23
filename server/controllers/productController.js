import mongoose from "mongoose";
import Product from "../models/Product.js";
import { uploadImage, deleteImageFile } from "../middlewares/imageUploader.js";
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
// Expects multipart/form-data — text fields + up to 5 files under "images"
export const createProduct = async (req, res) => {
  try {
    const files = req.files || [];
    const images = files.map((file) => uploadImage(file, req, "products"));

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
// Expects multipart/form-data — text fields + new images, or JSON
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Handle image removals requested by client
    if (req.body.removeImages) {
      const toRemove = Array.isArray(req.body.removeImages)
        ? req.body.removeImages
        : [req.body.removeImages];
      for (const imgPath of toRemove) {
        deleteImageFile(imgPath);
        product.images = product.images.filter((img) => img.path !== imgPath);
      }
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => uploadImage(file, req, "products"));
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

    // Clean up images on disk
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => deleteImageFile(img.path));
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error in deleteProduct:", err.message);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};