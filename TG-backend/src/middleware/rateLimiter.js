const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000,  // increased from 100 to 1000
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много запросов, попробуйте позже', code: 'RATE_LIMIT' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,  // increased from 5 to 50
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много попыток, подождите минуту', code: 'AUTH_RATE_LIMIT' }
});

// Alias for AI routes - more generous limit
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: 'Слишком много запросов к AI', code: 'AI_RATE_LIMIT' }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'Слишком много загрузок', code: 'UPLOAD_RATE_LIMIT' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: 'Слишком много запросов к AI', code: 'AI_RATE_LIMIT' }
});

module.exports = { globalLimiter, authLimiter, uploadLimiter, aiLimiter };
