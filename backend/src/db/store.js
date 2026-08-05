// Database Store Layer with Automatic Disk Persistence & In-Memory Cache
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'apparel-group-scavenger-hunt-secret-2026';
const DATA_FILE = path.join(__dirname, 'persistent_store.json');

// Initial Default State
const memoryStore = {
  events: [
    {
      id: 'event-001',
      title_ar: 'مغامرة البحث عن الكنز - مجموعة أباريل',
      title_en: 'Apparel Group Treasure Hunt Adventure',
      slug: 'apparel-hunt-2026',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  stores: [
    {
      id: 'store-main-booth',
      event_id: 'event-001',
      name_ar: 'جناح مجموعة أباريل الرئيسي',
      name_en: 'Apparel Group Main Booth',
      station_code: 'MAIN_BOOTH',
      is_main_booth: true,
      hero_image_url: '7079890257a17cd0d8ca3d93a919734a6125a264',
      location_text_ar: '📍 قاعة المعرض ٣ • جناح #A-12',
      location_text_en: '📍 Exhibition Hall 3 • Booth #A-12'
    },
    {
      id: 'store-skechers',
      event_id: 'event-001',
      name_ar: 'فرع سكتشرز',
      name_en: 'Skechers Store',
      station_code: 'SKECHERS',
      is_main_booth: false,
      hero_image_url: '34d55b61686498bafee0e7b9cd22896b69575b91',
      location_text_ar: '📍 محطة فرع سكتشرز',
      location_text_en: '📍 Skechers Store Station'
    },
    {
      id: 'store-aco',
      event_id: 'event-001',
      name_ar: 'فرع أكو',
      name_en: 'ACO Store',
      station_code: 'ACO',
      is_main_booth: false,
      hero_image_url: 'cca4f63abe8d7095ba2e58420d30d9f620dcac66',
      location_text_ar: '📍 محطة فرع أكو',
      location_text_en: '📍 ACO Store Station'
    },
    {
      id: 'store-bhpc',
      event_id: 'event-001',
      name_ar: 'فرع نادي بيفرلي هيلز للبولو',
      name_en: 'BHPC Store',
      station_code: 'BHPC',
      is_main_booth: false,
      hero_image_url: '264ac2a5b7a7381daed7e2020fedd3bf698ed358',
      location_text_ar: '📍 محطة فرع نادي بيفرلي هيلز للبولو',
      location_text_en: '📍 BHPC Store Station'
    },
    {
      id: 'store-steve-madden',
      event_id: 'event-001',
      name_ar: 'فرع ستيف مادن',
      name_en: 'Steve Madden Store',
      station_code: 'STEVE_MADDEN',
      is_main_booth: false,
      hero_image_url: '6b71cb2867429c6763e78bf41f798068e6c6129a',
      location_text_ar: '📍 محطة فرع ستيف مادن',
      location_text_en: '📍 Steve Madden Store Station'
    }
  ],
  sequence: [
    {
      id: 'seq-1',
      event_id: 'event-001',
      store_id: 'store-skechers',
      sequence_order: 1,
      game_key: 'MEMORY_MATCH',
      qr_token: 'token-skechers-seq-1',
      qr_signed_jwt: jwt.sign({ storeId: 'store-skechers', sequenceOrder: 1, isMainBooth: false, eventId: 'event-001' }, JWT_SECRET)
    },
    {
      id: 'seq-2',
      event_id: 'event-001',
      store_id: 'store-aco',
      sequence_order: 2,
      game_key: 'SHOE_XO',
      qr_token: 'token-aco-seq-2',
      qr_signed_jwt: jwt.sign({ storeId: 'store-aco', sequenceOrder: 2, isMainBooth: false, eventId: 'event-001' }, JWT_SECRET)
    },
    {
      id: 'seq-3',
      event_id: 'event-001',
      store_id: 'store-bhpc',
      sequence_order: 3,
      game_key: 'HORSE_JUMP',
      qr_token: 'token-bhpc-seq-3',
      qr_signed_jwt: jwt.sign({ storeId: 'store-bhpc', sequenceOrder: 3, isMainBooth: false, eventId: 'event-001' }, JWT_SECRET)
    },
    {
      id: 'seq-4',
      event_id: 'event-001',
      store_id: 'store-steve-madden',
      sequence_order: 4,
      game_key: 'SPEED_TAP',
      qr_token: 'token-stevemadden-seq-4',
      qr_signed_jwt: jwt.sign({ storeId: 'store-steve-madden', sequenceOrder: 4, isMainBooth: false, eventId: 'event-001' }, JWT_SECRET)
    }
  ],
  mainBoothQr: {
    token: 'token-main-booth',
    qr_signed_jwt: jwt.sign({ storeId: 'store-main-booth', isMainBooth: true, eventId: 'event-001' }, JWT_SECRET)
  },
  players: [],
  progress: [],
  attempts: [],
  prizeCollections: [],
  adminUsers: [
    {
      id: 'admin-001',
      username: 'admin',
      password_hash: 'admin123',
      role: 'SUPER_ADMIN',
      created_at: new Date().toISOString()
    }
  ],
  auditLogs: []
};

// Load Persistent Store from Disk on Startup
function loadStoreFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed.players) memoryStore.players = parsed.players;
      if (parsed.progress) memoryStore.progress = parsed.progress;
      if (parsed.attempts) memoryStore.attempts = parsed.attempts;
      if (parsed.prizeCollections) memoryStore.prizeCollections = parsed.prizeCollections;
      if (parsed.auditLogs) memoryStore.auditLogs = parsed.auditLogs;
      console.log(`💾 Loaded persistent store from disk: ${memoryStore.players.length} registered players.`);
    }
  } catch (err) {
    console.error('⚠️ Error loading persistent store file:', err.message);
  }
}

// Save Persistent Store to Disk
function saveStoreToFile() {
  try {
    const toSave = {
      players: memoryStore.players,
      progress: memoryStore.progress,
      attempts: memoryStore.attempts,
      prizeCollections: memoryStore.prizeCollections,
      auditLogs: memoryStore.auditLogs
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(toSave, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ Error saving persistent store file:', err.message);
  }
}

// Auto Load on Module Require
loadStoreFromFile();

module.exports = {
  memoryStore,
  JWT_SECRET,
  saveStoreToFile
};
