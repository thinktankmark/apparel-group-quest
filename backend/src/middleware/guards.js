const jwt = require('jsonwebtoken');
const { JWT_SECRET, memoryStore } = require('../db/store');

// Guard 1: Enforces that registration is ONLY allowed after scanning Main Booth QR
const requireMainBoothRegistrationToken = (req, res, next) => {
  const { mainBoothToken } = req.body;
  if (!mainBoothToken) {
    return res.status(403).json({
      error: 'MAIN_BOOTH_REQUIRED',
      message: 'Registration is only allowed after scanning the Main Booth QR code.'
    });
  }

  try {
    const decoded = jwt.verify(mainBoothToken, JWT_SECRET);
    if (!decoded.isMainBooth) {
      return res.status(403).json({
        error: 'INVALID_MAIN_BOOTH_TOKEN',
        message: 'Invalid registration token. You must return to the Main Booth to register.'
      });
    }
    req.mainBoothContext = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: 'EXPIRED_MAIN_BOOTH_TOKEN',
      message: 'Registration token expired or invalid. Please scan the Main Booth QR code again.'
    });
  }
};

// Guard 2: Server-side progression enforcement for game launching and completion
const validateGameProgression = (req, res, next) => {
  const player = req.player;
  const targetSequence = parseInt(req.body.sequenceOrder || req.query.sequenceOrder, 10);

  if (!targetSequence || isNaN(targetSequence)) {
    return res.status(400).json({ error: 'INVALID_SEQUENCE', message: 'Target sequence order is required.' });
  }

  const progress = memoryStore.progress.find(p => p.player_id === player.id);
  if (!progress) {
    return res.status(400).json({ error: 'NO_PROGRESS_RECORD', message: 'Player progress record missing.' });
  }

  // Attempting a future store sequence before unlocking it
  if (targetSequence > progress.current_sequence_order) {
    return res.status(403).json({
      error: 'LOCATION_LOCKED',
      message: "You haven't unlocked this location yet.",
      currentUnlockedSequence: progress.current_sequence_order
    });
  }

  req.playerProgress = progress;
  next();
};

module.exports = {
  requireMainBoothRegistrationToken,
  validateGameProgression
};
