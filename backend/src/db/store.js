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
      id: 'store-crocs',
      event_id: 'event-001',
      name_ar: 'فرع كروكس',
      name_en: 'Crocs Store',
      station_code: 'CROCS',
      is_main_booth: false,
      hero_image_url: '6b71cb2867429c6763e78bf41f798068e6c6129a',
      location_text_ar: 'محطة فرع كروكس',
      location_text_en: 'Crocs Store Station'
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
      game_key: 'SPEED_TAP',
      qr_token: 'token-aco-seq-2',
      qr_signed_jwt: jwt.sign({ sequenceOrder: 2, storeId: 'store-aco', gameKey: 'SPEED_TAP' }, JWT_SECRET)
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
      store_id: 'store-crocs',
      game_key: 'TIC_TAC_TOE',
      qr_token: 'token-crocs-seq-4',
      qr_signed_jwt: jwt.sign({ sequenceOrder: 4, storeId: 'store-crocs', gameKey: 'TIC_TAC_TOE' }, JWT_SECRET)
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
      role: 'SUPER_ADMIN',
      created_at: new Date().toISOString()
    }
  ],
  auditLogs: []
};

// Load persistent data from JSON file if exists
function loadStoreFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(fileData);
      if (parsed) {
        if (parsed.players) memoryStore.players = parsed.players;
        if (parsed.progress) memoryStore.progress = parsed.progress;
        if (parsed.attempts) memoryStore.attempts = parsed.attempts;
        if (parsed.prizeCollections) memoryStore.prizeCollections = parsed.prizeCollections;
        if (parsed.adminUsers) memoryStore.adminUsers = parsed.adminUsers;
        if (parsed.auditLogs) memoryStore.auditLogs = parsed.auditLogs;
        if (parsed.stores) memoryStore.stores = parsed.stores;
      }
    }
  } catch (err) {
    console.error('⚠️ Warning loading persistent_store.json:', err.message);
  }
}

// Save persistent data to JSON file
function saveStoreToFile() {
  try {
    const dataToSave = {
      players: memoryStore.players,
      progress: memoryStore.progress,
      attempts: memoryStore.attempts,
      prizeCollections: memoryStore.prizeCollections,
      adminUsers: memoryStore.adminUsers,
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

function getFixedStoreSequence() {
  return ['store-skechers', 'store-aco', 'store-bhpc', 'store-crocs'];
}

function createRandomizedStoreSequence() {
  const stores = ['store-skechers', 'store-aco', 'store-bhpc', 'store-crocs'];
  for (let i = stores.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stores[i], stores[j]] = [stores[j], stores[i]];
  }
  return stores;
}

module.exports = {
  memoryStore,
  JWT_SECRET,
  saveStoreToFile,
  getFixedStoreSequence,
  createRandomizedStoreSequence
};
