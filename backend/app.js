const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/pacts', require('./routes/pacts'));
app.use('/api/invites', require('./routes/invites'));
app.use('/api/checkins', require('./routes/checkins'));
app.use('/api/streaks', require('./routes/streaks'));
app.use('/api/sprints', require('./routes/sprints'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/internal', require('./routes/internal'));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
