import express from 'express';
import {
  register,
  login,
  logout,
  viewProfile,
  updateProfile,
  changePassword,
  updatePhone,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  getAllUsers,
  suspendUser,
  unsuspendUser,
} from '../controllers/userController.js';
import { requiredSignIn, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/profile', requiredSignIn, viewProfile);
router.put('/profile', requiredSignIn, updateProfile);
router.put('/change-password', requiredSignIn, changePassword);
router.put('/phone', requiredSignIn, updatePhone);

router.get('/addresses', requiredSignIn, getAddresses);
router.post('/addresses', requiredSignIn, addAddress);
router.put('/addresses/:addressId', requiredSignIn, updateAddress);
router.delete('/addresses/:addressId', requiredSignIn, deleteAddress);

router.get('/', requiredSignIn, isAdmin, getAllUsers);
router.put('/:userId/suspend', requiredSignIn, isAdmin, suspendUser);
router.put('/:userId/unsuspend', requiredSignIn, isAdmin, unsuspendUser);

export default router;