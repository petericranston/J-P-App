const { randomBytes } = require('crypto');
const supabase = require('../services/supabase');

const INVITE_TTL_DAYS = 30;

exports.createInvite = async (req, res) => {
  const { pact_id } = req.body;
  if (!pact_id) return res.status(400).json({ error: 'pact_id required' });

  const { data: pact } = await supabase
    .from('pacts')
    .select('owner_id')
    .eq('id', pact_id)
    .single();

  if (!pact || pact.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the pact owner can create an invite' });
  }

  const token = randomBytes(16).toString('hex'); // 32-char url-safe
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86400000).toISOString();

  const { data, error } = await supabase
    .from('invites')
    .insert({ pact_id, created_by: req.user.id, token, expires_at: expiresAt })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ invite: data });
};

exports.getInvite = async (req, res) => {
  const { token } = req.params;

  const { data, error } = await supabase
    .from('invites')
    .select('id, pact_id, expires_at, claimed_by, pacts(title)')
    .eq('token', token)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Invite not found' });
  if (new Date(data.expires_at) < new Date()) return res.status(410).json({ error: 'Invite expired' });

  res.json({ invite: data });
};

exports.claimInvite = async (req, res) => {
  const { token } = req.params;

  const { data: invite, error } = await supabase
    .from('invites')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !invite) return res.status(404).json({ error: 'Invite not found' });
  if (new Date(invite.expires_at) < new Date()) return res.status(410).json({ error: 'Invite expired' });
  if (invite.claimed_by) return res.status(409).json({ error: 'Invite already claimed' });

  const { data: pact } = await supabase
    .from('pacts')
    .select('owner_id, partner_id')
    .eq('id', invite.pact_id)
    .single();

  if (!pact) return res.status(404).json({ error: 'Pact not found' });
  if (pact.owner_id === req.user.id) return res.status(409).json({ error: 'You own this pact' });
  if (pact.partner_id) return res.status(409).json({ error: 'Pact already has a partner' });

  await Promise.all([
    supabase
      .from('pacts')
      .update({ partner_id: req.user.id })
      .eq('id', invite.pact_id),
    supabase
      .from('invites')
      .update({ claimed_by: req.user.id, claimed_at: new Date().toISOString() })
      .eq('id', invite.id),
  ]);

  res.json({ pact_id: invite.pact_id });
};
