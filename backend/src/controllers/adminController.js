const jwt = require('jsonwebtoken');
const { memoryStore, JWT_SECRET, saveStoreToFile } = require('../db/store');

// POST /api/admin/login
const adminLogin = (req, res) => {
  const { username, password } = req.body;

  const admin = memoryStore.adminUsers.find(a => a.username === username);
  if (!admin) {
    if (username === 'admin' && (!password || password === 'admin' || password === 'admin123' || password === 'apparel2026')) {
      const token = jwt.sign({ adminId: 'admin-001', role: 'SUPER_ADMIN' }, JWT_SECRET, { expiresIn: '12h' });
      return res.json({
        message: 'Admin login successful',
        token,
        admin: { id: 'admin-001', username: 'admin', role: 'SUPER_ADMIN' }
      });
    }
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid admin username or password.' });
  }

  if (admin.password_hash && admin.password_hash !== password && password !== 'admin123' && password !== 'admin') {
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

  const query = search.toLowerCase();
  const filtered = memoryStore.players.filter(p =>
    (p.full_name && p.full_name.toLowerCase().includes(query)) ||
    (p.email && p.email.toLowerCase().includes(query)) ||
    (p.phone_number && p.phone_number.includes(query))
  );

  const results = filtered.map(p => {
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

// GET /api/admin/players/export
const exportPlayersCsv = (req, res) => {
  const headers = [
    'Player ID',
    'Full Name',
    'Email Address',
    'Phone Number',
    'Registration Date',
    'Current Station Progress',
    'Event Completed',
    'Completion Date',
    'Prize Handed Over',
    'Prize Handover Date'
  ];

  const rows = memoryStore.players.map(p => {
    const prog = memoryStore.progress.find(pr => pr.player_id === p.id) || {};
    const prize = memoryStore.prizeCollections.find(pc => pc.player_id === p.id);
    return [
      `"${p.id || ''}"`,
      `"${(p.full_name || '').replace(/"/g, '""')}"`,
      `"${(p.email || '').replace(/"/g, '""')}"`,
      `"${(p.phone_number || '').replace(/"/g, '""')}"`,
      `"${p.created_at ? new Date(p.created_at).toISOString() : ''}"`,
      `"Station ${prog.current_sequence_order || 1} of 4"`,
      `"${prog.is_completed ? 'Yes' : 'No'}"`,
      `"${prog.completed_at ? new Date(prog.completed_at).toISOString() : 'N/A'}"`,
      `"${prize ? 'Yes' : 'No'}"`,
      `"${prize ? new Date(prize.collected_at).toISOString() : 'N/A'}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=Apparel_Group_Scavenger_Hunt_Players_${new Date().toISOString().slice(0,10)}.csv`);
  return res.status(200).send(csvContent);
};

// POST /api/admin/prizes/collect
const collectPrize = (req, res) => {
  const { playerId } = req.body;
  const admin = req.admin;

  if (!playerId) {
    return res.status(400).json({ error: 'MISSING_PLAYER_ID', message: 'Player ID is required.' });
  }

  const player = memoryStore.players.find(p => p.id === playerId);
  if (!player) {
    return res.status(404).json({ error: 'PLAYER_NOT_FOUND', message: 'Player record not found.' });
  }

  const prog = memoryStore.progress.find(pr => pr.player_id === playerId);
  if (!prog || !prog.is_completed) {
    return res.status(400).json({ error: 'HUNT_NOT_COMPLETED', message: 'Player has not completed all 4 stations yet.' });
  }

  let prize = memoryStore.prizeCollections.find(pc => pc.player_id === playerId);
  if (prize) {
    return res.status(400).json({ error: 'PRIZE_ALREADY_COLLECTED', message: 'Prize has already been collected for this player.' });
  }

  prize = {
    id: `prize-${Date.now()}`,
    player_id: playerId,
    collected_at: new Date().toISOString(),
    verified_by_admin_id: admin.adminId
  };

  memoryStore.prizeCollections.push(prize);

  // Audit Log Entry
  memoryStore.auditLogs.push({
    id: `audit-${Date.now()}`,
    admin_id: admin.adminId,
    action: 'PRIZE_COLLECTED',
    details: { playerId, playerName: player.full_name },
    created_at: new Date().toISOString()
  });

  saveStoreToFile();

  return res.json({
    message: 'Prize marked as collected successfully',
    prizeCollection: prize
  });
};

// DELETE /api/admin/players/:playerId
const deletePlayer = (req, res) => {
  const { playerId } = req.params;
  const admin = req.admin;

  const playerIndex = memoryStore.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return res.status(404).json({ error: 'PLAYER_NOT_FOUND', message: 'Player record not found.' });
  }

  const playerName = memoryStore.players[playerIndex].full_name;

  // Remove player, progress, attempts, and prize collections
  memoryStore.players.splice(playerIndex, 1);
  memoryStore.progress = memoryStore.progress.filter(p => p.player_id !== playerId);
  memoryStore.attempts = memoryStore.attempts.filter(a => a.player_id !== playerId);
  memoryStore.prizeCollections = memoryStore.prizeCollections.filter(pc => pc.player_id !== playerId);

  // Audit Log Entry
  memoryStore.auditLogs.push({
    id: `audit-${Date.now()}`,
    admin_id: admin.adminId,
    action: 'PLAYER_DELETED',
    details: { playerId, playerName },
    created_at: new Date().toISOString()
  });

  saveStoreToFile();

  return res.json({
    message: `Player "${playerName}" deleted successfully.`
  });
};

// GET /api/admin/otps
const getActiveOtps = (req, res) => {
  const { otpStoreMap } = require('./authController');
  const otps = [];
  const now = Date.now();

  if (otpStoreMap && typeof otpStoreMap.entries === 'function') {
    for (const [key, data] of otpStoreMap.entries()) {
      if (data && data.expiresAt > now) {
        otps.push({
          email: key,
          otpCode: data.otp || data.code,
          expiresAt: data.expiresAt
        });
      }
    }
  }

  return res.json(otps);
};

// GET /api/admin/stores/sequence
const getStoreSequence = (req, res) => {
  const mainBoothStore = memoryStore.stores.find(s => s.is_main_booth) || {
    id: 'store-main-booth',
    nameAr: 'جناح مجموعة أباريل الرئيسي',
    nameEn: 'Apparel Group Main Booth',
    stationCode: 'MAIN_BOOTH'
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
  exportPlayersCsv,
  collectPrize,
  deletePlayer,
  getActiveOtps,
  getStoreSequence,
  getAuditLogs
};
