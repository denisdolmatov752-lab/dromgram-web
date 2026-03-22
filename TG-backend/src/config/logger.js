const winston = require('winston');
const path = require('path');

const logDir = process.env.LOG_PATH || '/var/log/dromgram';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    })
  ]
});

if (process.env.NODE_ENV === 'production') {
  try {
    const fs = require('fs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    logger.add(new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5
    }));
    logger.add(new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760,
      maxFiles: 10
    }));
  } catch (e) {
    console.error('Could not create log directory:', e.message);
  }
}

logger.stream = {
  write: (message) => logger.info(message.trim())
};

module.exports = logger;
