const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много запросов, попробуйте позже', code: 'RATE_LIMIT' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Слишком много попыток, подождите минуту', code: 'AUTH_RATE_LIMIT' }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'Слишком много загрузок', code: 'UPLOAD_RATE_LIMIT' }
});

module.exports = { globalLimiter, authLimiter, uploadLimiter };
