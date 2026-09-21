const { port } = require('./config/env');
const { connectDatabase } = require('./db');
const { app } = require('./app');

async function start() {
  await connectDatabase();
  app.listen(port, '0.0.0.0', () => console.log(`Complaint API listening on http://0.0.0.0:${port}`));
}
start().catch(error => { console.error(error); process.exit(1); });
