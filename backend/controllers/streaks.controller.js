const supabase = require('../services/supabase');

exports.getStreak = async (req, res) => {
  const { pact_id } = req.query;
  if (!pact_id) return res.status(400).json({ error: 'pact_id required' });

  // Verify the requesting user belongs to this pact
  const { data: pact } = await supabase
    .from('pacts')
    .select('owner_id, partner_id')
    .eq('id', pact_id)
    .single();

  if (!pact || (pact.owner_id !== req.user.id && pact.partner_id !== req.user.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('pact_id', pact_id)
    .single();

  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });

  res.json({ streak: data || null });
};
