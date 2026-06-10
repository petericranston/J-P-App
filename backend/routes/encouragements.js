const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { sendEncouragement } = require('../controllers/encouragements.controller');

router.post('/', requireAuth, sendEncouragement);

module.exports = router;
