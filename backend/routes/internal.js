const router = require('express').Router();
const requireInternal = require('../middleware/internal');
const {
  processStreaks,
  captainRotation,
  computeAllCrewHealth,
  sparkFlow,
} = require('../controllers/internal.controller');

router.post('/process-streaks', requireInternal, processStreaks);
router.post('/captain-rotation', requireInternal, captainRotation);
router.post('/crew-health', requireInternal, computeAllCrewHealth);
router.post('/spark-flow', requireInternal, sparkFlow);

module.exports = router;
