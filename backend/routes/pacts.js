const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const { createPact, getMyPacts, getPact } = require('../controllers/pacts.controller');

router.post('/', requireAuth, createPact);
router.get('/', requireAuth, getMyPacts);
router.get('/:pactId', requireAuth, getPact);

module.exports = router;
