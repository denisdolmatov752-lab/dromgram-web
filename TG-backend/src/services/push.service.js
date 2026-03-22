const logger = require('../config/logger');
let admin;

function getAdmin() {
  if (!admin) {
    try {
      admin = require('firebase-admin');
      if (!admin.apps.length) {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (serviceAccount) {
          admin.initializeApp({ credential: admin.credential.cert(require(serviceAccount)) });
        }
      }
    } catch (e) {
      logger.warn('Firebase not configured:', e.message);
      admin = null;
    }
  }
  return admin;
}

async function sendPushNotification(fcmToken, title, body, data = {}) {
  const fb = getAdmin();
  if (!fb || !fcmToken) return;
  try {
    await fb.messaging().send({ token: fcmToken, notification: { title, body }, data, android: { priority: 'high' } });
  } catch (err) {
    logger.error('Push notification error:', err);
  }
}

module.exports = { sendPushNotification };
