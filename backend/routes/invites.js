const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { createInvite, getInvite, claimInvite } = require('../controllers/invites.controller');

// Create invite — pact owner only (enforced in controller)
router.post('/', requireAuth, createInvite);
// Public lookup — no auth needed (witness and pre-login flow)
router.get('/:token', getInvite);
// Claim — must be signed in; sets pacts.partner_id
router.post('/:token/claim', requireAuth, claimInvite);

module.exports = router;
