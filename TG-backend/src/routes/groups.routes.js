const router = require('express').Router();
const ctrl = require('../controllers/groups.controller');
const { authenticateJWT } = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');

router.use(authenticateJWT);
router.post('/', ctrl.createGroup);
router.get('/:id', ctrl.getGroup);
router.put('/:id', ctrl.updateGroup);
router.post('/:id/members', ctrl.addMember);
router.delete('/:id/members/:userId', ctrl.removeMember);
router.put('/:id/members/:userId/role', ctrl.updateMemberRole);
router.post('/:id/leave', ctrl.leaveGroup);
router.post('/:id/avatar', uploadMedia, ctrl.uploadGroupAvatar);
router.get('/:id/invite', ctrl.getInviteLink);
router.post('/join/:code', ctrl.joinByInvite);
module.exports = router;
