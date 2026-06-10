const supabase = require('../services/supabase');

// Save the Expo push token so the backend can send targeted push notifications.
// Stored on profiles.expo_push_token (schema addition required).
exports.registerPushToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });

  const { error } = await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ ok: true });
};

// Notification preferences (notification_prefs table — schema addition required).
exports.getPrefs = async (req, res) => {
  const { data, error } = await supabase
    .from('notification_prefs')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });

  res.json({ prefs: data || null });
};

exports.updatePrefs = async (req, res) => {
  const allowed = ['daily_reminder', 'crew_activity', 'spark_nudge'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const { data, error } = await supabase
    .from('notification_prefs')
    .upsert({ user_id: req.user.id, ...updates }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ prefs: data });
};
