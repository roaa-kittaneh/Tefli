require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const childRoutes = require('./routes/childRoutes');
const vaccineRoutes = require('./routes/vaccineRoutes');
const childVaccineRoutes = require('./routes/childVaccineRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');

// Error handler middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ==========================================================================
// SECURITY MIDDLEWARE
// ==========================================================================

// Set secure HTTP headers
app.use(helmet());

// Enable CORS for frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Global rate limiter — prevents brute-force and DoS attacks
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'لقد تجاوزت الحد الأقصى للطلبات. يرجى المحاولة مجدداً بعد 15 دقيقة.',
  },
});
app.use(globalLimiter);

// Stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'محاولات تسجيل دخول كثيرة. يرجى الانتظار 15 دقيقة قبل المحاولة مجدداً.',
  },
});

// ==========================================================================
// GENERAL MIDDLEWARE
// ==========================================================================

// HTTP request logger
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Compress responses
app.use(compression());

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================================================
// API HEALTH CHECK
// ==========================================================================

app.get('/api/health', (req, res) => {
  const hasGroqKey = !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here';
  res.status(200).json({
    success: true,
    message: 'الخادم يعمل بشكل طبيعي. ✅',
    groq_configured: hasGroqKey,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ==========================================================================
// API ROUTES
// ==========================================================================

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/children', childRoutes);
app.use('/api/vaccines', vaccineRoutes);
app.use('/api/child-vaccines', childVaccineRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/test', reminderRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/hospitals', hospitalRoutes);

// ==========================================================================
// 404 — Unknown Route Handler
// ==========================================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `المسار ${req.originalUrl} غير موجود في هذا الخادم.`,
  });
});

// ==========================================================================
// CENTRALIZED ERROR HANDLER
// ==========================================================================

app.use(errorHandler);

module.exports = app;
