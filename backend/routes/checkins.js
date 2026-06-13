const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const {
  submitCheckin,
  getCrewFeed,
  addReaction,
  removeReaction,
} = require('../controllers/checkins.controller');

router.post('/', requireAuth, submitCheckin);
router.get('/feed', requireAuth, getCrewFeed);
router.post('/:checkinId/reactions', requireAuth, addReaction);
router.delete('/:checkinId/reactions/:emoji', requireAuth, removeReaction);

module.exports = router;
