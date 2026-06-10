const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { getMyBadges, getBadge } = require('../controllers/badges.controller');

router.get('/', requireAuth, getMyBadges);
router.get('/:badgeId', requireAuth, getBadge);

module.exports = router;
