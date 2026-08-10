const jwt = require('jsonwebtoken');
const { memoryStore, JWT_SECRET, saveStoreToFile, getFixedStoreSequence, createRandomizedStoreSequence } = require('../db/store');
const { sendOtpEmail } = require('../utils/mailer');

// In-Memory OTP Cache Store (email -> { otp: string, expiresAt: number })
const otpStoreMap = new Map();

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'MISSING_EMAIL', message: 'Email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Generate 6-digit random OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 Minutes TTL

  otpStoreMap.set(cleanEmail, { otp: otpCode, expiresAt });

  try {
    const sendPromise = sendOtpEmail(cleanEmail, otpCode);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 5000)
    );

    await Promise.race([sendPromise, timeoutPromise]);
    console.log(`📧 OTP code ${otpCode} sent to ${cleanEmail}`);
  } catch (err) {
    console.error(`⚠️ Email send notice for ${cleanEmail} (${err.message}). OTP code ${otpCode} active.`);
  }

  return res.json({
    message: 'OTP_SENT',
    email: cleanEmail,
    info: 'A 6-digit verification code has been generated for your email.'
  });
};

// POST /api/auth/verify-otp
const verifyOtp = (req, res) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email and verification code are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = otpCode.trim();

  const record = otpStoreMap.get(cleanEmail);
  if (!record) {
    return res.status(400).json({
      error: 'OTP_EXPIRED_OR_NOT_FOUND',
      message: 'Verification code not found or expired. Please request a new code.'
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStoreMap.delete(cleanEmail);
    return res.status(400).json({
      error: 'OTP_EXPIRED',
      message: 'Verification code has expired. Please click resend to get a new code.'
    });
  }

  if (record.otp !== cleanOtp) {
    return res.status(400).json({
      error: 'INVALID_OTP',
      message: 'Invalid 6-digit verification code. Please check your email and try again.'
    });
  }

  // Clear OTP on successful verification
  otpStoreMap.delete(cleanEmail);

  return res.json({
    message: 'OTP_VERIFIED',
    isVerified: true
  });
};

// POST /api/auth/register
const register = (req, res) => {
  const { fullName, email, phoneNumber } = req.body;

  if (!fullName || !email || !phoneNumber) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Full name, email, and phone number are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');

  // 1. Duplicate Email Check
  const existingEmail = memoryStore.players.find(
    p => p.email.toLowerCase() === cleanEmail && p.event_id === 'event-001'
  );
  if (existingEmail) {
    return res.status(409).json({
      error: 'EMAIL_ALREADY_EXISTS',
      message: 'Email address is already registered. Please log in.'
    });
  }

  // 2. Duplicate Phone Check
  const existingPhone = memoryStore.players.find(
    p => p.phone_number.replace(/\s+/g, '') === cleanPhone && p.event_id === 'event-001'
  );
  if (existingPhone) {
    return res.status(409).json({
      error: 'PHONE_ALREADY_EXISTS',
      message: 'Phone number is already registered. Please log in.'
    });
  }

  // 3. Create Player Record
  const newPlayer = {
    id: `player-${Date.now()}`,
    event_id: 'event-001',
    full_name: fullName.trim(),
    email: cleanEmail,
    phone_number: cleanPhone,
    registered_at_store_id: 'store-main-booth',
    created_at: new Date().toISOString()
  };

  memoryStore.players.push(newPlayer);

  // 4. Initialize Player Progress with Shuffled 4-Store Sequence
  const storeSeq = createRandomizedStoreSequence();
  const newProgress = {
    id: `prog-${Date.now()}`,
    player_id: newPlayer.id,
    current_sequence_order: 1,
    store_sequence: storeSeq,
    is_completed: false,
    completed_at: null,
    updated_at: new Date().toISOString()
  };

  memoryStore.progress.push(newProgress);

  saveStoreToFile();

  // 5. Generate Auth Token
  const token = jwt.sign({ playerId: newPlayer.id, email: newPlayer.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    message: 'Registration successful',
    token,
    player: {
      id: newPlayer.id,
      fullName: newPlayer.full_name,
      email: newPlayer.email,
      phoneNumber: newPlayer.phone_number
    },
    progress: {
      currentSequenceOrder: newProgress.current_sequence_order,
      storeSequence: newProgress.store_sequence,
      isCompleted: newProgress.is_completed
    }
  });
};

// POST /api/auth/login
const login = (req, res) => {
  const { credential, phoneNumber, email } = req.body;
  const input = credential || phoneNumber || email;

  if (!input || !input.trim()) {
    return res.status(400).json({ error: 'MISSING_CREDENTIAL', message: 'Phone number or email is required.' });
  }

  const clean = input.trim().toLowerCase();
  const cleanPhone = input.trim().replace(/\s+/g, '');

  const player = memoryStore.players.find(
    p => p.email.toLowerCase() === clean || p.phone_number.replace(/\s+/g, '') === cleanPhone
  );

  if (!player) {
    return res.status(404).json({
      error: 'ACCOUNT_NOT_FOUND',
      showBoothPopup: true,
      message: '⚠️ الحساب غير موجود. يرجى زيارة جناح أباريل الرئيسي للتسجيل في المسابقة.'
    });
  }

  let progress = memoryStore.progress.find(p => p.player_id === player.id);
  if (!progress) {
    progress = {
      id: `prog-${Date.now()}`,
      player_id: player.id,
      current_sequence_order: 1,
      store_sequence: createRandomizedStoreSequence(),
      is_completed: false,
      completed_at: null,
      updated_at: new Date().toISOString()
    };
    memoryStore.progress.push(progress);
    saveStoreToFile();
  }

  const token = jwt.sign({ playerId: player.id, email: player.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    message: 'Login successful',
    token,
    player: {
      id: player.id,
      fullName: player.full_name,
      email: player.email,
      phoneNumber: player.phone_number
    },
    progress: {
      currentSequenceOrder: progress.current_sequence_order,
      storeSequence: progress.store_sequence,
      isCompleted: progress.is_completed
    }
  });
};

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  login,
  otpStoreMap
};
