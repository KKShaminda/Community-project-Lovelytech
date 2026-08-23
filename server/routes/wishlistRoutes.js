import express from 'express';
import {
  getWishlist,
  toggleWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlistController.js';
import { requiredSignIn } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All wishlist actions require user authentication
router.use(requiredSignIn);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.post('/add', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);
router.delete('/clear', clearWishlist);

export default router;
