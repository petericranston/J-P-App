const supabase = require('./supabase');

// Returns 0–5 health score: how many members checked in within the last 7 days.
async function computeCrewHealth(crewId) {
  const { data: members } = await supabase
    .from('crew_members')
    .select('user_id')
    .eq('crew_id', crewId);

  if (!members || members.length === 0) return 0;

  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data: recentCheckins } = await supabase
    .from('checkins')
    .select('user_id')
    .eq('crew_id', crewId)
    .gte('checked_in_at', cutoff);

  const activeUsers = new Set((recentCheckins || []).map((c) => c.user_id));
  return Math.round((activeUsers.size / members.length) * 5);
}

module.exports = { computeCrewHealth };
