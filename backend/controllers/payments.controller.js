// Payments are handled by RevenueCat / Expo IAP on the client.
// This backend only stores the mirror of subscription state and handles webhooks.

const supabase = require('../services/supabase');

exports.getSubscription = async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, subscription_expires_at')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ subscription: data });
};

// TODO: implement RevenueCat webhook to sync subscription_tier/status/expires_at to profiles
exports.webhook = async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
};
