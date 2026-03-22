const router = require('express').Router();
const ctrl = require('../controllers/contacts.controller');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);
router.get('/', ctrl.getContacts);
router.post('/', ctrl.addContact);
router.put('/:id', ctrl.updateContact);
router.delete('/:id', ctrl.deleteContact);
router.get('/blocked', ctrl.getBlocked);
router.post('/block', ctrl.blockUser);
router.delete('/block/:userId', ctrl.unblockUser);
module.exports = router;
