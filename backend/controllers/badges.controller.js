// V1.1 — badges table required (schema addition).

const supabase = require('../services/supabase');

exports.getMyBadges = async (req, res) => {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', req.user.id)
    .order('earned_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ badges: data || [] });
};

exports.getBadge = async (req, res) => {
  const { badgeId } = req.params;

  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('id', badgeId)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Badge not found' });
  if (data.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  res.json({ badge: data });
};
