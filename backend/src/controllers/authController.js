const jwt = require('jsonwebtoken');
const { memoryStore, JWT_SECRET, saveStoreToFile } = require('../db/store');

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

  // 4. Initialize Player Progress (Sequence 1)
  const newProgress = {
    id: `prog-${Date.now()}`,
    player_id: newPlayer.id,
    current_sequence_order: 1,
    is_completed: false,
    completed_at: null,
    updated_at: new Date().toISOString()
  };

  memoryStore.progress.push(newProgress);

  // Auto-save store to disk
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
      currentSequenceOrder: 1,
      isCompleted: false
    }
  });
};

// POST /api/auth/login (Supports EITHER Email Address OR Phone Number)
const login = (req, res) => {
  const { phoneNumber, credential } = req.body;
  const inputVal = (phoneNumber || credential || '').trim();

  if (!inputVal) {
    return res.status(400).json({ error: 'MISSING_CREDENTIAL', message: 'Phone number or email address is required.' });
  }

  const cleanInput = inputVal.toLowerCase();
  const cleanPhoneInput = inputVal.replace(/\s+/g, '');

  const player = memoryStore.players.find(
    p => p.email.toLowerCase() === cleanInput || p.phone_number.replace(/\s+/g, '') === cleanPhoneInput
  );

  // Unregistered Account -> Trigger Figma Booth Popup Modal
  if (!player) {
    return res.status(404).json({
      error: 'ACCOUNT_NOT_FOUND',
      message: "Account doesn't exist. Please check your number or email, or visit our booth to sign up.",
      showBoothPopup: true,
      boothInfo: {
        locationAr: '📍 قاعة المعرض ٣ • جناح #A-12',
        locationEn: '📍 Exhibition Hall 3 • Booth #A-12',
        titleAr: 'تفضل بزيارة جناحنا للتسجيل!',
        titleEn: 'Visit Our Booth to Sign Up!',
        bodyAr: 'لتسجيل وتفعيل حسابك، يرجى زيارة جناحنا في قاعة المعرض.',
        bodyEn: 'To register for the Treasure Hunt, please visit our booth.'
      }
    });
  }

  const progress = memoryStore.progress.find(p => p.player_id === player.id) || { current_sequence_order: 1, is_completed: false };
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
      isCompleted: progress.is_completed
    }
  });
};

module.exports = {
  register,
  login
};
