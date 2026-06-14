const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { getSummary, recommit } = require('../controllers/sprints.controller');

router.get('/summary', requireAuth, getSummary);
router.post('/recommit', requireAuth, recommit);

module.exports = router;
