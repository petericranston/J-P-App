// V1.1 — teammate_scores view + encouragements table required.

const supabase = require('../services/supabase');

exports.getScore = async (req, res) => {
  const { crew_id } = req.query;
  if (!crew_id) return res.status(400).json({ error: 'crew_id required' });

  // Reactions given + encouragements sent within the crew
  const [{ count: reactionsGiven }, { count: encouragementsSent }] = await Promise.all([
    supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id),
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

  // Checkin IDs belonging to this crew
  const { data: crewCheckins } = await supabase
    .from('checkins')
    .select('id')
    .eq('crew_id', crew_id);

  const checkinIds = (crewCheckins || []).map((c) => c.id);

  const [{ count: given }, { count: received }] = await Promise.all([
    supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .in('checkin_id', checkinIds),
    supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .in('checkin_id', checkinIds)
      .neq('user_id', req.user.id)
      .in(
        'checkin_id',
        (
          await supabase
            .from('checkins')
            .select('id')
            .eq('crew_id', crew_id)
            .eq('user_id', req.user.id)
            .then(({ data }) => (data || []).map((c) => c.id))
        ),
      ),
  ]);

  res.json({ given: given || 0, received: received || 0 });
};
