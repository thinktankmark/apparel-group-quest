const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const qrController = require('../controllers/qrController');
const playerController = require('../controllers/playerController');
const adminController = require('../controllers/adminController');

const { authenticatePlayer, authenticateAdmin } = require('../middleware/auth');
const { requireMainBoothRegistrationToken, validateGameProgression } = require('../middleware/guards');

// --- Public Auth & OTP Routes ---
router.post('/auth/send-otp', authController.sendOtp);
router.post('/auth/verify-otp', authController.verifyOtp);
router.post('/auth/register', requireMainBoothRegistrationToken, authController.register);
router.post('/auth/login', authController.login);

// --- Public QR Token Validation Route ---
router.get('/qr/validate', qrController.validateQrToken);

// --- Protected Player Routes ---
router.get('/player/progress', authenticatePlayer, playerController.getPlayerProgress);
router.post('/player/game-complete', authenticatePlayer, validateGameProgression, playerController.completeGame);

// --- Admin Portal Routes ---
router.post('/admin/login', adminController.adminLogin);
router.get('/admin/analytics', authenticateAdmin, adminController.getAnalytics);
router.get('/admin/players', authenticateAdmin, adminController.searchPlayers);
router.get('/admin/players/export', authenticateAdmin, adminController.exportPlayersCsv);
router.post('/admin/prizes/collect', authenticateAdmin, adminController.collectPrize);
router.delete('/admin/players/:playerId', authenticateAdmin, adminController.deletePlayer);
router.get('/admin/otps', authenticateAdmin, adminController.getActiveOtps);
router.get('/admin/stores/sequence', authenticateAdmin, adminController.getStoreSequence);
router.get('/admin/logs', authenticateAdmin, adminController.getAuditLogs);

module.exports = router;
