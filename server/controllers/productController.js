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

// Server-side response cache
const serverCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

const getCache = (key) => {
  const cached = serverCache.get(key);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  serverCache.set(key, { time: Date.now(), data });
};

export const clearServerProductCache = () => {
  serverCache.clear();
};

// GET /api/products
// Supports: category, minPrice, maxPrice, minRating, inStock, search, sort, page, limit
export const getProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 9);
    const skip = (page - 1) * limit;

    const cacheKey = `products_${JSON.stringify(req.query)}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const filter = buildFilter(req.query);
    const sort = buildSort(req.query.sort);

    // Project only listing fields and slice images to 1 for fast network response
    const [products, totalItems] = await Promise.all([
      Product.find(filter, {
        name: 1,
        price: 1,
        originalPrice: 1,
        category: 1,
        brand: 1,
        color: 1,
        stock: 1,
        rating: 1,
        sold: 1,
        availability: 1,
        numReviews: 1,
        isActive: 1,
        images: { $slice: 1 },
      })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    const result = {
      products,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error("Error in getProducts:", err.message);
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// GET /api/products/facets
// Returns dynamic counts per category and rating, and the current price range min/max
export const getProductFacets = async (req, res) => {
  try {
    const cacheKey = "facets";
    const cachedFacets = getCache(cacheKey);
    if (cachedFacets) {
      return res.json(cachedFacets);
    }

    const baseFilter = { isActive: { $ne: false } };

    const [facetResult] = await Product.aggregate([
      { $match: baseFilter },
      {
        $facet: {
          categories: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { category: "$_id", count: 1, _id: 0 } },
          ],
          ratings: [
            {
              $group: {
                _id: null,
                r5: { $sum: { $cond: [{ $gte: ["$rating", 5] }, 1, 0] } },
                r4: { $sum: { $cond: [{ $gte: ["$rating", 4] }, 1, 0] } },
                r3: { $sum: { $cond: [{ $gte: ["$rating", 3] }, 1, 0] } },
              },
            },
          ],
          priceRange: [
            {
              $group: {
                _id: null,
                min: { $min: "$price" },
                max: { $max: "$price" },
              },
            },
          ],
        },
      },
    ]);

    const catMap = new Map((facetResult?.categories || []).map((c) => [c.category, c.count]));
    const categoryCounts = CATEGORIES.map((cat) => ({
      category: cat,
      count: catMap.get(cat) || 0,
    }));

    const rObj = facetResult?.ratings?.[0] || {};
    const ratingCounts = [
      { rating: 5, count: rObj.r5 || 0 },
      { rating: 4, count: rObj.r4 || 0 },
      { rating: 3, count: rObj.r3 || 0 },
    ];

    const pObj = facetResult?.priceRange?.[0] || {};
    const priceRange = {
      min: pObj.min !== undefined ? pObj.min : 0,
      max: pObj.max !== undefined ? pObj.max : 600000,
    };

    const result = {
      categories: categoryCounts,
      ratings: ratingCounts,
      priceRange,
    };

    setCache(cacheKey, result);
    res.json(result);
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

    const cacheKey = `product_${id}`;
    const cachedProduct = getCache(cacheKey);
    if (cachedProduct) {
      return res.status(200).json(cachedProduct);
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

    setCache(cacheKey, product);
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
    clearServerProductCache();

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
    clearServerProductCache();
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
    clearServerProductCache();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error in deleteProduct:", err.message);
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};