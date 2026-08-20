<<<<<<< HEAD
import express from 'express';
import {
  register,
  login,
  logout,
  viewProfile,
  updateProfile,
  changePassword,
  updatePhone,
  getAllUsers,
  getUsersByRole,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  suspendUser,
  unsuspendUser,
} from '../controllers/userController.js';
import { requiredSignIn, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Authenticated user profile routes
router.get('/profile', requiredSignIn, viewProfile);
router.put('/update-profile', requiredSignIn, updateProfile);
router.put('/change-password', requiredSignIn, changePassword);
router.put('/update-phone', requiredSignIn, updatePhone);

// Address management routes
router.get('/addresses', requiredSignIn, getAddresses);
router.post('/addresses', requiredSignIn, addAddress);
router.put('/addresses/:addressId', requiredSignIn, updateAddress);
router.delete('/addresses/:addressId', requiredSignIn, deleteAddress);

// Admin user management routes
router.get('/', requiredSignIn, isAdmin, getAllUsers);
router.get('/role/:role', requiredSignIn, isAdmin, getUsersByRole);
router.patch('/:userId/suspend', requiredSignIn, isAdmin, suspendUser);
router.patch('/:userId/unsuspend', requiredSignIn, isAdmin, unsuspendUser);

=======
import express from 'express';
import { register, login, getAllUsers, suspendUser, unsuspendUser } from '../controllers/userController.js';
import { requiredSignIn, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', requiredSignIn, isAdmin, getAllUsers);
router.patch('/:userId/suspend', requiredSignIn, isAdmin, suspendUser);
router.patch('/:userId/unsuspend', requiredSignIn, isAdmin, unsuspendUser);

>>>>>>> 20501282b1f059e730b954eec24bf8e68882c0d0
export default router;