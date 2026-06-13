const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const requireCaptain = require('../middleware/requireCaptain');
const { createInvite, getInvite, acceptInvite } = require('../controllers/invites.controller');

// Create invite — captain of the crew only
router.post('/', requireAuth, requireCaptain, createInvite);
// Public lookup — no auth needed (so the invite screen can show crew name pre-login)
router.get('/:token', getInvite);
// Accept — must be signed in
router.post('/:token/accept', requireAuth, acceptInvite);

module.exports = router;
