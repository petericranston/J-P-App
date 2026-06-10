const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { getProfile, upsertProfile } = require('../controllers/profile.controller');

router.get('/', requireAuth, getProfile);
router.patch('/', requireAuth, upsertProfile);

module.exports = router;
