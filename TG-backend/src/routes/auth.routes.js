const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateJWT } = require('../middleware/auth');

router.post('/send-code', authLimiter, ctrl.sendCode);
router.post('/verify-code', ctrl.verifyCode);
router.post('/register', authenticateJWT, ctrl.register);
router.post('/logout', authenticateJWT, ctrl.logout);
router.post('/logout-all', authenticateJWT, ctrl.logoutAll);
router.get('/qr', ctrl.getQr);
router.post('/qr/verify', authenticateJWT, ctrl.verifyQr);
module.exports = router;
