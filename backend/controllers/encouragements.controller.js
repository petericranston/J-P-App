// V1.1 — encouragements table required (schema addition).

const supabase = require('../services/supabase');
const { sendPush } = require('../services/push');

const PRESETS = [
  "You're doing great!",
  "Keep going — it counts.",
  "Your crew sees you.",
];

exports.sendEncouragement = async (req, res) => {
  const { recipient_id, crew_id, message } = req.body;
  if (!recipient_id || !crew_id) {
    return res.status(400).json({ error: 'recipient_id and crew_id required' });
  }

  const text = PRESETS.includes(message) ? message : PRESETS[0];

  const { data, error } = await supabase
    .from('encouragements')
    .insert({ sender_id: req.user.id, recipient_id, crew_id, message: text })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Push to recipient
  const { data: profile } = await supabase
    .from('profiles')
    .select('expo_push_token, display_name')
    .eq('id', req.user.id)
    .single();

  const { data: recipient } = await supabase
    .from('profiles')
    .select('expo_push_token')
    .eq('id', recipient_id)
    .single();

  await sendPush(
    recipient?.expo_push_token,
    profile?.display_name || 'Your crew',
    text,
    { screen: 'Home' },
  );

  res.status(201).json({ encouragement: data });
};
