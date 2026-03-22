const router = require('express').Router();
const ctrl = require('../controllers/messages.controller');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);
router.get('/search', ctrl.searchMessages);
router.get('/:chatId', ctrl.getMessages);
router.post('/', ctrl.sendMessage);
router.put('/:id', ctrl.editMessage);
router.delete('/:id', ctrl.deleteMessage);
router.post('/:id/read', ctrl.markRead);
router.post('/:id/react', ctrl.addReaction);
router.delete('/:id/react', ctrl.removeReaction);
router.post('/:id/pin', ctrl.pinMessage);
router.delete('/:id/pin', ctrl.unpinMessage);
module.exports = router;
