const { memoryStore, saveStoreToFile, getFixedStoreSequence } = require('../db/store');

function getGameKeyForStore(storeId) {
  const item = memoryStore.sequence.find(s => s.store_id === storeId);
  if (item) return item.game_key;
  if (storeId === 'store-skechers') return 'MEMORY_MATCH';
  if (storeId === 'store-aco') return 'SPEED_TAP';
  if (storeId === 'store-bhpc') return 'HORSE_JUMP';
  if (storeId === 'store-crocs' || storeId === 'store-steve-madden') return 'TIC_TAC_TOE';
  return 'SPEED_TAP';
}

// GET /api/player/progress
const getPlayerProgress = (req, res) => {
  const player = req.player;

  let progress = memoryStore.progress.find(p => p.player_id === player.id);
  if (!progress) {
    progress = {
      id: `prog-${Date.now()}`,
      player_id: player.id,
      current_sequence_order: 1,
      store_sequence: getFixedStoreSequence(),
      is_completed: false,
      completed_at: null,
      updated_at: new Date().toISOString()
    };
    memoryStore.progress.push(progress);
    saveStoreToFile();
  } else {
    // Ensure store_sequence is always populated with 4 stations
    if (!progress.store_sequence || progress.store_sequence.length < 4) {
      progress.store_sequence = getFixedStoreSequence();
      saveStoreToFile();
    }
  }

  // Find ONLY the current active sequence item & store details
  const currentSeqItem = memoryStore.sequence.find(s => s.sequence_order === progress.current_sequence_order);
  let activeClue = null;

  if (currentSeqItem) {
    const store = memoryStore.stores.find(s => s.id === currentSeqItem.store_id);
    if (store) {
      activeClue = {
        sequenceOrder: currentSeqItem.sequence_order,
        gameKey: currentSeqItem.game_key,
        store: {
          id: store.id,
          nameAr: store.name_ar,
          nameEn: store.name_en,
          stationCode: store.station_code,
          heroImageUrl: store.hero_image_url,
          locationTextAr: store.location_text_ar,
          locationTextEn: store.location_text_en
        }
      };
    }
  }

  return res.json({
    player: {
      id: player.id,
      fullName: player.full_name,
      email: player.email,
      phoneNumber: player.phone_number
    },
    progress: {
      currentSequenceOrder: progress.current_sequence_order,
      storeSequence: progress.store_sequence,
      isCompleted: !!progress.is_completed,
      completedAt: progress.completed_at
    },
    activeClue
  });
};

// POST /api/player/game-complete
const completeGame = (req, res) => {
  const player = req.player;
  const { sequenceOrder, score, durationSeconds, isSuccess } = req.body;

  const seqOrderInt = parseInt(sequenceOrder, 10);
  let progress = memoryStore.progress.find(p => p.player_id === player.id);

  if (!progress) {
    return res.status(400).json({ error: 'PROGRESS_NOT_FOUND', message: 'Player progress not found.' });
  }

  progress.store_sequence = getFixedStoreSequence();

  if (seqOrderInt > progress.current_sequence_order) {
    return res.status(403).json({ error: 'LOCATION_LOCKED', message: "You haven't unlocked this location yet." });
  }

  const currentStoreId = progress.store_sequence[seqOrderInt - 1] || 'store-skechers';
  const gameKey = getGameKeyForStore(currentStoreId);

  const attemptCount = memoryStore.attempts.filter(
    a => a.player_id === player.id && a.sequence_order === seqOrderInt
  ).length + 1;

  const newAttempt = {
    id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    player_id: player.id,
    sequence_order: seqOrderInt,
    game_key: gameKey,
    attempt_number: attemptCount,
    is_success: !!isSuccess,
    score: score || 0,
    duration_seconds: durationSeconds || 0,
    created_at: new Date().toISOString()
  };
  memoryStore.attempts.push(newAttempt);

  if (isSuccess || seqOrderInt === 1) {
    if (seqOrderInt === progress.current_sequence_order) {
      const maxSequence = 4; // Guaranteed 4 stations: Skechers (1), ACO (2), BHPC (3), Crocs (4)

      if (seqOrderInt >= maxSequence) {
        progress.is_completed = true;
        progress.completed_at = new Date().toISOString();
      } else {
        progress.current_sequence_order = seqOrderInt + 1;
        progress.is_completed = false;
      }
      progress.updated_at = new Date().toISOString();
    }
  }

  // Save changes to disk
  saveStoreToFile();

  let nextClue = null;
  if (!progress.is_completed) {
    const nextStoreId = progress.store_sequence[progress.current_sequence_order - 1];
    const nextStore = memoryStore.stores.find(s => s.id === nextStoreId);
    if (nextStore) {
      nextClue = {
        sequenceOrder: progress.current_sequence_order,
        gameKey: getGameKeyForStore(nextStore.id),
        store: {
          id: nextStore.id,
          nameAr: nextStore.name_ar,
          nameEn: nextStore.name_en,
          stationCode: nextStore.station_code,
          heroImageUrl: nextStore.hero_image_url,
          locationTextAr: nextStore.location_text_ar,
          locationTextEn: nextStore.location_text_en
        }
      };
    }
  }

  return res.json({
    message: isSuccess || seqOrderInt === 1 ? 'Stage completed successfully' : 'Stage attempt recorded',
    isSuccess: isSuccess || seqOrderInt === 1,
    progress: {
      currentSequenceOrder: progress.current_sequence_order,
      storeSequence: progress.store_sequence,
      isCompleted: !!progress.is_completed,
      completedAt: progress.completed_at
    },
    nextClue
  });
};

module.exports = {
  getPlayerProgress,
  completeGame
};
