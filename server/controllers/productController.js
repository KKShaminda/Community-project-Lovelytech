import Product from "../models/Product.js";
import { uploadImage, deleteImageFile } from "../middlewares/imageUploader.js";

const CATEGORIES = [
  "Mobile Phones",
  "Laptops",
  "Desktops",
  "iPads & Tablets",
  "Speakers & Audios",
];

// Builds the Mongo filter object shared by the list + facet-count queries
const buildFilter = (query) => {
  const {
    category, // comma-separated list e.g. "Mobile Phones,Laptops"
    minPrice,
    maxPrice,
    minRating,
    inStock,
    search,
  } = query;

  const filter = { isActive: true };

  if (category) {
    filter.category = { $in: category.split(",") };
  }

  if (minPrice || maxPrice) {
    filter.sellPrice = {};
    if (minPrice) filter.sellPrice.$gte = Number(minPrice);
    if (maxPrice) filter.sellPrice.$lte = Number(maxPrice);
  }

  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  if (inStock === "true") {
    filter.stock = { $gt: 0 };
  } else if (inStock === "false") {
    filter.stock = { $lte: 0 };
  }

  if (search) {
    filter.$text = { $search: search };
  }

  return filter;
};

const SORT_OPTIONS = {
  None: { createdAt: -1 },
  "Price: Low to High": { sellPrice: 1 },
  "Price: High to Low": { sellPrice: -1 },
  "Best Selling": { sold: -1 },
  "Top Rated": { rating: -1 },
  Newest: { createdAt: -1 },
};

// GET /api/products
// Supports: ?category=&minPrice=&maxPrice=&minRating=&inStock=&search=&sort=&page=&limit=
export const getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 9, 1);
    const skip = (page - 1) * limit;

    const filter = buildFilter(req.query);
    const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.None;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// GET /api/products/facets
// Returns category counts + rating counts + min/max price for the sidebar filters,
// respecting whatever filters are already applied (except the facet's own dimension).
export const getProductFacets = async (req, res) => {
  try {
    const baseFilter = buildFilter(req.query);

    const categoryCounts = await Promise.all(
      CATEGORIES.map(async (cat) => {
        const count = await Product.countDocuments({ ...baseFilter, category: cat });
        return { category: cat, count };
      })
    );

    const ratingBuckets = [5, 4, 3];
    const ratingCounts = await Promise.all(
      ratingBuckets.map(async (star) => {
        const count = await Product.countDocuments({
          ...baseFilter,
          rating: { $gte: star, $lt: star + 1 === 6 ? 6 : star + 1 },
        });
        return { rating: star, count };
      })
    );

    const priceStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          min: { $min: "$sellPrice" },
          max: { $max: "$sellPrice" },
        },
      },
    ]);

    res.json({
      categories: categoryCounts,
      ratings: ratingCounts,
      priceRange: priceStats[0] || { min: 0, max: 0 },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch facets", error: err.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
};

// POST /api/products
// Expects multipart/form-data — text fields + up to 5 files under "images"
export const createProduct = async (req, res) => {
  try {
    const files = req.files || [];
    const images = files.map((file) => uploadImage(file, req, "products"));

    const payload = { ...req.body, images };

    if (payload.price !== undefined && payload.sellPrice === undefined) {
      payload.sellPrice = payload.price;
    }

    if (payload.buyPrice !== undefined) payload.buyPrice = Number(payload.buyPrice);
    if (payload.sellPrice !== undefined) payload.sellPrice = Number(payload.sellPrice);
    delete payload.price;

    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to create product", error: err.message });
  }
};

// PUT /api/products/:id
// Text fields update normally. New files (if any) are appended to the existing
// images. Send removeImages: [filename, ...] in the body to delete specific
// images from the file system and the product.
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { removeImages, ...fields } = req.body;

    if (fields.price !== undefined && fields.sellPrice === undefined) {
      fields.sellPrice = fields.price;
    }

    if (fields.buyPrice !== undefined) fields.buyPrice = Number(fields.buyPrice);
    if (fields.sellPrice !== undefined) fields.sellPrice = Number(fields.sellPrice);
    delete fields.price;

    if (removeImages) {
      const idsToRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
      product.images = product.images.filter((img) => {
        const shouldRemove =
          idsToRemove.includes(img.filename) ||
          idsToRemove.includes(img.path) ||
          idsToRemove.includes(img.url);

        if (shouldRemove) deleteImageFile(img.path);
        return !shouldRemove;
      });
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => uploadImage(file, req, "products"));
      product.images.push(...newImages);
    }

    Object.assign(product, fields);

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to update product", error: err.message });
  }
};

// DELETE /api/products/:id
// Removes the product's image files from disk before deleting the document.
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.images.forEach((img) => deleteImageFile(img.path));

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};