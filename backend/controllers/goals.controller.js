const supabase = require('../services/supabase');

const VALID_FREQUENCIES = ['daily', 'weekly'];
const VALID_SPRINT_WEEKS = [2, 4, 8];
const VALID_PRIVACY_TIERS = ['full', 'partial', 'streak_only'];

exports.createGoal = async (req, res) => {
  const { crew_id, title, life_area, frequency, sprint_weeks, privacy_tier } = req.body;

  if (!title?.trim()) return res.status(400).json({ error: 'title required' });
  if (!VALID_FREQUENCIES.includes(frequency)) {
    return res.status(400).json({ error: 'frequency must be daily or weekly' });
  }
  const weeks = Number(sprint_weeks);
  if (!VALID_SPRINT_WEEKS.includes(weeks)) {
    return res.status(400).json({ error: 'sprint_weeks must be 2, 4, or 8' });
  }

  if (crew_id) {
    const { data: member } = await supabase
      .from('crew_members')
      .select('user_id')
      .eq('crew_id', crew_id)
      .eq('user_id', req.user.id)
      .single();
    if (!member) return res.status(403).json({ error: 'Not a crew member' });
  }

  const sprintStart = new Date().toISOString().split('T')[0];
  const sprintEnd = new Date(Date.now() + weeks * 7 * 86400000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: req.user.id,
      crew_id: crew_id || null,
      title: title.trim().slice(0, 80),
      life_area: life_area || null,
      frequency,
      sprint_weeks: weeks,
      privacy_tier: VALID_PRIVACY_TIERS.includes(privacy_tier) ? privacy_tier : 'full',
      sprint_start: sprintStart,
      sprint_end: sprintEnd,
      is_active: true,
      safe_mode: life_area === 'Mind',
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ goal: data });
};

exports.getMyGoals = async (req, res) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ goals: data || [] });
};

exports.getGoal = async (req, res) => {
  const { goalId } = req.params;

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Goal not found' });
  if (data.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  res.json({ goal: data });
};
