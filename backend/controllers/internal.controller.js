const supabase = require('../services/supabase');
const { sendPushBatch } = require('../services/push');

const toDateStr = (d) => d.toISOString().split('T')[0];

// Daily cron — detect missed check-ins and apply shield or warm reset.
// Strategy: for each active goal, compare the user's last_checkin_date to yesterday.
// After processing, advance last_checkin_date to yesterday so the same miss isn't
// double-counted on subsequent cron runs.
exports.processStreaks = async (req, res) => {
  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));

  const { data: goals, error: goalsErr } = await supabase
    .from('goals')
    .select('id, user_id, crew_id, sprint_start, sprint_weeks')
    .eq('is_active', true)
    .not('crew_id', 'is', null);

  if (goalsErr) return res.status(500).json({ error: goalsErr.message });

  let processed = 0;

  for (const goal of goals || []) {
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', goal.user_id)
      .eq('crew_id', goal.crew_id)
      .single();

    if (!streak) continue;
    // User already checked in yesterday or today — nothing to do.
    if (streak.last_checkin_date >= yesterday) continue;

    const updates = { last_checkin_date: yesterday };

    // If the current sprint started today, replenish the shield.
    // (sprint_start = today means this is the first cron after a new sprint began)
    const isNewSprintFirstCron = goal.sprint_start === today;
    if (isNewSprintFirstCron) updates.shield_used = false;

    const shieldAvailable = isNewSprintFirstCron ? true : !streak.shield_used;

    if (streak.current_streak > 0) {
      if (shieldAvailable) {
        updates.shield_used = true;
      } else {
        updates.current_streak = 0;
      }
    }

    await supabase
      .from('streaks')
      .update(updates)
      .eq('user_id', goal.user_id)
      .eq('crew_id', goal.crew_id);

    processed++;
  }

  res.json({ processed });
};

// Weekly cron — rotate the captain to the next most-recently-joined member.
exports.captainRotation = async (req, res) => {
  const { data: crews, error } = await supabase.from('crews').select('id');
  if (error) return res.status(500).json({ error: error.message });

  let rotated = 0;

  for (const crew of crews || []) {
    const { data: members } = await supabase
      .from('crew_members')
      .select('user_id, role, joined_at')
      .eq('crew_id', crew.id)
      .order('joined_at', { ascending: true });

    if (!members || members.length < 2) continue;

    const currentCaptainIdx = members.findIndex((m) => m.role === 'captain');
    if (currentCaptainIdx === -1) continue;

    const nextIdx = (currentCaptainIdx + 1) % members.length;
    const currentCaptain = members[currentCaptainIdx];
    const nextCaptain = members[nextIdx];

    await Promise.all([
      supabase
        .from('crew_members')
        .update({ role: 'member' })
        .eq('crew_id', crew.id)
        .eq('user_id', currentCaptain.user_id),
      supabase
        .from('crew_members')
        .update({ role: 'captain' })
        .eq('crew_id', crew.id)
        .eq('user_id', nextCaptain.user_id),
    ]);

    rotated++;
  }

  res.json({ rotated });
};

// Daily/hourly cron — recompute and cache health score on each crew row.
// Requires crews.health_score column (schema addition).
exports.computeAllCrewHealth = async (req, res) => {
  const { data: crews, error } = await supabase.from('crews').select('id');
  if (error) return res.status(500).json({ error: error.message });

  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
  let updated = 0;

  for (const crew of crews || []) {
    const { data: members } = await supabase
      .from('crew_members')
      .select('user_id')
      .eq('crew_id', crew.id);

    if (!members?.length) continue;

    const { data: recentCheckins } = await supabase
      .from('checkins')
      .select('user_id')
      .eq('crew_id', crew.id)
      .gte('checked_in_at', cutoff);

    const activeUsers = new Set((recentCheckins || []).map((c) => c.user_id));
    const health = Math.round((activeUsers.size / members.length) * 5);

    await supabase.from('crews').update({ health_score: health }).eq('id', crew.id);
    updated++;
  }

  res.json({ updated });
};

// Daily cron — send one gentle nudge after 3 consecutive days of absence.
// Reads expo_push_token from profiles (schema addition).
exports.sparkFlow = async (req, res) => {
  const threeDaysAgo = toDateStr(new Date(Date.now() - 3 * 86400000));

  // Find users whose last check-in was exactly 3 days ago (haven't been nudged yet,
  // since after 4+ days last_checkin_date would be < threeDaysAgo).
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
