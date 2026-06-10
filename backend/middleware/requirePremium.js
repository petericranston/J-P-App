const supabase = require('../services/supabase');

module.exports = async function requirePremium(req, res, next) {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', req.user.id)
    .single();

  if (error || !data || data.subscription_status !== 'active') {
    return res.status(403).json({ error: 'Premium required' });
  }
  next();
};
