const supabase = require('../services/supabase');

const ALLOWED = [
  'display_name',
  'avatar_url',
  'avatar_color',
  'life_area',
  'why_statement',
  'has_seen_primer',
  'expo_push_token',
];

exports.getProfile = async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  // PGRST116 = no rows found — first login, profile not yet created
  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }

  res.json({ profile: data || null });
};

exports.upsertProfile = async (req, res) => {
  const updates = {};
  for (const field of ALLOWED) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: req.user.id, ...updates }, { onConflict: 'id' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ profile: data });
};
