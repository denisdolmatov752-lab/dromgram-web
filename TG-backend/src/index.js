require('dotenv').config();
const { createServer } = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const { prisma } = require('./config/database');
const { redis } = require('./config/redis');
const logger = require('./config/logger');

const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);
initSocket(httpServer);

async function start() {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected');
    await redis.connect();
    logger.info('Redis connected');
    httpServer.listen(PORT, () => {
      logger.info(`DRomGram Backend running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  try {
    global.io?.close();
    httpServer.close();
    await prisma.$disconnect();
    await redis.quit();
    logger.info('Server shut down cleanly');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => { logger.error('Uncaught Exception:', err); process.exit(1); });
process.on('unhandledRejection', (reason) => { logger.error('Unhandled Rejection:', reason); process.exit(1); });

start();
