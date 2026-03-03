import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Import Routes
import authRoutes from './routes/AuthRoutes.js';
import contactRoutes from './routes/Contact.js';
import reservationRoutes from './routes/Reservations.js';
import flightRoutes from './routes/Flights.js';
import dashboardRoutes from './routes/Dashboard.js';
import reviewsRoutes from './routes/Reviews.js';
import blogPostsRoutes from './routes/BlogPosts.js';
import userRoutes from './routes/Users.js';
import categoryRoutes from './routes/Categories.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = (process.env.ORIGIN || 'http://localhost:3000').split(',').map(origin => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Routes
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ... (existing imports)

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/posts', blogPostsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[Error] ${statusCode} - ${message}`);
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Database Connection
const connect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('mongoDB disconnected');
});

// Start Server
app.listen(PORT, () => {
  connect();
  console.log(`Server running on port ${PORT}`);
});
