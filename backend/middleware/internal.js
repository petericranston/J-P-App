const { INTERNAL_CRON_SECRET } = require('../config/env');

module.exports = function requireInternal(req, res, next) {
  const secret = req.headers['x-cron-secret'];

  if (!INTERNAL_CRON_SECRET || secret !== INTERNAL_CRON_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};
