const supabase = require('../services/supabase');

const VALID_FREQUENCIES = ['daily', 'weekly'];
const VALID_SPRINT_WEEKS = [2, 4];
const VALID_PRIVACY = ['full', 'streak_only'];
const VALID_LIFE_AREAS = ['health', 'mind', 'work', 'creative', 'finance'];

exports.createPact = async (req, res) => {
  const { title, life_area, frequency, sprint_weeks, privacy, why_statement } = req.body;

  if (!title?.trim()) return res.status(400).json({ error: 'title required' });
  if (!VALID_FREQUENCIES.includes(frequency)) {
    return res.status(400).json({ error: 'frequency must be daily or weekly' });
  }
  const weeks = Number(sprint_weeks);
  if (!VALID_SPRINT_WEEKS.includes(weeks)) {
    return res.status(400).json({ error: 'sprint_weeks must be 2 or 4' });
  }
  if (life_area && !VALID_LIFE_AREAS.includes(life_area)) {
    return res.status(400).json({ error: 'life_area must be health, mind, work, creative, or finance' });
  }

  const sprintStart = new Date().toISOString().split('T')[0];
  const sprintEnd = new Date(Date.now() + weeks * 7 * 86400000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('pacts')
    .insert({
      owner_id: req.user.id,
      title: title.trim().slice(0, 80),
      life_area: life_area || null,
      frequency,
      sprint_weeks: weeks,
      privacy: VALID_PRIVACY.includes(privacy) ? privacy : 'full',
      why_statement: why_statement ? why_statement.slice(0, 140) : null,
      sprint_start: sprintStart,
      sprint_end: sprintEnd,
      status: 'waiting',
      safe_mode: life_area === 'mind',
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Streak row is created by DB trigger on pacts insert.

  res.status(201).json({ pact: data });
};

exports.getMyPacts = async (req, res) => {
  const { data, error } = await supabase
    .from('pacts')
    .select('*')
    .or(`owner_id.eq.${req.user.id},partner_id.eq.${req.user.id}`)
    .not('status', 'eq', 'archived')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ pacts: data || [] });
};

exports.getPact = async (req, res) => {
  const { pactId } = req.params;

  const { data, error } = await supabase
    .from('pacts')
    .select('*, owner:profiles!owner_id(display_name,avatar_url,avatar_color), partner:profiles!partner_id(display_name,avatar_url,avatar_color)')
    .eq('id', pactId)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Pact not found' });
  if (data.owner_id !== req.user.id && data.partner_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({ pact: data });
};
