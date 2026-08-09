const jwt = require('jsonwebtoken');
const { memoryStore, JWT_SECRET } = require('../db/store');

// GET /api/qr/validate?token=...
const validateQrToken = (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'MISSING_TOKEN', message: 'QR token is required.' });
  }

  const cleanToken = token.trim().toLowerCase();

  // 1. Main Booth QR check
  if (cleanToken === 'token-main-booth' || cleanToken === 'main-booth' || cleanToken.includes('main-booth')) {
    const mainBoothToken = jwt.sign({ isMainBooth: true, eventId: 'event-001' }, JWT_SECRET, { expiresIn: '1h' });
    const mainBoothStore = memoryStore.stores.find(s => s.is_main_booth) || {
      id: 'store-main-booth',
      name_ar: 'جناح مجموعة أباريل الرئيسي',
      name_en: 'Apparel Group Main Booth',
      station_code: 'MAIN_BOOTH',
      is_main_booth: true,
      location_text_ar: 'قاعة المعرض ٣ • جناح #A-12',
      location_text_en: 'Exhibition Hall 3 • Booth #A-12'
    };

    return res.json({
      isMainBooth: true,
      mainBoothToken,
      store: mainBoothStore
    });
  }

  // 2. Identify Store Location from Token
  let targetStoreId = null;

  if (cleanToken.includes('aco')) {
    targetStoreId = 'store-aco';
  } else if (cleanToken.includes('skecher')) {
    targetStoreId = 'store-skechers';
  } else if (cleanToken.includes('bhpc') || cleanToken.includes('polo')) {
    targetStoreId = 'store-bhpc';
  } else if (cleanToken.includes('crocs')) {
    targetStoreId = 'store-crocs';
  } else {
    // Search sequence tokens or verify JWT
    const matchedSeq = memoryStore.sequence.find(s => s.qr_token === token || s.qr_token.toLowerCase() === cleanToken);
    if (matchedSeq) {
      targetStoreId = matchedSeq.store_id;
    } else {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        targetStoreId = decoded.storeId;
      } catch (err) {
        // Fallback check against store IDs
        const storeMatch = memoryStore.stores.find(s => s.id.toLowerCase() === cleanToken || s.station_code.toLowerCase() === cleanToken);
        if (storeMatch) {
          targetStoreId = storeMatch.id;
        }
      }
    }
  }

  if (!targetStoreId) {
    return res.status(400).json({
      error: 'INVALID_QR_TOKEN',
      message: 'The scanned QR code is invalid, expired, or tampered with.'
    });
  }

  const storeItem = memoryStore.stores.find(s => s.id === targetStoreId);
  const seqItem = memoryStore.sequence.find(s => s.store_id === targetStoreId);

  if (!storeItem) {
    return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'Store location for this QR code was not found.' });
  }

  return res.json({
    isMainBooth: false,
    store: storeItem,
    storeId: storeItem.id,
    sequenceOrder: seqItem ? seqItem.sequence_order : 1,
    gameKey: seqItem ? seqItem.game_key : 'TIC_TAC_TOE'
  });
};

module.exports = {
  validateQrToken
};
