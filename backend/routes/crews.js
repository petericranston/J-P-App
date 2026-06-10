const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { createCrew, getMyCrews, getCrew } = require('../controllers/crews.controller');

router.post('/', requireAuth, createCrew);
router.get('/', requireAuth, getMyCrews);
router.get('/:crewId', requireAuth, getCrew);

module.exports = router;
