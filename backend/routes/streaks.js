const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { getStreak } = require('../controllers/streaks.controller');

router.get('/', requireAuth, getStreak);

module.exports = router;
