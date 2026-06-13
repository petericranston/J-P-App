const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

async function sendPush(pushToken, title, body, data = {}) {
  if (!pushToken) return;
  try {
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ to: pushToken, title, body, data }),
    });
  } catch (err) {
    console.error('Push notification failed:', err.message);
  }
}

async function sendPushBatch(messages) {
  const valid = messages.filter((m) => m.to);
  if (!valid.length) return;
  try {
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(valid),
    });
  } catch (err) {
    console.error('Push batch failed:', err.message);
  }
}

module.exports = { sendPush, sendPushBatch };
