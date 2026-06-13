const supabase = require('../services/supabase');

module.exports = async function requireCaptain(req, res, next) {
  const crewId = req.params.crewId || req.body.crew_id;
  if (!crewId) return res.status(400).json({ error: 'crew_id required' });

  const { data, error } = await supabase
    .from('crew_members')
    .select('role')
    .eq('crew_id', crewId)
    .eq('user_id', req.user.id)
    .single();

  if (error || !data || data.role !== 'captain') {
    return res.status(403).json({ error: 'Captain only' });
  }
  next();
};
