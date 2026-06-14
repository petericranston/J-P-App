const supabase = require('../services/supabase');
const { sendPushBatch } = require('../services/push');

const toDateStr = (d) => d.toISOString().split('T')[0];

// Hourly cron — process missed check-ins for all active daily pacts.
// For each pact where last_checkin_date < yesterday:
//   shield_available → consume shield, streak holds, warm push.
//   no shield → reset streak to 0. No push (never notify someone about a loss).
exports.processStreaks = async (req, res) => {
  const yesterday = toDateStr(new Date(Date.now() - 86400000));

  const { data: pacts, error: pactsErr } = await supabase
    .from('pacts')
    .select('id, owner_id, frequency, sprint_start')
    .eq('status', 'active')
    .eq('frequency', 'daily');

  if (pactsErr) return res.status(500).json({ error: pactsErr.message });

  // Batch-fetch all relevant streak rows in one query
  const crewIds = [...new Set(goals.map((g) => g.crew_id))];
  const userIds = [...new Set(goals.map((g) => g.user_id))];

  for (const pact of pacts || []) {
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('pact_id', pact.id)
      .single();

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

    const isNewSprintFirstCron = pact.sprint_start === toDateStr(new Date());
    if (isNewSprintFirstCron) updates.shield_available = true;

    const shieldAvailable = isNewSprintFirstCron ? true : streak.shield_available;

    if (streak.current_streak > 0) {
      if (shieldAvailable) {
        updates.shield_available = false;
        updates.shield_used_on = yesterday;
      } else {
        updates.current_streak = 0;
        updates.shield_used_on = null;
      }
    }

    await supabase
      .from('streaks')
      .update(updates)
      .eq('pact_id', pact.id);

    processed++;
  }

  await Promise.all(updateOps);

  res.json({ processed: updateOps.length });
};

// Daily cron — mark completed sprints and push both owner and partner.
exports.processSprintEnds = async (req, res) => {
  const today = toDateStr(new Date());

  const { data: pacts, error } = await supabase
    .from('pacts')
    .select('id, owner_id, partner_id')
    .eq('status', 'active')
    .lt('sprint_end', today);

  if (error) return res.status(500).json({ error: error.message });
  if (!crews?.length) return res.json({ rotated: 0 });

  let completed = 0;

  for (const pact of pacts || []) {
    await supabase.from('pacts').update({ status: 'completed' }).eq('id', pact.id);

    const userIds = [pact.owner_id, pact.partner_id].filter(Boolean);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, expo_push_token')
      .in('id', userIds)
      .not('expo_push_token', 'is', null);

    const messages = (profiles || []).map((p) => ({
      to: p.expo_push_token,
      title: 'Sprint complete.',
      body: 'Look what you did.',
      data: { screen: 'SprintSummary', pact_id: pact.id },
    }));

    await sendPushBatch(messages);
    completed++;
  }

  res.json({ completed });
};

// Hourly cron — send one gentle nudge after 3 consecutive days of absence.
// Sets nudged_at on the pact to prevent repeat nudges. Cleared on next check-in.
exports.sparkFlow = async (req, res) => {
  const threeDaysAgo = toDateStr(new Date(Date.now() - 3 * 86400000));

  const { data: streaks, error } = await supabase
    .from('streaks')
    .select('pact_id')
    .eq('last_checkin_date', threeDaysAgo);

  if (error) return res.status(500).json({ error: error.message });
  if (!streaks?.length) return res.json({ nudged: 0 });

  const pactIds = streaks.map((s) => s.pact_id);

  const { data: pacts } = await supabase
    .from('pacts')
    .select('id, owner_id, why_statement')
    .in('id', pactIds)
    .eq('status', 'active')
    .is('nudged_at', null);

  if (!pacts?.length) return res.json({ nudged: 0 });

  const ownerIds = pacts.map((p) => p.owner_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, expo_push_token')
    .in('id', ownerIds)
    .not('expo_push_token', 'is', null);

  const tokenMap = Object.fromEntries((profiles || []).map((p) => [p.id, p.expo_push_token]));

  const messages = pacts
    .filter((p) => tokenMap[p.owner_id])
    .map((p) => ({
      to: tokenMap[p.owner_id],
      title: 'Still here. So are they.',
      body: p.why_statement
        ? `Your why: "${p.why_statement.slice(0, 80)}"`
        : 'Your partner is waiting.',
      data: { screen: 'WelcomeBack', pact_id: p.id },
    }));

  await sendPushBatch(messages);

  const nudgedIds = pacts.filter((p) => tokenMap[p.owner_id]).map((p) => p.id);
  if (nudgedIds.length) {
    await supabase
      .from('pacts')
      .update({ nudged_at: new Date().toISOString() })
      .in('id', nudgedIds);
  }

  res.json({ nudged: messages.length });
};
