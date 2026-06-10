const supabase = require('../services/supabase');
const { updateStreakOnCheckin } = require('../services/streaks');

const VALID_FORMATS = ['photo', 'note', 'mood'];

exports.submitCheckin = async (req, res) => {
  const { goal_id, crew_id, format, photo_url, note_text, mood_effort, mood_feeling } = req.body;

  if (!VALID_FORMATS.includes(format)) {
    return res.status(400).json({ error: 'format must be photo, note, or mood' });
  }
  if (format === 'photo' && !photo_url) {
    return res.status(400).json({ error: 'photo_url required for photo format' });
  }
  if (format === 'note' && !note_text?.trim()) {
    return res.status(400).json({ error: 'note_text required for note format' });
  }
  if (format === 'mood' && (mood_effort == null || mood_feeling == null)) {
    return res.status(400).json({ error: 'mood_effort and mood_feeling required for mood format' });
  }

  const { data: goal } = await supabase
    .from('goals')
    .select('id, user_id, crew_id, is_active')
    .eq('id', goal_id)
    .single();

  if (!goal || goal.user_id !== req.user.id) return res.status(403).json({ error: 'Goal not found' });
  if (!goal.is_active) return res.status(400).json({ error: 'Goal is not active' });

  const effectiveCrewId = crew_id || goal.crew_id;

  const { data: checkin, error } = await supabase
    .from('checkins')
    .insert({
      user_id: req.user.id,
      goal_id,
      crew_id: effectiveCrewId,
      format,
      photo_url: photo_url || null,
      note_text: note_text ? note_text.slice(0, 140) : null,
      mood_effort: mood_effort ?? null,
      mood_feeling: mood_feeling ?? null,
      checked_in_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    // Unique constraint violation = already checked in today
    if (error.code === '23505') return res.status(409).json({ error: 'Already checked in today' });
    return res.status(500).json({ error: error.message });
  }

  let streak = null;
  if (effectiveCrewId) {
    streak = await updateStreakOnCheckin(req.user.id, effectiveCrewId);
  }

  res.status(201).json({ checkin, streak });
};

exports.getCrewFeed = async (req, res) => {
  const { crew_id } = req.query;
  if (!crew_id) return res.status(400).json({ error: 'crew_id required' });

  const { data: membership } = await supabase
    .from('crew_members')
    .select('user_id')
    .eq('crew_id', crew_id)
    .eq('user_id', req.user.id)
    .single();

  if (!membership) return res.status(403).json({ error: 'Not a crew member' });

  const { data, error } = await supabase
    .from('checkins')
    .select('*, profiles(display_name, avatar_url, avatar_color), reactions(id, user_id, emoji)')
    .eq('crew_id', crew_id)
    .order('checked_in_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ checkins: data || [] });
};

exports.addReaction = async (req, res) => {
  const { checkinId } = req.params;
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: 'emoji required' });

  // Verify the check-in belongs to the same crew as the reactor
  const { data: checkin } = await supabase
    .from('checkins')
    .select('crew_id')
    .eq('id', checkinId)
    .single();

  if (!checkin) return res.status(404).json({ error: 'Check-in not found' });

  if (checkin.crew_id) {
    const { data: membership } = await supabase
      .from('crew_members')
      .select('user_id')
      .eq('crew_id', checkin.crew_id)
      .eq('user_id', req.user.id)
      .single();
    if (!membership) return res.status(403).json({ error: 'Not a crew member' });
  }

  const { data, error } = await supabase
    .from('reactions')
    .insert({ checkin_id: checkinId, user_id: req.user.id, emoji })
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
    .eq('user_id', req.user.id)
    .eq('emoji', emoji);

  if (error) return res.status(500).json({ error: error.message });

  res.status(204).send();
};
