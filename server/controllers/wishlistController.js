import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// GET /api/wishlist - Get current user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'products',
      match: { isActive: { $ne: false } },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    // Filter out any populated items that might be null (e.g. if a product was deleted)
    const validProducts = (wishlist.products || []).filter(Boolean);

    res.status(200).json({
      success: true,
      wishlist: validProducts,
      totalItems: validProducts.length,
    });
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

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
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

    const idStr = String(productId);
    const existingIndex = wishlist.products.findIndex(
      (p) => String(p._id || p) === idStr
    );

    let isAdded = false;

    if (existingIndex > -1) {
      // Remove product
      wishlist.products.splice(existingIndex, 1);
      isAdded = false;
    } else {
      // Add product
      wishlist.products.push(productId);
      isAdded = true;
    }

    await wishlist.save();

    // Populate for response
    await wishlist.populate({
      path: 'products',
      match: { isActive: { $ne: false } },
    });

    const validProducts = (wishlist.products || []).filter(Boolean);

    res.status(200).json({
      success: true,
      isAdded,
      message: isAdded ? 'Added to wishlist' : 'Removed from wishlist',
      wishlist: validProducts,
      totalItems: validProducts.length,
    });
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

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true }
    ).populate({
      path: 'products',
      match: { isActive: { $ne: false } },
    });

    const validProducts = (wishlist.products || []).filter(Boolean);

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: validProducts,
      totalItems: validProducts.length,
    });
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

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } },
      { new: true }
    ).populate({
      path: 'products',
      match: { isActive: { $ne: false } },
    });

    const validProducts = (wishlist?.products || []).filter(Boolean);

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: validProducts,
      totalItems: validProducts.length,
    });
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
