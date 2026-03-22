const router = require('express').Router();
const { search } = require('../controllers/search.controller');
const { authenticateJWT } = require('../middleware/auth');
router.use(authenticateJWT);
router.get('/', search);
module.exports = router;
