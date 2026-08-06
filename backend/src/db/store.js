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
      location_text_ar: 'قاعة المعرض ٣ • جناح #A-12',
      location_text_en: 'Exhibition Hall 3 • Booth #A-12'
    },
    {
      id: 'store-skechers',
      event_id: 'event-001',
      name_ar: 'فرع سكتشرز',
      name_en: 'Skechers Store',
      station_code: 'SKECHERS',
      is_main_booth: false,
      hero_image_url: '34d55b61686498bafee0e7b9cd22896b69575b91',
      location_text_ar: 'محطة فرع سكتشرز',
      location_text_en: 'Skechers Store Station'
    },
    {
      id: 'store-aco',
      event_id: 'event-001',
      name_ar: 'فرع أكو',
      name_en: 'ACO Store',
      station_code: 'ACO',
      is_main_booth: false,
      hero_image_url: 'cca4f63abe8d7095ba2e58420d30d9f620dcac66',
      location_text_ar: 'محطة فرع أكو',
      location_text_en: 'ACO Store Station'
    },
    {
      id: 'store-bhpc',
      event_id: 'event-001',
      name_ar: 'فرع نادي بيفرلي هيلز للبولو',
      name_en: 'BHPC Store',
      station_code: 'BHPC',
      is_main_booth: false,
      hero_image_url: '264ac2a5b7a7381daed7e2020fedd3bf698ed358',
      location_text_ar: 'محطة فرع نادي بيفرلي هيلز للبولو',
      location_text_en: 'BHPC Store Station'
    },
    {
      id: 'store-steve-madden',
      event_id: 'event-001',
      name_ar: 'فرع ستيف مادن',
      name_en: 'Steve Madden Store',
      station_code: 'STEVE_MADDEN',
      is_main_booth: false,
      hero_image_url: '6b71cb2867429c6763e78bf41f798068e6c6129a',
      location_text_ar: 'محطة فرع ستيف مادن',
      location_text_en: 'Steve Madden Store Station'
    }
  ],
  sequence: [
    {
      id: 'seq-1',
      event_id: 'event-001',
      sequence_order: 1,
      store_id: 'store-skechers',
      game_key: 'MEMORY_MATCH',
      qr_token: 'token-skechers-seq-1',
      qr_signed_jwt: jwt.sign({ sequenceOrder: 1, storeId: 'store-skechers', gameKey: 'MEMORY_MATCH' }, JWT_SECRET)
    },
    {
      id: 'seq-2',
      event_id: 'event-001',
      sequence_order: 2,
      store_id: 'store-aco',
      game_key: 'TIC_TAC_TOE',
      qr_token: 'token-aco-seq-2',
      qr_signed_jwt: jwt.sign({ sequenceOrder: 2, storeId: 'store-aco', gameKey: 'TIC_TAC_TOE' }, JWT_SECRET)
    },
    {
      id: 'seq-3',
      event_id: 'event-001',
      sequence_order: 3,
      store_id: 'store-bhpc',
      game_key: 'HORSE_JUMP',
      qr_token: 'token-bhpc-seq-3',
      qr_signed_jwt: jwt.sign({ sequenceOrder: 3, storeId: 'store-bhpc', gameKey: 'HORSE_JUMP' }, JWT_SECRET)
    },
    {
      id: 'seq-4',
      event_id: 'event-001',
      sequence_order: 4,
      store_id: 'store-steve-madden',
      game_key: 'SPEED_TAP',
      qr_token: 'token-steve-seq-4',
      qr_signed_jwt: jwt.sign({ sequenceOrder: 4, storeId: 'store-steve-madden', gameKey: 'SPEED_TAP' }, JWT_SECRET)
    }
  ],
  mainBoothQr: {
    token: 'token-main-booth',
    qr_signed_jwt: jwt.sign({ sequenceOrder: 0, storeId: 'store-main-booth', gameKey: 'REGISTRATION' }, JWT_SECRET)
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
      role: 'SUPER_ADMIN'
    }
  ],
  auditLogs: []
};

// Persistence Handlers
function loadStoreFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      const json = JSON.parse(fileData);

      if (json.players) memoryStore.players = json.players;
      if (json.progress) memoryStore.progress = json.progress;
      if (json.attempts) memoryStore.attempts = json.attempts;
      if (json.prizeCollections) memoryStore.prizeCollections = json.prizeCollections;
      if (json.auditLogs) memoryStore.auditLogs = json.auditLogs;

      // Clean up any residual location pin emojis in persistent store
      if (memoryStore.stores) {
        memoryStore.stores.forEach(st => {
          if (st.location_text_ar) st.location_text_ar = st.location_text_ar.replace(/^📍\s*/, '');
          if (st.location_text_en) st.location_text_en = st.location_text_en.replace(/^📍\s*/, '');
        });
      }

      console.log(`💾 Persisted database loaded successfully (${memoryStore.players.length} players).`);
    }
  } catch (err) {
    console.error('⚠️ Warning reading persistent_store.json:', err.message);
  }
}

function saveStoreToFile() {
  try {
    const dataToSave = {
      players: memoryStore.players,
      progress: memoryStore.progress,
      attempts: memoryStore.attempts,
      prizeCollections: memoryStore.prizeCollections,
      auditLogs: memoryStore.auditLogs,
      stores: memoryStore.stores
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ Warning writing persistent_store.json:', err.message);
  }
}

// Load disk state on startup
loadStoreFromFile();

module.exports = {
  memoryStore,
  JWT_SECRET,
  saveStoreToFile
};
