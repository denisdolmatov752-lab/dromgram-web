const router = require('express').Router();
const ctrl = require('../controllers/stories.controller');
const { authenticateJWT } = require('../middleware/auth');
const { uploadStory } = require('../middleware/upload');

router.use(authenticateJWT);
router.get('/', ctrl.getStories);
router.post('/', uploadStory, ctrl.createStory);
router.get('/:userId', ctrl.getUserStories);
router.delete('/:id', ctrl.deleteStory);
router.post('/:id/view', ctrl.viewStory);
router.get('/:id/views', ctrl.getViews);
module.exports = router;
