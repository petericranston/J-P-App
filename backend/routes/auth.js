const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { me } = require('../controllers/auth.controller');

router.get('/me', requireAuth, me);

module.exports = router;
