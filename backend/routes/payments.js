const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { getSubscription, webhook } = require('../controllers/payments.controller');

router.get('/subscription', requireAuth, getSubscription);
// RevenueCat / App Store server webhook — no auth, verified by payload
router.post('/webhook', webhook);

module.exports = router;
