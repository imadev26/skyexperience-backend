import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const createFirstAdmin = async () => {
  try {
    // Connect to database
    const dbUrl = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/skyexp';
    await mongoose.connect(dbUrl);
    console.log('Connected to database');

    // Get admin credentials from command line or use defaults
    const username = process.argv[2] || 'admin';
    const email = process.argv[3] || 'admin@skyexperience.com';
    const password = process.argv[4] || 'Admin123!';

    // Check if admin already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      console.log('❌ Admin user already exists!');
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Email: ${existingUser.email}`);
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const admin = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Please save these credentials securely!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createFirstAdmin();

