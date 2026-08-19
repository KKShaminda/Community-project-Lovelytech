import express from 'express';
import { register, login, getAllUsers, suspendUser, unsuspendUser } from '../controllers/userController.js';
import { requiredSignIn, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', requiredSignIn, isAdmin, getAllUsers);
router.patch('/:userId/suspend', requiredSignIn, isAdmin, suspendUser);
router.patch('/:userId/unsuspend', requiredSignIn, isAdmin, unsuspendUser);

export default router;