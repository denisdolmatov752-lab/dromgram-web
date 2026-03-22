const jwt = require('jsonwebtoken');
const { redis } = require('../config/redis');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

async function blacklistToken(token, ttl = 60 * 60 * 24 * 30) {
  try {
    await redis.setEx(`blacklist:${token}`, ttl, '1');
  } catch (err) {
    logger.error('Failed to blacklist token:', err);
  }
}

async function isBlacklisted(token) {
  try {
    const val = await redis.get(`blacklist:${token}`);
    return val !== null;
  } catch (err) {
    logger.error('Failed to check token blacklist:', err);
    return false;
  }
}

module.exports = { signToken, verifyToken, blacklistToken, isBlacklisted };
