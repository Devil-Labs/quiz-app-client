import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import adminRoutes from './routes/admin';
import quizRoutes from './routes/quiz';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. HTTP Security Headers (Helmet)
app.use(helmet());

// 2. Restrict CORS (Only allow trusted domains)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 3. Body Parsing & Size Limit (Prevent large payloads)
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Rate Limiting (Prevent Brute Force)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use('/api', globalLimiter); // Apply to all API routes

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', quizRoutes);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz-app';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB via Mongoose'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Secure Server running on port ${PORT}`);
});
