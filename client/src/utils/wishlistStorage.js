import { isAuthenticated } from '../services/authServices';
import {
  getWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from '../services/wishlistServices';
import { resolveImageUrl, getCategoryFallbackImage } from '../data/productsData';

const WISHLIST_STORAGE_KEY = 'lovelytech_wishlist_ids';
const WISHLIST_ITEMS_CACHE_KEY = 'lovelytech_wishlist_items_cache';

export const normalizeWishlistItem = (p) => {
  if (!p) return null;
  const id = String(p._id || p.id || '');
  if (!id) return null;
  const category = p.category || 'Speakers & Audios';
  const rawImage =
    p.images?.[0]?.url ||
    p.images?.[0]?.path ||
    p.images?.[0] ||
    p.image ||
    getCategoryFallbackImage(category);

  return {
    ...p,
    id,
    _id: p._id || id,
    name: p.name || 'Product',
    image: resolveImageUrl(rawImage, category),
    category,
    price: Number(p.price || 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    rating: Number(p.rating || 5),
    sold: Number(p.sold || 0),
  };
};

export const getWishlistIds = () => {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) {
      return new Set();
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map(String).filter(Boolean));
    }
    return new Set();
  } catch {
    return new Set();
  }
};

export const saveWishlistIds = (idSet) => {
  try {
    const arr = Array.from(idSet).map(String).filter(Boolean);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(arr));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: arr }));
    }
  } catch (err) {
    console.error('Error saving wishlist IDs:', err);
  }
};

export const isProductWishlisted = (productId) => {
  if (!productId) return false;
  const cleanId = String(
    typeof productId === 'object' ? productId._id || productId.id || '' : productId
  ).trim();
  if (!cleanId) return false;
  const ids = getWishlistIds();
  return ids.has(cleanId);
};

export const getCachedWishlistItems = () => {
  try {
    const stored =
      localStorage.getItem(WISHLIST_ITEMS_CACHE_KEY) ||
      sessionStorage.getItem(WISHLIST_ITEMS_CACHE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeWishlistItem).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
};

export const saveCachedWishlistItems = (items = []) => {
  try {
    const normalized = (items || []).map(normalizeWishlistItem).filter(Boolean);
    const jsonStr = JSON.stringify(normalized);
    localStorage.setItem(WISHLIST_ITEMS_CACHE_KEY, jsonStr);
    sessionStorage.setItem(WISHLIST_ITEMS_CACHE_KEY, jsonStr);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('wishlist-items-updated', { detail: normalized })
      );
    }
  } catch (err) {
    console.error('Error caching wishlist items:', err);
  }
};

export const addWishlistProduct = async (productId, product = null) => {
  const cleanId = String(
    typeof productId === 'object' ? productId._id || productId.id || '' : productId || ''
  ).trim();
  if (!cleanId) return false;

  const ids = getWishlistIds();
  ids.add(cleanId);
  saveWishlistIds(ids);

  const cached = getCachedWishlistItems();
  const productToStore = product
    ? normalizeWishlistItem(product)
    : { id: cleanId, _id: cleanId, name: 'Product' };
  const filtered = cached.filter((item) => String(item.id || item._id) !== cleanId);
  const updatedItems = [productToStore, ...filtered];
  saveCachedWishlistItems(updatedItems);

  if (isAuthenticated()) {
    try {
      const response = await apiAddToWishlist(cleanId);
      if (response?.wishlist && Array.isArray(response.wishlist)) {
        const normalizedList = response.wishlist.map(normalizeWishlistItem).filter(Boolean);
        const map = new Map();
        normalizedList.forEach((p) => map.set(String(p.id), p));
        if (productToStore) {
          map.set(String(productToStore.id), productToStore);
        }
        const merged = Array.from(map.values());
        saveCachedWishlistItems(merged);
        const serverIds = new Set(merged.map((item) => String(item.id)));
        saveWishlistIds(serverIds);
      }
    } catch (err) {
      console.error('Failed to sync add to wishlist with backend:', err);
    }
  }

  return true;
};

export const removeWishlistProduct = async (productId) => {
  const cleanId = String(
    typeof productId === 'object' ? productId._id || productId.id || '' : productId || ''
  ).trim();
  if (!cleanId) return false;

  const ids = getWishlistIds();
  ids.delete(cleanId);
  saveWishlistIds(ids);

  const cached = getCachedWishlistItems();
  const filtered = cached.filter(
    (item) => String(item.id || item._id) !== cleanId
  );
  saveCachedWishlistItems(filtered);

  if (isAuthenticated()) {
    try {
      const response = await apiRemoveFromWishlist(cleanId);
      if (response?.wishlist && Array.isArray(response.wishlist)) {
        const normalizedList = response.wishlist
          .map(normalizeWishlistItem)
          .filter(Boolean)
          .filter((item) => String(item.id) !== cleanId);
        saveCachedWishlistItems(normalizedList);
        const serverIds = new Set(normalizedList.map((item) => String(item.id)));
        saveWishlistIds(serverIds);
      }
    } catch (err) {
      console.error('Failed to remove from backend wishlist:', err);
    }
  }

  return true;
};

export const toggleWishlistProduct = async (productId, product = null) => {
  const cleanId = String(
    typeof productId === 'object' ? productId._id || productId.id || '' : productId || ''
  ).trim();
  if (!cleanId) return false;

  const ids = getWishlistIds();
  const isCurrentlyInWishlist = ids.has(cleanId);

  if (isCurrentlyInWishlist) {
    await removeWishlistProduct(cleanId);
    return false;
  } else {
    await addWishlistProduct(cleanId, product);
    return true;
  }
};

export const syncWishlistWithBackend = async () => {
  if (!isAuthenticated()) {
    return getWishlistIds();
  }

  try {
    const response = await getWishlist();
    const rawList = response?.wishlist || [];
    const normalized = rawList.map(normalizeWishlistItem).filter(Boolean);

    saveCachedWishlistItems(normalized);
    const serverIds = new Set(normalized.map((item) => String(item.id)));
    saveWishlistIds(serverIds);
    return serverIds;
  } catch (err) {
    console.error('Error syncing wishlist with backend:', err);
    return getWishlistIds();
  }
};

export const clearWishlistLocal = () => {
  try {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
    localStorage.removeItem(WISHLIST_ITEMS_CACHE_KEY);
    sessionStorage.removeItem(WISHLIST_ITEMS_CACHE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: [] }));
      window.dispatchEvent(new CustomEvent('wishlist-items-updated', { detail: [] }));
    }
  } catch (err) {
    console.error('Error clearing local wishlist:', err);
  }
};

export const getWishlistProducts = () => getCachedWishlistItems();
