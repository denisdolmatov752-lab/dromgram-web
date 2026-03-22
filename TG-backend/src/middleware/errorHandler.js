const logger = require('../config/logger');

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message) { super(message, 400, 'VALIDATION_ERROR'); }
}
class AuthenticationError extends AppError {
  constructor(message = 'Не авторизован') { super(message, 401, 'AUTH_ERROR'); }
}
class ForbiddenError extends AppError {
  constructor(message = 'Доступ запрещён') { super(message, 403, 'FORBIDDEN'); }
}
class NotFoundError extends AppError {
  constructor(message = 'Не найдено') { super(message, 404, 'NOT_FOUND'); }
}
class ConflictError extends AppError {
  constructor(message) { super(message, 409, 'CONFLICT'); }
}

function errorHandler(err, req, res, next) {
  logger.error('Error:', { message: err.message, stack: err.stack, url: req.url, method: req.method });

  if (err.isOperational) {
    return res.status(err.statusCode).json({ success: false, error: err.message, code: err.code });
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return res.status(400).json({ success: false, error: message, code: 'VALIDATION_ERROR' });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, error: 'Запись уже существует', code: 'CONFLICT' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, error: 'Запись не найдена', code: 'NOT_FOUND' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Недействительный токен', code: 'INVALID_TOKEN' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Токен истёк', code: 'TOKEN_EXPIRED' });
  }

  // Production: hide details
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера', code: 'INTERNAL_ERROR' });
  }

  return res.status(500).json({ success: false, error: err.message, code: 'INTERNAL_ERROR', stack: err.stack });
}

module.exports = { errorHandler, AppError, ValidationError, AuthenticationError, ForbiddenError, NotFoundError, ConflictError };
