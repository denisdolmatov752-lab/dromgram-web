const router = require('express').Router();
const ctrl = require('../controllers/calls.controller');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);
router.get('/', ctrl.getCalls);
router.post('/', ctrl.initiateCall);
router.put('/:id/accept', ctrl.acceptCall);
router.put('/:id/decline', ctrl.declineCall);
router.put('/:id/end', ctrl.endCall);
module.exports = router;
