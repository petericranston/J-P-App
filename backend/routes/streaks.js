const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { getStreak, getCrewStreaks } = require('../controllers/streaks.controller');

// Own streak for a crew
router.get('/', requireAuth, getStreak);
// All members' streaks for a crew (for the crew screen)
router.get('/crew', requireAuth, getCrewStreaks);

module.exports = router;
