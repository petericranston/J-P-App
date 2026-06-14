const supabase = require('../services/supabase');
const { updateStreakOnCheckin } = require('../services/streaks');

const VALID_FORMATS = ['photo', 'note'];

exports.submitCheckin = async (req, res) => {
  const { pact_id, format, photo_url, note_text } = req.body;

  if (!pact_id) return res.status(400).json({ error: 'pact_id required' });
  if (!VALID_FORMATS.includes(format)) {
    return res.status(400).json({ error: 'format must be photo or note' });
  }
  if (format === 'photo' && !photo_url) {
    return res.status(400).json({ error: 'photo_url required for photo format' });
  }
  if (format === 'note' && !note_text?.trim()) {
    return res.status(400).json({ error: 'note_text required for note format' });
  }

  const { data: pact } = await supabase
    .from('pacts')
    .select('id, owner_id, status')
    .eq('id', pact_id)
    .single();

  if (!pact || pact.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Pact not found' });
  }
  if (pact.status === 'completed' || pact.status === 'archived') {
    return res.status(400).json({ error: 'Pact is no longer active' });
  }

  const { data: checkin, error } = await supabase
    .from('checkins')
    .insert({
      pact_id,
      user_id: req.user.id,
      format,
      photo_path: photo_url || null,
      note_text: note_text ? note_text.slice(0, 140) : null,
      checked_in_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Already checked in today' });
    return res.status(500).json({ error: error.message });
  }

  let streak = null;
  if (effectiveCrewId) {
    try {
      streak = await updateStreakOnCheckin(req.user.id, effectiveCrewId);
    } catch (err) {
      // Check-in was recorded — don't fail the request over the streak update
      console.error('Streak update failed:', err.message);
    }
  }

  res.status(201).json({ checkin, streak });
};

exports.getFeed = async (req, res) => {
  const { pact_id } = req.query;
  if (!pact_id) return res.status(400).json({ error: 'pact_id required' });

  const { data: pact } = await supabase
    .from('pacts')
    .select('owner_id, partner_id, privacy')
    .eq('id', pact_id)
    .single();

  if (!pact) return res.status(404).json({ error: 'Pact not found' });
  if (pact.owner_id !== req.user.id && pact.partner_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  let query = supabase
    .from('checkins')
    .select('*, reactions(id, reactor_id, witness_name, emoji)')
    .eq('pact_id', pact_id)
    .order('checked_in_at', { ascending: false })
    .limit(7);

  // Partners see content based on privacy setting
  if (req.user.id === pact.partner_id && pact.privacy === 'streak_only') {
    query = query.select('id, pact_id, user_id, format, checked_in_at, reactions(id, reactor_id, witness_name, emoji)');
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  res.json({ checkins: data || [] });
};

exports.addReaction = async (req, res) => {
  const { checkinId } = req.params;
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: 'emoji required' });

  const { data: checkin } = await supabase
    .from('checkins')
    .select('pact_id')
    .eq('id', checkinId)
    .single();

  if (!checkin) return res.status(404).json({ error: 'Check-in not found' });

  const { data: pact } = await supabase
    .from('pacts')
    .select('partner_id')
    .eq('id', checkin.pact_id)
    .single();

  if (!pact || pact.partner_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the partner can react' });
  }

  const { data, error } = await supabase
    .from('reactions')
    .insert({ checkin_id: checkinId, reactor_id: req.user.id, emoji })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Reaction already exists' });
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ reaction: data });
};

exports.removeReaction = async (req, res) => {
  const { checkinId, emoji } = req.params;

  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('checkin_id', checkinId)
    .eq('reactor_id', req.user.id)
    .eq('emoji', emoji);

  if (error) return res.status(500).json({ error: error.message });

  res.status(204).send();
};
