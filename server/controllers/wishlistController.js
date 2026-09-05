import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

const wishlistCache = new Map();
const WISHLIST_CACHE_TTL = 60 * 1000;

const getWishlistCache = (userId) => {
  const cached = wishlistCache.get(String(userId));
  if (cached && Date.now() - cached.time < WISHLIST_CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setWishlistCache = (userId, data) => {
  wishlistCache.set(String(userId), { time: Date.now(), data });
};

const clearUserWishlistCache = (userId) => {
  wishlistCache.delete(String(userId));
};

const POPULATE_OPTIONS = {
  path: 'products',
  select: 'name price originalPrice category brand color stock rating sold availability numReviews isActive images',
};

// GET /api/wishlist - Get current user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const cached = getWishlistCache(userId);
    if (cached) {
      return res.status(200).json(cached);
    }

    let wishlist = await Wishlist.findOne({ user: userId })
      .populate(POPULATE_OPTIONS)
      .lean();

    if (!wishlist) {
      const created = await Wishlist.create({ user: userId, products: [] });
      wishlist = created.toObject();
    }

    // Filter out any populated items that might be null
    const validProducts = (wishlist.products || []).filter(Boolean);

    const result = {
      success: true,
      wishlist: validProducts,
      totalItems: validProducts.length,
    };

    setWishlistCache(userId, result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message,
    });
  }
};

// POST /api/wishlist/toggle - Toggle a product in the user's wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;
    const cleanId = String(productId || '').trim();

    if (!cleanId || !mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Check if product exists
    const product = await Product.findById(cleanId).lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    const objId = new mongoose.Types.ObjectId(cleanId);
    const existingIndex = wishlist.products.findIndex(
      (p) => String(p?._id || p) === cleanId
    );

    let isAdded = false;

    if (existingIndex > -1) {
      // Remove product
      wishlist.products.splice(existingIndex, 1);
      isAdded = false;
    } else {
      // Add product
      wishlist.products.push(objId);
      isAdded = true;
    }

    await wishlist.save();
    clearUserWishlistCache(userId);

    // Populate for response
    await wishlist.populate(POPULATE_OPTIONS);

    const validProducts = (wishlist.products || []).filter(Boolean);

    const result = {
      success: true,
      isAdded,
      message: isAdded ? 'Added to wishlist' : 'Removed from wishlist',
      wishlist: validProducts,
      totalItems: validProducts.length,
    };

    setWishlistCache(userId, result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error toggling wishlist item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist',
      error: error.message,
    });
  }
};

// POST /api/wishlist/add - Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;
    const cleanId = String(productId || '').trim();

    if (!cleanId || !mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(cleanId).lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    const objId = new mongoose.Types.ObjectId(cleanId);
    const existingIndex = wishlist.products.findIndex(
      (p) => String(p?._id || p) === cleanId
    );

    if (existingIndex === -1) {
      wishlist.products.push(objId);
      await wishlist.save();
    }

    clearUserWishlistCache(userId);
    await wishlist.populate(POPULATE_OPTIONS);

    const validProducts = (wishlist.products || []).filter(Boolean);

    const result = {
      success: true,
      message: 'Product added to wishlist',
      wishlist: validProducts,
      totalItems: validProducts.length,
    };

    setWishlistCache(userId, result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: error.message,
    });
  }
};

// DELETE /api/wishlist/remove/:productId - Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const cleanId = String(productId || '').trim();

    if (!cleanId || !mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      const existingIndex = wishlist.products.findIndex(
        (p) => String(p?._id || p) === cleanId
      );
      if (existingIndex > -1) {
        wishlist.products.splice(existingIndex, 1);
        await wishlist.save();
      }
      await wishlist.populate(POPULATE_OPTIONS);
    }

    clearUserWishlistCache(userId);

    const validProducts = (wishlist?.products || []).filter(Boolean);

    const result = {
      success: true,
      message: 'Product removed from wishlist',
      wishlist: validProducts,
      totalItems: validProducts.length,
    };

    setWishlistCache(userId, result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: error.message,
    });
  }
};

// DELETE /api/wishlist/clear - Clear all products from wishlist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    await Wishlist.findOneAndUpdate(
      { user: userId },
      { $set: { products: [] } },
      { new: true, upsert: true }
    );

    clearUserWishlistCache(userId);

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlist: [],
      totalItems: 0,
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message,
    });
  }
};
