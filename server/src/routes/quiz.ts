import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import QuizResult from '../models/QuizResult';
import { z } from 'zod';

const router = Router();

// Nodemailer config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'test',
    pass: process.env.SMTP_PASS || 'test'
  }
});

// POST /api/start - Track start & notify admin & verify CAPTCHA
const startSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  captchaToken: z.string().optional() // Mock CAPTCHA
});

router.post('/start', async (req: Request, res: Response): Promise<any> => {
  try {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success || (process.env.NODE_ENV === 'production' && !parsed.data.captchaToken)) {
      return res.status(400).json({ error: 'Invalid input or missing CAPTCHA' });
    }

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.socket.remoteAddress || 'Unknown IP';
    const userPayload = parsed.data;

    // Send email alert to admin
    transporter.sendMail({
      from: '"Quiz App" <noreply@quiz.local>',
      to: process.env.ADMIN_EMAIL || 'admin@quiz.local',
      subject: `New Quiz Attempt: ${userPayload.name}`,
      text: `User ${userPayload.name} (${userPayload.email}, ${userPayload.phone}) has started a quiz.\n\nIP: ${ip}\nDevice: ${userAgent}`
    }).catch(err => console.error('Failed to send admin email alert:', err));

    res.json({ message: 'Quiz started' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/results - Save user quiz result
router.post('/results', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone, score } = req.body;
    
    if (!name || !email || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = new QuizResult({ name, email, phone, score });
    await result.save();

    res.status(201).json({ message: 'Result saved successfully', result });
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/leaderboard - Fetch top users in real-time
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    // Highly efficient querying using the `score: -1` index defined in Mongoose
    const topResults = await QuizResult.find()
      .sort({ score: -1, createdAt: 1 })
      .limit(50)
      .lean();

    // Map output to provide ranks safely without exposing DB IDs or emails (for privacy)
    const sanitized = topResults.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      score: r.score
    }));

    res.json(sanitized);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

import AuditLog from '../models/AuditLog';

// POST /api/audit - Endpoint for saving suspicious events and behavior logs
router.post('/audit', async (req: Request, res: Response) => {
  try {
    const { eventType, user, details } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // Save to the 30-day TTL Audit Log DB
    const log = new AuditLog({ eventType, user, ip, userAgent, details });
    await log.save();
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error logging audit' });
  }
});

export default router;
