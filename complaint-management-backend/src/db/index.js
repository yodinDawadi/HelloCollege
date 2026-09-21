const mongoose = require('mongoose');
const { useMongo, mongoUri } = require('../config/env');

const memory = { users: [], complaints: [], notifications: [] };

async function connectDatabase() {
  if (!useMongo) return;
  if (!mongoUri) throw new Error('MONGODB_URI is required when USE_MONGODB=true');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
}

module.exports = { connectDatabase, memory, useMongo };
