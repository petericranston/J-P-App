const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { getSummary, vote } = require('../controllers/sprints.controller');

router.get('/summary', requireAuth, getSummary);
router.post('/vote', requireAuth, vote);

module.exports = router;
