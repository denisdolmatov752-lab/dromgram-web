const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

function normalizePhone(phone) {
  try {
    const parsed = parsePhoneNumber(phone, 'RU');
    return parsed.format('E.164');
  } catch {
    return phone.replace(/[^\d+]/g, '');
  }
}

function validatePhone(phone) {
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
}

module.exports = { normalizePhone, validatePhone };
