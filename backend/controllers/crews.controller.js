const supabase = require('../services/supabase');
const { computeCrewHealth } = require('../services/crewHealth');

exports.createCrew = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name required' });

  const { data: crew, error: crewErr } = await supabase
    .from('crews')
    .insert({ name: name.trim(), created_by: req.user.id })
    .select()
    .single();

  if (crewErr) return res.status(500).json({ error: crewErr.message });

  await Promise.all([
    supabase.from('crew_members').insert({
      crew_id: crew.id,
      user_id: req.user.id,
      role: 'captain',
    }),
    supabase.from('streaks').insert({
      user_id: req.user.id,
      crew_id: crew.id,
      current_streak: 0,
      longest_streak: 0,
      shield_used: false,
      last_checkin_date: null,
    }),
  ]);

  res.status(201).json({ crew });
};

exports.getMyCrews = async (req, res) => {
  const { data, error } = await supabase
    .from('crew_members')
    .select('role, joined_at, crews(id, name, created_at)')
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    crews: (data || []).map((m) => ({ ...m.crews, role: m.role, joined_at: m.joined_at })),
  });
};

exports.getCrew = async (req, res) => {
  const { crewId } = req.params;

  const { data: membership } = await supabase
    .from('crew_members')
    .select('role')
    .eq('crew_id', crewId)
    .eq('user_id', req.user.id)
    .single();

  if (!membership) return res.status(403).json({ error: 'Not a crew member' });

  const [{ data: crew, error: crewErr }, { data: members }] = await Promise.all([
    supabase.from('crews').select('*').eq('id', crewId).single(),
    supabase
      .from('crew_members')
      .select('user_id, role, joined_at, profiles(display_name, avatar_url, avatar_color)')
      .eq('crew_id', crewId),
  ]);

  if (crewErr) return res.status(500).json({ error: crewErr.message });

  const health = await computeCrewHealth(crewId);

  res.json({ crew: { ...crew, health, members: members || [] } });
};
