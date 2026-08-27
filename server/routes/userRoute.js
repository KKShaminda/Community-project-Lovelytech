import express from 'express';
import {
	register,
	login,
	getAllUsers,
	suspendUser,
	unsuspendUser,
	viewProfile,
	updateProfile,
	updateProfilePicture,
	deleteProfilePicture,
	changePassword,
	getAddresses,
	addAddress,
	updateAddress,
	deleteAddress,
	setDefaultAddress,
} from '../controllers/userController.js';
import { requiredSignIn, isAdmin } from '../middlewares/authMiddleware.js';
import { uploadProfilePicture } from '../middlewares/imageUploader.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', requiredSignIn, viewProfile);
router.put('/update-profile', requiredSignIn, updateProfile);
router.put('/update-profile-picture', requiredSignIn, uploadProfilePicture, updateProfilePicture);
router.delete('/delete-profile-picture', requiredSignIn, deleteProfilePicture);
router.put('/change-password', requiredSignIn, changePassword);
router.get('/addresses', requiredSignIn, getAddresses);
router.post('/addresses', requiredSignIn, addAddress);
router.put('/addresses/:addressId', requiredSignIn, updateAddress);
router.delete('/addresses/:addressId', requiredSignIn, deleteAddress);
router.patch('/addresses/:addressId/default', requiredSignIn, setDefaultAddress);
router.get('/', requiredSignIn, isAdmin, getAllUsers);
router.patch('/:userId/suspend', requiredSignIn, isAdmin, suspendUser);
router.patch('/:userId/unsuspend', requiredSignIn, isAdmin, unsuspendUser);

export default router;