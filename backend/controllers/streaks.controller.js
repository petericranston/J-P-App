const supabase = require('../services/supabase');

exports.getStreak = async (req, res) => {
  const { crew_id } = req.query;
  if (!crew_id) return res.status(400).json({ error: 'crew_id required' });

  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('crew_id', crew_id)
    .single();

  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });

  res.json({ streak: data || null });
};

exports.getCrewStreaks = async (req, res) => {
  const { crew_id } = req.query;
  if (!crew_id) return res.status(400).json({ error: 'crew_id required' });

  const { data: membership } = await supabase
    .from('crew_members')
    .select('user_id')
    .eq('crew_id', crew_id)
    .eq('user_id', req.user.id)
    .single();

  if (!membership) return res.status(403).json({ error: 'Not a crew member' });

  const { data, error } = await supabase
    .from('streaks')
    .select('user_id, current_streak, longest_streak, last_checkin_date')
    .eq('crew_id', crew_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ streaks: data || [] });
};
