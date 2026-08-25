import { isAuthenticated } from '../services/authServices';
import { getWishlist, toggleWishlist as apiToggleWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../services/wishlistServices';

const WISHLIST_STORAGE_KEY = 'lovelytech_wishlist_ids';

export const getWishlistIds = () => {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) {
      return new Set();
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map(String));
    }
    return new Set();
  } catch {
    return new Set();
  }
};

export const saveWishlistIds = (idSet) => {
  try {
    const arr = Array.from(idSet).map(String);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: arr }));
  } catch (err) {
    console.error('Error saving wishlist:', err);
  }
};

export const isProductWishlisted = (productId) => {
  if (!productId) return false;
  const ids = getWishlistIds();
  return ids.has(String(productId));
};

export const toggleWishlistProduct = async (productId) => {
  if (!productId) return false;
  const ids = getWishlistIds();
  const idStr = String(productId);
  let isAdded = false;

  if (ids.has(idStr)) {
    ids.delete(idStr);
    isAdded = false;
  } else {
    ids.add(idStr);
    isAdded = true;
  }

  saveWishlistIds(ids);

  // If logged in, sync change to backend asynchronously
  if (isAuthenticated()) {
    try {
      await apiToggleWishlist(productId);
    } catch (err) {
      console.error('Failed to sync wishlist with backend:', err);
    }
  }

  return isAdded;
};

export const removeWishlistProduct = async (productId) => {
  if (!productId) return false;
  const ids = getWishlistIds();
  const idStr = String(productId);

  if (ids.has(idStr)) {
    ids.delete(idStr);
    saveWishlistIds(ids);
  }

  if (isAuthenticated()) {
    try {
      await apiRemoveFromWishlist(productId);
    } catch (err) {
      console.error('Failed to remove from backend wishlist:', err);
    }
  }

  return true;
};

export const syncWishlistWithBackend = async () => {
  if (!isAuthenticated()) return getWishlistIds();

  try {
    const response = await getWishlist();
    const serverProducts = response?.wishlist || [];
    const serverIds = new Set(serverProducts.map((p) => String(p._id || p.id)));
    saveWishlistIds(serverIds);
    return serverIds;
  } catch (err) {
    console.error('Error syncing wishlist with backend:', err);
    return getWishlistIds();
  }
};

export const getWishlistProducts = () => [];
