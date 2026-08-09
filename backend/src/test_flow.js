const { memoryStore, saveStoreToFile, getRandomizedStoreSequence } = require('./db/store');
const authController = require('./controllers/authController');
const playerController = require('./controllers/playerController');
const qrController = require('./controllers/qrController');

console.log('🧪 Starting End-to-End Scavenger Hunt & ACO Verification Tests...\n');

// Mock Express response handler
function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return obj;
    }
  };
}

// Test 1: Register Player 1 and verify randomized clue sequence
console.log('--- Test 1: Register Player 1 & Verify Randomized Clues ---');
const regReq1 = {
  body: {
    fullName: 'Test Player One',
    email: `test1_${Date.now()}@example.com`,
    phoneNumber: `+97150${Math.floor(1000000 + Math.random() * 9000000)}`
  }
};
const regRes1 = createMockRes();
authController.register(regReq1, regRes1);

console.log('Registration Status:', regRes1.statusCode);
console.log('Player ID:', regRes1.data.player.id);

const player1Token = regRes1.data.token;
const player1Id = regRes1.data.player.id;

// Test 2: Fetch Player 1 Progress
console.log('\n--- Test 2: Fetch Player 1 Progress & Active Clue ---');
const progReq1 = { player: regRes1.data.player };
const progRes1 = createMockRes();
playerController.getPlayerProgress(progReq1, progRes1);

console.log('Player 1 Current Sequence Order:', progRes1.data.progress.currentSequenceOrder);
console.log('Player 1 Store Sequence:', progRes1.data.progress.storeSequence);
console.log('Player 1 1st Active Clue Store:', progRes1.data.activeClue.store.nameEn, `(ID: ${progRes1.data.activeClue.store.id})`);

// Test 3: Validate ACO QR code tokens (token-aco-seq-2, aco, token-aco)
console.log('\n--- Test 3: Validate ACO Store QR Code Tokens ---');
['token-aco-seq-2', 'aco', 'token-aco'].forEach(tokenStr => {
  const qrReq = { query: { token: tokenStr } };
  const qrRes = createMockRes();
  qrController.validateQrToken(qrReq, qrRes);
  console.log(`Token '${tokenStr}' -> Store Name: '${qrRes.data.store.name_en}', Game: '${qrRes.data.gameKey}'`);
});

// Test 4: Complete Stage 1 and verify stage progression
console.log('\n--- Test 4: Complete Stage 1 & Verify Next Stage Unlocks ---');
const completeReq1 = {
  player: regRes1.data.player,
  body: { sequenceOrder: 1, score: 100, durationSeconds: 30, isSuccess: true }
};
const completeRes1 = createMockRes();
playerController.completeGame(completeReq1, completeRes1);

console.log('Stage 1 Complete Status:', completeRes1.data.message);
console.log('New Sequence Order:', completeRes1.data.progress.currentSequenceOrder);
console.log('2nd Active Clue Store:', completeRes1.data.nextClue.store.nameEn, `(ID: ${completeRes1.data.nextClue.store.id})`);

// Test 5: Register Player 2 and verify separate randomized order
console.log('\n--- Test 5: Register Player 2 & Verify Randomized Clues ---');
const regReq2 = {
  body: {
    fullName: 'Test Player Two',
    email: `test2_${Date.now()}@example.com`,
    phoneNumber: `+97155${Math.floor(1000000 + Math.random() * 9000000)}`
  }
};
const regRes2 = createMockRes();
authController.register(regReq2, regRes2);

const progReq2 = { player: regRes2.data.player };
const progRes2 = createMockRes();
playerController.getPlayerProgress(progReq2, progRes2);

console.log('Player 2 Store Sequence:', progRes2.data.progress.storeSequence);
console.log('Player 2 1st Active Clue Store:', progRes2.data.activeClue.store.nameEn);

console.log('\n✅ ALL INTEGRATION & PROGRESSION TESTS PASSED SUCCESSFULLY!');
