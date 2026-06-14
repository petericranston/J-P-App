const supabase = require('../services/supabase');

exports.getSummary = async (req, res) => {
  const { pact_id } = req.query;
  if (!pact_id) return res.status(400).json({ error: 'pact_id required' });

  const { data: pact, error: pactErr } = await supabase
    .from('pacts')
    .select('*')
    .eq('id', pact_id)
    .single();

  if (pactErr || !pact) return res.status(404).json({ error: 'Pact not found' });
  if (pact.owner_id !== req.user.id && pact.partner_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const sprintStart = new Date(pact.sprint_start);
  const sprintEnd = new Date(pact.sprint_end + 'T23:59:59Z');

  const { data: checkins } = await supabase
    .from('checkins')
    .select('user_id, checked_in_at')
    .eq('pact_id', pact_id)
    .gte('checked_in_at', sprintStart.toISOString())
    .lte('checked_in_at', sprintEnd.toISOString());

  const totalDays =
    pact.frequency === 'daily'
      ? Math.floor((sprintEnd - sprintStart) / 86400000) + 1
      : pact.sprint_weeks;

  const checkinCount = (checkins || []).length;
  const completionPct = totalDays > 0 ? Math.round((checkinCount / totalDays) * 100) : 0;

  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak, shield_available, shield_used_on')
    .eq('pact_id', pact_id)
    .single();

  res.json({
    pact,
    sprint: {
      total_days: totalDays,
      checkin_count: checkinCount,
      completion_pct: completionPct,
    },
    streak: streak || null,
  });
};

// "Again?" — start a fresh sprint window on the same pact, reset shield.
exports.recommit = async (req, res) => {
  const { pact_id } = req.body;
  if (!pact_id) return res.status(400).json({ error: 'pact_id required' });

  const { data: pact } = await supabase
    .from('pacts')
    .select('owner_id, sprint_weeks, frequency')
    .eq('id', pact_id)
    .single();

  if (!pact) return res.status(404).json({ error: 'Pact not found' });
  if (pact.owner_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const newStart = new Date().toISOString().split('T')[0];
  const newEnd = new Date(Date.now() + pact.sprint_weeks * 7 * 86400000).toISOString().split('T')[0];

  await Promise.all([
    supabase
      .from('pacts')
      .update({ sprint_start: newStart, sprint_end: newEnd, status: 'active' })
      .eq('id', pact_id),
    supabase
      .from('streaks')
      .update({ shield_available: true, shield_used_on: null })
      .eq('pact_id', pact_id),
  ]);

  res.json({ pact_id, sprint_start: newStart, sprint_end: newEnd });
};
