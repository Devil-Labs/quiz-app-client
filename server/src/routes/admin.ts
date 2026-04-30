import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { verifyAdminToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Zod schemas for input validation against SQL/NoSQL Injection
const loginSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8)
});

// Strict rate limit for login attempts (10 requests per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-replace-me-in-prod';

// Mock DB - usually fetched natively using an ORM/Driver and parameterized queries
let adminHash = '';
bcrypt.hash('AdminP@ssw0rd!', 12).then((h) => adminHash = h); 

router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Input Validation
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    const { username, password } = parsed.data;

    // 2. Mocking DB lookup (No Direct DB Exposure)
    if (username !== 'admin') {
      // Prevent timing attacks by hashing even if user fails
      await bcrypt.compare(password, adminHash);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Password Verification
    const isMatch = await bcrypt.compare(password, adminHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. JWT Generation
    const token = jwt.sign({ id: '1', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, message: 'Logged in securely' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Protected route snippet
router.get('/dashboard', verifyAdminToken, (req: AuthRequest, res: Response) => {
  res.json({ data: 'Secure Admin Dashboard Data', user: req.user });
});

export default router;
