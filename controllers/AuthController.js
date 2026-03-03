import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";

// Token creation helper
const createToken = (email, role, userId, rememberMe) => {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // in seconds
  return jwt.sign(
    { email, role, userId },
    process.env.JWT_KEY,
    { expiresIn: maxAge }
  );
};

// Password comparison helper
const comparePasswords = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare passwords
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = createToken(user.email, user.role, user._id, rememberMe);
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    // Set secure HTTP-only cookie
    // In production, use 'none' for cross-domain, in development use 'lax'
    const sameSiteSetting = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
    res.cookie('jwt', token, {
      maxAge,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: sameSiteSetting,
      path: '/'
    });

    // Return user data (excluding sensitive information)
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      token:token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    // Clear the JWT cookie
    const sameSiteSetting = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: sameSiteSetting,
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during logout'
    });
  }
};


// Helper function to validate admin creation data
const validateAdminData = (data) => {
  const errors = [];
  
  if (!data.username || typeof data.username !== 'string' || data.username.trim().length < 3) {
    errors.push('Username is required and must be at least 3 characters');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Valid email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Please provide a valid email address');
    }
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 8) {
    errors.push('Password is required and must be at least 8 characters');
  }

  return errors.length > 0 ? errors : null;
};

// Create admin user (protected route - only accessible by existing admins)
export const createAdmin = async (req, res) => {
  try {
    // Verify requester is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Unauthorized: Only admins can create new admin accounts'
    //   });
    // }

    // Validate input
    const validationErrors = validateAdminData(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { username, email, password } = req.body;
    
    console.log('Creating admin with:', { username, email, passwordLength: password?.length });

    // Check if username or email already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
        field: existingUser.username === username ? 'username' : 'email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const newAdmin = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'admin'
    });

    // Return response without sensitive data
    return res.status(201).json({
      success: true,
      user: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        field: field
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    // Return detailed error in development, generic in production
    return res.status(500).json({
      success: false,
      message: 'Failed to create admin account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};