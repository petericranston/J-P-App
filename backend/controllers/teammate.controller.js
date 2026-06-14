// V1.1 — teammate_scores view + encouragements table required.

const supabase = require('../services/supabase');

exports.getScore = async (req, res) => {
  const { crew_id } = req.query;
  if (!crew_id) return res.status(400).json({ error: 'crew_id required' });

  // Scope reactions to this crew by fetching crew checkin IDs first
  const { data: crewCheckins } = await supabase
    .from('checkins')
    .select('id')
    .eq('crew_id', crew_id);

  const checkinIds = (crewCheckins || []).map((c) => c.id);

  const [{ count: reactionsGiven }, { count: encouragementsSent }] = await Promise.all([
    checkinIds.length
      ? supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', req.user.id)
          .in('checkin_id', checkinIds)
      : Promise.resolve({ count: 0 }),
    supabase
      .from('encouragements')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', req.user.id)
      .eq('crew_id', crew_id),
  ]);

  const score = (reactionsGiven || 0) + (encouragementsSent || 0) * 3;

  res.json({ score });
};

// Private: reactions given vs received for the current user within a crew.
exports.getCrewBalance = async (req, res) => {
  const { crew_id } = req.query;
  if (!crew_id) return res.status(400).json({ error: 'crew_id required' });

  // Fetch all crew checkins with user_id so we can derive subsets in memory
  const { data: crewCheckins } = await supabase
    .from('checkins')
    .select('id, user_id')
    .eq('crew_id', crew_id);

  const checkinIds = (crewCheckins || []).map((c) => c.id);
  // Derive this user's checkin IDs without an extra DB round-trip
  const myCheckinIds = (crewCheckins || [])
    .filter((c) => c.user_id === req.user.id)
    .map((c) => c.id);

  const [{ count: given }, { count: received }] = await Promise.all([
    checkinIds.length
      ? supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', req.user.id)
          .in('checkin_id', checkinIds)
      : Promise.resolve({ count: 0 }),
    myCheckinIds.length
      ? supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .in('checkin_id', myCheckinIds)
          .neq('user_id', req.user.id)
      : Promise.resolve({ count: 0 }),
  ]);

  res.json({ given: given || 0, received: received || 0 });
};
