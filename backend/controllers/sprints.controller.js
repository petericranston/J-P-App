const supabase = require('../services/supabase');

exports.getSummary = async (req, res) => {
  const { goal_id } = req.query;
  if (!goal_id) return res.status(400).json({ error: 'goal_id required' });

  const { data: goal, error: goalErr } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goal_id)
    .single();

  if (goalErr || !goal) return res.status(404).json({ error: 'Goal not found' });

  // Viewer must be the goal owner or a crew member
  if (goal.user_id !== req.user.id) {
    if (goal.crew_id) {
      const { data: member } = await supabase
        .from('crew_members')
        .select('user_id')
        .eq('crew_id', goal.crew_id)
        .eq('user_id', req.user.id)
        .single();
      if (!member) return res.status(403).json({ error: 'Forbidden' });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  const sprintStart = new Date(goal.sprint_start);
  const sprintEnd = new Date(goal.sprint_end + 'T23:59:59Z');

  const { data: checkins } = await supabase
    .from('checkins')
    .select('user_id, checked_in_at')
    .eq('goal_id', goal_id)
    .gte('checked_in_at', sprintStart.toISOString())
    .lte('checked_in_at', sprintEnd.toISOString());

  const totalDays =
    goal.frequency === 'daily'
      ? Math.floor((sprintEnd - sprintStart) / 86400000) + 1
      : goal.sprint_weeks;

  const checkinCount = (checkins || []).length;
  const completionPct = totalDays > 0 ? Math.round((checkinCount / totalDays) * 100) : 0;

  // Per-member breakdown (for crew sprint summary screen)
  let memberStats = [];
  if (goal.crew_id) {
    const { data: members } = await supabase
      .from('crew_members')
      .select('user_id, profiles(display_name, avatar_url)')
      .eq('crew_id', goal.crew_id);

    const checkinsPerUser = {};
    for (const c of checkins || []) {
      checkinsPerUser[c.user_id] = (checkinsPerUser[c.user_id] || 0) + 1;
    }

    memberStats = (members || []).map((m) => ({
      user_id: m.user_id,
      display_name: m.profiles?.display_name,
      avatar_url: m.profiles?.avatar_url,
      checkin_count: checkinsPerUser[m.user_id] || 0,
      completion_pct: totalDays > 0 ? Math.round(((checkinsPerUser[m.user_id] || 0) / totalDays) * 100) : 0,
    }));
  }

  res.json({
    goal,
    sprint: {
      total_days: totalDays,
      checkin_count: checkinCount,
      completion_pct: completionPct,
      member_stats: memberStats,
    },
  });
};

// Vote to re-commit to the same goal or pivot to a new one at sprint end.
// Requires sprint_votes table (schema addition).
exports.vote = async (req, res) => {
  const { goal_id, vote_type } = req.body;

  if (!goal_id) return res.status(400).json({ error: 'goal_id required' });
  if (!['recommit', 'pivot'].includes(vote_type)) {
    return res.status(400).json({ error: 'vote_type must be recommit or pivot' });
  }

  const { data: goal } = await supabase
    .from('goals')
    .select('id, user_id, crew_id, sprint_weeks, frequency, life_area, title, privacy_tier')
    .eq('id', goal_id)
    .single();

  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  if (goal.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  const { error: voteErr } = await supabase
    .from('sprint_votes')
    .upsert({ goal_id, user_id: req.user.id, vote_type }, { onConflict: 'goal_id,user_id' });

  if (voteErr) return res.status(500).json({ error: voteErr.message });

  if (vote_type === 'recommit') {
    const newStart = new Date().toISOString().split('T')[0];
    const newEnd = new Date(Date.now() + goal.sprint_weeks * 7 * 86400000).toISOString().split('T')[0];

    await supabase
      .from('goals')
      .update({ sprint_start: newStart, sprint_end: newEnd })
      .eq('id', goal_id);
  } else {
    // Pivot: deactivate current goal; client navigates to goal creation
    await supabase.from('goals').update({ is_active: false }).eq('id', goal_id);
  }

  res.json({ vote_type });
};
