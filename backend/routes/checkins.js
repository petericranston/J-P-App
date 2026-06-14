const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { submitCheckin, getFeed, addReaction, removeReaction } = require('../controllers/checkins.controller');

router.post('/', requireAuth, submitCheckin);
router.get('/feed', requireAuth, getFeed);
router.post('/:checkinId/reactions', requireAuth, addReaction);
router.delete('/:checkinId/reactions/:emoji', requireAuth, removeReaction);

module.exports = router;
