const supabase = require('./supabase');

const toDateStr = (d) => d.toISOString().split('T')[0];

async function updateStreakOnCheckin(pactId) {
  const today = toDateStr(new Date());

  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('pact_id', pactId)
    .single();

  if (!existing) {
    await supabase.from('streaks').insert({
      pact_id: pactId,
      current_streak: 1,
      longest_streak: 1,
      shield_available: true,
      last_checkin_date: today,
    });
    return { current_streak: 1, longest_streak: 1 };
  }

  if (existing.last_checkin_date === today) {
    return { current_streak: existing.current_streak, longest_streak: existing.longest_streak };
  }

  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  const newStreak = existing.last_checkin_date === yesterday ? existing.current_streak + 1 : 1;
  const newLongest = Math.max(newStreak, existing.longest_streak);

  await supabase
    .from('streaks')
    .update({ current_streak: newStreak, longest_streak: newLongest, last_checkin_date: today })
    .eq('pact_id', pactId);

  return { current_streak: newStreak, longest_streak: newLongest };
}

module.exports = { updateStreakOnCheckin };
