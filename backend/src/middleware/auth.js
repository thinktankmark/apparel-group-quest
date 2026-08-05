const jwt = require('jsonwebtoken');
const { JWT_SECRET, memoryStore } = require('../db/store');

const authenticatePlayer = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.playerId) {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid player session token' });
    }

    const player = memoryStore.players.find(p => p.id === decoded.playerId);
    if (!player) {
      return res.status(401).json({ error: 'PLAYER_NOT_FOUND', message: 'Player account no longer exists' });
    }

    req.player = player;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Session expired. Please log in again.' });
  }
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Admin authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.adminId) {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid admin token' });
    }

    const admin = memoryStore.adminUsers.find(a => a.id === decoded.adminId);
    if (!admin) {
      return res.status(401).json({ error: 'ADMIN_NOT_FOUND', message: 'Admin user not found' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Admin session expired.' });
  }
};

module.exports = {
  authenticatePlayer,
  authenticateAdmin
};
