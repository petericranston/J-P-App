const { randomUUID } = require('crypto');
const supabase = require('../services/supabase');

const MAX_CREW_SIZE = 6;
const INVITE_TTL_DAYS = 7;

exports.createInvite = async (req, res) => {
  const crew_id = req.body.crew_id;
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86400000).toISOString();

  const { data, error } = await supabase
    .from('invites')
    .insert({ crew_id, invited_by: req.user.id, invite_token: randomUUID(), expires_at: expiresAt })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ invite: data });
};

exports.getInvite = async (req, res) => {
  const { token } = req.params;

  const { data, error } = await supabase
    .from('invites')
    .select('id, crew_id, expires_at, crews(name)')
    .eq('invite_token', token)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Invite not found' });
  if (new Date(data.expires_at) < new Date()) return res.status(410).json({ error: 'Invite expired' });

  res.json({ invite: data });
};

exports.acceptInvite = async (req, res) => {
  const { token } = req.params;

  const { data: invite, error } = await supabase
    .from('invites')
    .select('*')
    .eq('invite_token', token)
    .single();

  if (error || !invite) return res.status(404).json({ error: 'Invite not found' });
  if (new Date(invite.expires_at) < new Date()) return res.status(410).json({ error: 'Invite expired' });

  const { count } = await supabase
    .from('crew_members')
    .select('*', { count: 'exact', head: true })
    .eq('crew_id', invite.crew_id);

  if (count >= MAX_CREW_SIZE) return res.status(409).json({ error: 'Crew is full (max 6)' });

  const { data: existing } = await supabase
    .from('crew_members')
    .select('user_id')
    .eq('crew_id', invite.crew_id)
    .eq('user_id', req.user.id)
    .single();

  if (existing) return res.status(409).json({ error: 'Already a crew member' });

  await Promise.all([
    supabase.from('crew_members').insert({ crew_id: invite.crew_id, user_id: req.user.id, role: 'member' }),
    supabase.from('streaks').insert({
      user_id: req.user.id,
      crew_id: invite.crew_id,
      current_streak: 0,
      longest_streak: 0,
      shield_used: false,
      last_checkin_date: null,
    }),
  ]);

  res.json({ crew_id: invite.crew_id });
};
