import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get all users (Admin only)
export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new user (Admin only)
export const createUser = async (req, res) => {
    const { username, email, password, role, bio, jobTitle } = req.body;

    try {
        // Only a real admin can assign the 'admin' role
        const requestedRole = role || 'user';
        if (requestedRole === 'admin' && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create admin accounts.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: requestedRole,
            bio,
            jobTitle
        });

        await newUser.save();

        res.status(201).json({ message: "User created successfully", user: { ...newUser._doc, password: "" } });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Update user (Admin only)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Prevent role escalation to 'admin' by non-admins
        if (updates.role === 'admin' && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can promote users to admin role.' });
        }

        // Hash password if provided
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
