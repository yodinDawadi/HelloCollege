const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  useMongo: String(process.env.USE_MONGODB).toLowerCase() === 'true',
  mongoUri: process.env.MONGODB_URI
};
