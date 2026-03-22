const bcrypt = require('bcrypt');
const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

async function hashPassword(password) {
  return bcrypt.hash(password, ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function hashCode(code) {
  return bcrypt.hash(code, 10);
}

async function compareCode(code, hash) {
  return bcrypt.compare(code, hash);
}

module.exports = { hashPassword, comparePassword, hashCode, compareCode };
