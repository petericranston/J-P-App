const supabase = require('../services/supabase');
const { sendPushBatch } = require('../services/push');

const toDateStr = (d) => d.toISOString().split('T')[0];

// Daily cron — detect missed check-ins and apply shield or warm reset.
// After processing, last_checkin_date is advanced to yesterday so the same
// miss isn't double-counted on the next cron run.
exports.processStreaks = async (req, res) => {
  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));

  const { data: goals, error: goalsErr } = await supabase
    .from('goals')
    .select('id, user_id, crew_id, sprint_start')
    .eq('is_active', true)
    .not('crew_id', 'is', null);

  if (goalsErr) return res.status(500).json({ error: goalsErr.message });
  if (!goals?.length) return res.json({ processed: 0 });

  // Batch-fetch all relevant streak rows in one query
  const crewIds = [...new Set(goals.map((g) => g.crew_id))];
  const userIds = [...new Set(goals.map((g) => g.user_id))];

  const { data: allStreaks, error: streaksErr } = await supabase
    .from('streaks')
    .select('*')
    .in('crew_id', crewIds)
    .in('user_id', userIds);

  if (streaksErr) return res.status(500).json({ error: streaksErr.message });

  const streakMap = {};
  for (const s of allStreaks || []) {
    streakMap[`${s.user_id}:${s.crew_id}`] = s;
  }

  const updateOps = [];

  for (const goal of goals) {
    const streak = streakMap[`${goal.user_id}:${goal.crew_id}`];
    if (!streak) continue;
    if (streak.last_checkin_date >= yesterday) continue;

    const updates = { last_checkin_date: yesterday };

    // Shield replenishes on the first missed-day cron of the new sprint.
    // sprint_start is set to the day the sprint began, so the cron processing
    // "yesterday" (day 1 of the sprint) sees sprint_start === yesterday.
    const isSprintDay1 = goal.sprint_start === yesterday;
    if (isSprintDay1) updates.shield_used = false;

    const shieldAvailable = isSprintDay1 ? true : !streak.shield_used;

    if (streak.current_streak > 0) {
      if (shieldAvailable) {
        updates.shield_used = true;
      } else {
        updates.current_streak = 0;
      }
    }

    updateOps.push(
      supabase
        .from('streaks')
        .update(updates)
        .eq('user_id', goal.user_id)
        .eq('crew_id', goal.crew_id),
    );
  }

  await Promise.all(updateOps);

  res.json({ processed: updateOps.length });
};

// Weekly cron — rotate the captain to the next member (by join order).
exports.captainRotation = async (req, res) => {
  const { data: crews, error } = await supabase.from('crews').select('id');
  if (error) return res.status(500).json({ error: error.message });
  if (!crews?.length) return res.json({ rotated: 0 });

  const crewIds = crews.map((c) => c.id);

  // Batch-fetch all members for all crews in one query
  const { data: allMembers, error: membersErr } = await supabase
    .from('crew_members')
    .select('crew_id, user_id, role, joined_at')
    .in('crew_id', crewIds)
    .order('joined_at', { ascending: true });

  if (membersErr) return res.status(500).json({ error: membersErr.message });

  const membersByCrew = {};
  for (const m of allMembers || []) {
    (membersByCrew[m.crew_id] ||= []).push(m);
  }

  const updateOps = [];

  for (const crew of crews) {
    const members = membersByCrew[crew.id] || [];
    if (members.length < 2) continue;

    const currentCaptainIdx = members.findIndex((m) => m.role === 'captain');
    if (currentCaptainIdx === -1) continue;

    const nextIdx = (currentCaptainIdx + 1) % members.length;
    const currentCaptain = members[currentCaptainIdx];
    const nextCaptain = members[nextIdx];

    updateOps.push(
      supabase.from('crew_members').update({ role: 'member' }).eq('crew_id', crew.id).eq('user_id', currentCaptain.user_id),
      supabase.from('crew_members').update({ role: 'captain' }).eq('crew_id', crew.id).eq('user_id', nextCaptain.user_id),
    );
  }

  await Promise.all(updateOps);

  res.json({ rotated: updateOps.length / 2 });
};

// Daily/hourly cron — recompute and cache crew health scores.
// Requires crews.health_score column (schema addition).
exports.computeAllCrewHealth = async (req, res) => {
  const { data: crews, error } = await supabase.from('crews').select('id');
  if (error) return res.status(500).json({ error: error.message });
  if (!crews?.length) return res.json({ updated: 0 });

  const crewIds = crews.map((c) => c.id);
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();

  // Two batch queries instead of 2N
  const [{ data: allMembers }, { data: recentCheckins }] = await Promise.all([
    supabase.from('crew_members').select('crew_id, user_id').in('crew_id', crewIds),
    supabase.from('checkins').select('crew_id, user_id').in('crew_id', crewIds).gte('checked_in_at', cutoff),
  ]);

  const membersByCrew = {};
  for (const m of allMembers || []) {
    (membersByCrew[m.crew_id] ||= new Set()).add(m.user_id);
  }

  const activeUsersByCrew = {};
  for (const c of recentCheckins || []) {
    (activeUsersByCrew[c.crew_id] ||= new Set()).add(c.user_id);
  }

  const updateOps = [];

  for (const crew of crews) {
    const members = membersByCrew[crew.id];
    if (!members?.size) continue;

    const activeUsers = activeUsersByCrew[crew.id] || new Set();
    const health = Math.round((activeUsers.size / members.size) * 5);
    updateOps.push(supabase.from('crews').update({ health_score: health }).eq('id', crew.id));
  }

  await Promise.all(updateOps);

  res.json({ updated: updateOps.length });
};

// Daily cron — send one gentle nudge after exactly 3 days of absence.
// "Exactly 3 days ago" naturally prevents repeat nudges: on day 4+
// last_checkin_date < threeDaysAgo so the user doesn't match.
exports.sparkFlow = async (req, res) => {
  const threeDaysAgo = toDateStr(new Date(Date.now() - 3 * 86400000));

  const { data: streaks, error } = await supabase
    .from('streaks')
    .select('user_id')
    .eq('last_checkin_date', threeDaysAgo);

  if (error) return res.status(500).json({ error: error.message });
  if (!streaks?.length) return res.json({ nudged: 0 });

  const userIds = [...new Set(streaks.map((s) => s.user_id))];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, expo_push_token, why_statement')
    .in('id', userIds)
    .not('expo_push_token', 'is', null);

  const messages = (profiles || []).map((p) => ({
    to: p.expo_push_token,
    title: 'Still here. So are they.',
    body: p.why_statement
      ? `Your why: "${p.why_statement.slice(0, 80)}"`
      : 'Your crew is waiting.',
    data: { screen: 'WelcomeBack' },
  }));

  await sendPushBatch(messages);

  res.json({ nudged: messages.length });
};
