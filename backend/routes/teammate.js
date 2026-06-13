const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { getScore, getCrewBalance } = require('../controllers/teammate.controller');

router.get('/score', requireAuth, getScore);
router.get('/balance', requireAuth, getCrewBalance);

module.exports = router;
