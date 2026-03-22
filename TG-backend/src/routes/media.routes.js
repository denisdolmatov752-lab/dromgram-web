const router = require('express').Router();
const ctrl = require('../controllers/media.controller');
const { authenticateJWT } = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.use(authenticateJWT);
router.post('/upload', uploadLimiter, uploadMedia, ctrl.uploadFile);
router.get('/:fileId', ctrl.getFile);
router.delete('/:fileId', ctrl.deleteFile);
module.exports = router;
