import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/UserController.js';
import { verifyToken, verifyAdmin } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

// Get all users
router.get('/', verifyToken, verifyAdmin, getUsers);

// Create user
router.post('/', verifyToken, verifyAdmin, createUser);

// Update user
router.put('/:id', verifyToken, verifyAdmin, updateUser); // Allow admin to update any user

// Delete user
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);

export default router;
