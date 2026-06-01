const app = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
  console.log(`Pact backend listening on port ${PORT}`);
});
