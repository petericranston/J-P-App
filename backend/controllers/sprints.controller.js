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

  const totalDays =
    goal.frequency === 'daily'
      ? Math.floor((sprintEnd - sprintStart) / 86400000) + 1
      : goal.sprint_weeks;

  // Checkins for the queried goal (for the owner's own completion %)
  const { data: checkins } = await supabase
    .from('checkins')
    .select('user_id, checked_in_at')
    .eq('pact_id', pact_id)
    .gte('checked_in_at', sprintStart.toISOString())
    .lte('checked_in_at', sprintEnd.toISOString());

  const totalDays =
    goal.frequency === 'daily'
      ? Math.floor((sprintEnd - sprintStart) / 86400000) + 1
      : goal.sprint_weeks;

  const checkinCount = (checkins || []).length;
  const completionPct = totalDays > 0 ? Math.round((checkinCount / totalDays) * 100) : 0;

  // Per-member breakdown — each member has their own goal, so we must fetch
  // each member's active goal and their checkins separately.
  let memberStats = [];
  if (goal.crew_id) {
    const [{ data: members }, { data: memberGoals }] = await Promise.all([
      supabase
        .from('crew_members')
        .select('user_id, profiles(display_name, avatar_url)')
        .eq('crew_id', goal.crew_id),
      supabase
        .from('goals')
        .select('id, user_id, sprint_start, sprint_end, sprint_weeks, frequency')
        .eq('crew_id', goal.crew_id)
        .eq('is_active', true),
    ]);

    // Build goal lookup per user (one active goal per user per crew)
    const goalByUser = {};
    for (const g of memberGoals || []) {
      goalByUser[g.user_id] = g;
    }

    // Batch-fetch checkins for all member goals
    const memberGoalIds = Object.values(goalByUser).map((g) => g.id);
    const { data: allCheckins } = memberGoalIds.length
      ? await supabase
          .from('checkins')
          .select('goal_id, user_id, checked_in_at')
          .in('goal_id', memberGoalIds)
      : { data: [] };

    // Group checkins by goal_id
    const checkinsByGoal = {};
    for (const c of allCheckins || []) {
      (checkinsByGoal[c.goal_id] ||= []).push(c);
    }

    memberStats = (members || []).map((m) => {
      const mGoal = goalByUser[m.user_id];
      if (!mGoal) {
        return {
          user_id: m.user_id,
          display_name: m.profiles?.display_name,
          avatar_url: m.profiles?.avatar_url,
          checkin_count: 0,
          completion_pct: 0,
        };
      }

      const mStart = new Date(mGoal.sprint_start);
      const mEnd = new Date(mGoal.sprint_end + 'T23:59:59Z');
      const mTotalDays =
        mGoal.frequency === 'daily'
          ? Math.floor((mEnd - mStart) / 86400000) + 1
          : mGoal.sprint_weeks;

      const mCheckins = (checkinsByGoal[mGoal.id] || []).filter((c) => {
        const t = new Date(c.checked_in_at);
        return t >= mStart && t <= mEnd;
      });

      const count = mCheckins.length;
      return {
        user_id: m.user_id,
        display_name: m.profiles?.display_name,
        avatar_url: m.profiles?.avatar_url,
        checkin_count: count,
        completion_pct: mTotalDays > 0 ? Math.round((count / mTotalDays) * 100) : 0,
      };
    });
  }

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

  const { error: voteErr } = await supabase
    .from('sprint_votes')
    .upsert({ goal_id, user_id: req.user.id, vote_type }, { onConflict: 'goal_id,user_id' });

  if (voteErr) return res.status(500).json({ error: voteErr.message });

  if (vote_type === 'recommit') {
    const newStart = new Date().toISOString().split('T')[0];
    const newEnd = new Date(Date.now() + goal.sprint_weeks * 7 * 86400000).toISOString().split('T')[0];
    await supabase.from('goals').update({ sprint_start: newStart, sprint_end: newEnd }).eq('id', goal_id);
  } else {
    await supabase.from('goals').update({ is_active: false }).eq('id', goal_id);
  }
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
