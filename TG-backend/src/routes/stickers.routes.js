const router = require('express').Router();
const ctrl = require('../controllers/stickers.controller');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);
router.get('/sets', ctrl.getSets);
router.get('/recent', ctrl.getRecent);
router.get('/trending', ctrl.getTrending);
router.get('/sets/:id', ctrl.getSet);
module.exports = router;
