require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const logger = require('./config/logger');
const { globalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
app.use(globalLimiter);

// Static media
const mediaPath = process.env.MEDIA_PATH || '/var/dromgram/media';
app.use('/media', express.static(mediaPath, { maxAge: '30d' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), version: '1.0.0', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/contacts', require('./routes/contacts.routes'));
app.use('/api/chats', require('./routes/chats.routes'));
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/groups', require('./routes/groups.routes'));
app.use('/api/channels', require('./routes/channels.routes'));
app.use('/api/media', require('./routes/media.routes'));
app.use('/api/calls', require('./routes/calls.routes'));
app.use('/api/stickers', require('./routes/stickers.routes'));
app.use('/api/stories', require('./routes/stories.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/folders', require('./routes/folders.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/gifts', require('./routes/gifts.routes'));
app.use('/api/stars', require('./routes/stars.routes'));
app.use('/api/premium', require('./routes/premium.routes'));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Маршрут не найден', code: 'NOT_FOUND' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
