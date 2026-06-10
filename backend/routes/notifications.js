const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { registerPushToken, getPrefs, updatePrefs } = require('../controllers/notifications.controller');

router.post('/register', requireAuth, registerPushToken);
router.get('/prefs', requireAuth, getPrefs);
router.patch('/prefs', requireAuth, updatePrefs);

module.exports = router;
