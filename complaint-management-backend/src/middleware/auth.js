const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const userRepository = require('../repositories/userRepository');

function requireAuth() {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
      const payload = jwt.verify(header.slice(7), jwtSecret);
      const user = await userRepository.findById(payload.sub);
      if (!user) return res.status(401).json({ error: 'User not found' });
      req.user = user;
      next();
    } catch { res.status(401).json({ error: 'Invalid or expired token' }); }
  };
}
function requireAdmin(req, res, next) { if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' }); next(); }
module.exports = { requireAuth, requireAdmin };
