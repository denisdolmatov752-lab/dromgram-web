const router = require('express').Router();
const ctrl = require('../controllers/channels.controller');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);
router.post('/', ctrl.createChannel);
router.get('/public', ctrl.searchPublic);
router.get('/:id', ctrl.getChannel);
router.put('/:id', ctrl.updateChannel);
router.post('/:id/subscribe', ctrl.subscribe);
router.delete('/:id/subscribe', ctrl.unsubscribe);
module.exports = router;
