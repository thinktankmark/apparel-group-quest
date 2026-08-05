const jwt = require('jsonwebtoken');
const { memoryStore, JWT_SECRET } = require('../db/store');

// GET /api/qr/validate?token=...
const validateQrToken = (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'MISSING_TOKEN', message: 'QR token is required.' });
  }

  // 1. Check known mock tokens or verify JWT signature
  let decoded;
  try {
    if (token === 'token-main-booth') {
      decoded = { isMainBooth: true, storeId: 'store-main-booth', eventId: 'event-001' };
    } else {
      const matchedSeq = memoryStore.sequence.find(s => s.qr_token === token);
      if (matchedSeq) {
        decoded = {
          storeId: matchedSeq.store_id,
          sequenceOrder: matchedSeq.sequence_order,
          gameKey: matchedSeq.game_key,
          isMainBooth: false,
          eventId: matchedSeq.event_id
        };
      } else {
        decoded = jwt.verify(token, JWT_SECRET);
      }
    }
  } catch (err) {
    return res.status(400).json({
      error: 'INVALID_QR_TOKEN',
      message: 'The scanned QR code is invalid, expired, or tampered with.'
    });
  }

  // 2. Main Booth QR
  if (decoded.isMainBooth) {
    const mainBoothToken = jwt.sign({ isMainBooth: true, eventId: decoded.eventId }, JWT_SECRET, { expiresIn: '1h' });
    const mainBoothStore = memoryStore.stores.find(s => s.is_main_booth);

    return res.json({
      isMainBooth: true,
      mainBoothToken,
      store: mainBoothStore
    });
  }

  // 3. Store Checkpoint QR
  const seqItem = memoryStore.sequence.find(s => s.store_id === decoded.storeId);
  const storeItem = memoryStore.stores.find(s => s.id === decoded.storeId);

  if (!seqItem || !storeItem) {
    return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'Store location for this QR code was not found.' });
  }

  return res.json({
    isMainBooth: false,
    store: storeItem,
    sequenceOrder: seqItem.sequence_order,
    gameKey: seqItem.game_key
  });
};

module.exports = {
  validateQrToken
};
