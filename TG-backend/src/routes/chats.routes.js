const router = require('express').Router();
const ctrl = require('../controllers/chats.controller');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);
router.get('/', ctrl.getChats);
router.post('/private', ctrl.createPrivateChat);
router.get('/:id', ctrl.getChatById);
router.put('/:id/mute', ctrl.muteChat);
router.put('/:id/unmute', ctrl.unmuteChat);
router.put('/:id/pin', ctrl.pinChat);
router.put('/:id/unpin', ctrl.unpinChat);
router.put('/:id/archive', ctrl.archiveChat);
router.put('/:id/unarchive', ctrl.unarchiveChat);
router.delete('/:id', ctrl.deleteChat);
router.get('/:id/media', ctrl.getChatMedia);
router.get('/:id/docs', ctrl.getChatDocs);
module.exports = router;
