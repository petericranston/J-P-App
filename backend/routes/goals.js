const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { createGoal, getMyGoals, getGoal } = require('../controllers/goals.controller');

router.post('/', requireAuth, createGoal);
router.get('/', requireAuth, getMyGoals);
router.get('/:goalId', requireAuth, getGoal);

module.exports = router;
