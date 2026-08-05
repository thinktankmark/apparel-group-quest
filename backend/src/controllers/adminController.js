const jwt = require('jsonwebtoken');
const { memoryStore, JWT_SECRET, saveStoreToFile } = require('../db/store');

// POST /api/admin/login
const adminLogin = (req, res) => {
  const { username, password } = req.body;

  const admin = memoryStore.adminUsers.find(a => a.username === username);
  if (!admin || admin.password_hash !== password) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid admin username or password.' });
  }

  const token = jwt.sign({ adminId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '12h' });
  return res.json({
    message: 'Admin login successful',
    token,
    admin: { id: admin.id, username: admin.username, role: admin.role }
  });
};

// GET /api/admin/analytics
const getAnalytics = (req, res) => {
  const totalRegistered = memoryStore.players.length;
  const completedPlayers = memoryStore.progress.filter(p => p.is_completed).length;
  const activePlayers = totalRegistered - completedPlayers;
  const totalGamesPlayed = memoryStore.attempts.length;
  const totalPrizesCollected = memoryStore.prizeCollections.length;
  const completionRate = totalRegistered > 0 ? ((completedPlayers / totalRegistered) * 100).toFixed(1) : 0;

  return res.json({
    totalRegistered,
    activePlayers,
    completedPlayers,
    totalGamesPlayed,
    totalPrizesCollected,
    completionRate: parseFloat(completionRate)
  });
};

// GET /api/admin/players?search=...
const searchPlayers = (req, res) => {
  const { search } = req.query;

  if (!search) {
    const results = memoryStore.players.map(p => {
      const prog = memoryStore.progress.find(pr => pr.player_id === p.id) || {};
      const prize = memoryStore.prizeCollections.find(pc => pc.player_id === p.id);
      return {
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        phoneNumber: p.phone_number,
        registeredAt: p.created_at,
        currentSequenceOrder: prog.current_sequence_order || 1,
        isCompleted: !!prog.is_completed,
        completedAt: prog.completed_at || null,
        isPrizeCollected: !!prize,
        prizeCollectedAt: prize ? prize.collected_at : null
      };
    });
    return res.json(results);
  }

  const q = search.trim().toLowerCase();
  const matchedPlayers = memoryStore.players.filter(p =>
    p.email.toLowerCase().includes(q) || p.phone_number.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) || p.full_name.toLowerCase().includes(q)
  );

  const results = matchedPlayers.map(p => {
    const prog = memoryStore.progress.find(pr => pr.player_id === p.id) || {};
    const prize = memoryStore.prizeCollections.find(pc => pc.player_id === p.id);
    return {
      id: p.id,
      fullName: p.full_name,
      email: p.email,
      phoneNumber: p.phone_number,
      registeredAt: p.created_at,
      currentSequenceOrder: prog.current_sequence_order || 1,
      isCompleted: !!prog.is_completed,
      completedAt: prog.completed_at || null,
      isPrizeCollected: !!prize,
      prizeCollectedAt: prize ? prize.collected_at : null
    };
  });

  return res.json(results);
};

// POST /api/admin/prizes/collect
const collectPrize = (req, res) => {
  const { playerId, notes } = req.body;
  const admin = req.admin;

  if (!playerId) {
    return res.status(400).json({ error: 'MISSING_PLAYER_ID', message: 'Player ID is required.' });
  }

  const player = memoryStore.players.find(p => p.id === playerId);
  if (!player) {
    return res.status(404).json({ error: 'PLAYER_NOT_FOUND', message: 'Player not found.' });
  }

  const progress = memoryStore.progress.find(p => p.player_id === playerId);
  if (!progress || !progress.is_completed) {
    return res.status(400).json({
      error: 'QUEST_NOT_COMPLETED',
      message: 'Player has not completed all scavenger hunt challenges yet.'
    });
  }

  const existingCollection = memoryStore.prizeCollections.find(pc => pc.player_id === playerId);
  if (existingCollection) {
    return res.status(409).json({
      error: 'PRIZE_ALREADY_COLLECTED',
      message: `Prize was already collected on ${new Date(existingCollection.collected_at).toLocaleString()}.`,
      collectedAt: existingCollection.collected_at
    });
  }

  const newCollection = {
    id: `prize-${Date.now()}`,
    player_id: playerId,
    collected_at: new Date().toISOString(),
    collected_by_admin_id: admin.id,
    notes: notes || 'Prize marked as collected at Main Booth'
  };

  memoryStore.prizeCollections.push(newCollection);

  memoryStore.auditLogs.push({
    id: `log-${Date.now()}`,
    admin_id: admin.id,
    action: 'MARK_PRIZE_COLLECTED',
    details: { playerId, playerName: player.full_name, playerEmail: player.email },
    created_at: new Date().toISOString()
  });

  saveStoreToFile();

  return res.json({
    message: 'Prize marked as collected successfully',
    collection: newCollection
  });
};

// DELETE /api/admin/players/:playerId
const deletePlayer = (req, res) => {
  const { playerId } = req.params;
  const admin = req.admin;

  const playerIndex = memoryStore.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return res.status(404).json({ error: 'PLAYER_NOT_FOUND', message: 'Player not found.' });
  }

  const deletedPlayer = memoryStore.players[playerIndex];

  // Delete player, progress, attempts, and prize collections
  memoryStore.players.splice(playerIndex, 1);
  memoryStore.progress = memoryStore.progress.filter(p => p.player_id !== playerId);
  memoryStore.attempts = memoryStore.attempts.filter(a => a.player_id !== playerId);
  memoryStore.prizeCollections = memoryStore.prizeCollections.filter(pc => pc.player_id !== playerId);

  memoryStore.auditLogs.push({
    id: `log-${Date.now()}`,
    admin_id: admin.id,
    action: 'DELETE_PLAYER',
    details: { playerId, playerName: deletedPlayer.full_name, playerEmail: deletedPlayer.email, playerPhone: deletedPlayer.phone_number },
    created_at: new Date().toISOString()
  });

  saveStoreToFile();

  return res.json({
    message: 'Player deleted successfully',
    playerId
  });
};

// GET /api/admin/stores/sequence (Includes Main Booth Registration QR + Station 1-4 QRs)
const getStoreSequence = (req, res) => {
  const mainBoothStore = memoryStore.stores.find(st => st.id === 'store-main-booth') || {
    id: 'store-main-booth',
    name_ar: 'جناح مجموعة أباريل الرئيسي',
    name_en: 'Apparel Group Main Booth'
  };

  const mainBoothItem = {
    sequenceId: 'main-booth',
    sequenceOrder: 0,
    gameKey: 'REGISTRATION',
    store: mainBoothStore,
    qrToken: memoryStore.mainBoothQr.token,
    qrSignedJwt: memoryStore.mainBoothQr.qr_signed_jwt
  };

  const stationItems = memoryStore.sequence.map(s => {
    const store = memoryStore.stores.find(st => st.id === s.store_id);
    return {
      sequenceId: s.id,
      sequenceOrder: s.sequence_order,
      gameKey: s.game_key,
      store: store,
      qrToken: s.qr_token,
      qrSignedJwt: s.qr_signed_jwt
    };
  });

  return res.json([mainBoothItem, ...stationItems]);
};

// GET /api/admin/logs
const getAuditLogs = (req, res) => {
  return res.json(memoryStore.auditLogs);
};

module.exports = {
  adminLogin,
  getAnalytics,
  searchPlayers,
  collectPrize,
  deletePlayer,
  getStoreSequence,
  getAuditLogs
};
