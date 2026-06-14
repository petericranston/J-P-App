const router = require('express').Router();
const requireInternal = require('../middleware/internal');
const { processStreaks, processSprintEnds, sparkFlow } = require('../controllers/internal.controller');

router.post('/process-streaks', requireInternal, processStreaks);
router.post('/process-sprint-ends', requireInternal, processSprintEnds);
router.post('/spark-flow', requireInternal, sparkFlow);

module.exports = router;
