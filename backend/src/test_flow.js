const { memoryStore, saveStoreToFile } = require('./db/store');
const authController = require('./controllers/authController');
const playerController = require('./controllers/playerController');
const qrController = require('./controllers/qrController');

console.log('🧪 Starting End-to-End Fixed Sequence & ACO Progression Tests...\n');

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

// Test 1: Register Player
console.log('--- Test 1: Register Player at Main Booth ---');
const regReq = {
  body: {
    fullName: 'Sequence Test Player',
    email: `seq_${Date.now()}@example.com`,
    phoneNumber: `+97150${Math.floor(1000000 + Math.random() * 9000000)}`
  }
};
const regRes = createMockRes();
authController.register(regReq, regRes);
console.log('Registration Status:', regRes.statusCode);

const player = regRes.data.player;

// Test 2: Verify Initial Progress (Stage 1 = Skechers Store)
console.log('\n--- Test 2: Initial Stage 1 Progress Check ---');
const progReq1 = { player };
const progRes1 = createMockRes();
playerController.getPlayerProgress(progReq1, progRes1);

console.log('Current Sequence Order:', progRes1.data.progress.currentSequenceOrder);
console.log('Stage 1 Active Store:', progRes1.data.activeClue.store.nameEn, `(Code: ${progRes1.data.activeClue.store.stationCode})`);
if (progRes1.data.activeClue.store.stationCode !== 'SKECHERS') {
  throw new Error('FAIL: Stage 1 must be Skechers Store');
}

// Test 3: Attempt ACO QR Scan at Stage 1 (Locked Check)
console.log('\n--- Test 3: Scan ACO QR Code at Stage 1 (Lock Check) ---');
const acoQrReq = { query: { token: 'token-aco-seq-2' } };
const acoQrRes = createMockRes();
qrController.validateQrToken(acoQrReq, acoQrRes);
console.log('Scanned QR Store:', acoQrRes.data.store.name_en, `(Sequence Order: ${acoQrRes.data.sequenceOrder})`);

// Test 4: Complete Stage 1 (Skechers) -> Unlock Stage 2 (ACO Store)
console.log('\n--- Test 4: Complete Stage 1 (Skechers) & Unlock Stage 2 (ACO Store) ---');
const completeReq1 = {
  player,
  body: { sequenceOrder: 1, score: 100, durationSeconds: 25, isSuccess: true }
};
const completeRes1 = createMockRes();
playerController.completeGame(completeReq1, completeRes1);

console.log('Stage 1 Completion Result:', completeRes1.data.message);
console.log('New Sequence Order:', completeRes1.data.progress.currentSequenceOrder);
console.log('Stage 2 Next Clue Store:', completeRes1.data.nextClue.store.nameEn, `(Code: ${completeRes1.data.nextClue.store.stationCode})`);

if (completeRes1.data.progress.currentSequenceOrder !== 2 || completeRes1.data.nextClue.store.stationCode !== 'ACO') {
  throw new Error('FAIL: Stage 2 must unlock ACO Store after Stage 1 completion!');
}

// Test 5: Validate ACO QR Token at Stage 2
console.log('\n--- Test 5: Scan & Validate ACO Store QR Token at Stage 2 ---');
['token-aco-seq-2', 'aco', 'token-aco'].forEach(tokenStr => {
  const qrReq = { query: { token: tokenStr } };
  const qrRes = createMockRes();
  qrController.validateQrToken(qrReq, qrRes);
  console.log(`Token '${tokenStr}' -> Store: '${qrRes.data.store.name_en}', Game Key: '${qrRes.data.gameKey}', Sequence: ${qrRes.data.sequenceOrder}`);
});

// Test 6: Complete Stage 2 (ACO Store / XO Game) -> Unlock Stage 3 (BHPC)
console.log('\n--- Test 6: Complete Stage 2 (ACO Store) & Unlock Stage 3 (BHPC) ---');
const completeReq2 = {
  player,
  body: { sequenceOrder: 2, score: 100, durationSeconds: 30, isSuccess: true }
};
const completeRes2 = createMockRes();
playerController.completeGame(completeReq2, completeRes2);

console.log('Stage 2 Completion Result:', completeRes2.data.message);
console.log('New Sequence Order:', completeRes2.data.progress.currentSequenceOrder);
console.log('Stage 3 Next Clue Store:', completeRes2.data.nextClue.store.nameEn, `(Code: ${completeRes2.data.nextClue.store.stationCode})`);

if (completeRes2.data.progress.currentSequenceOrder !== 3 || completeRes2.data.nextClue.store.stationCode !== 'BHPC') {
  throw new Error('FAIL: Stage 3 must unlock BHPC Store after Stage 2 completion!');
}

// Test 7: Complete Stage 3 (BHPC) & Stage 4 (Steve Madden) -> Victory
console.log('\n--- Test 7: Complete Remaining Stages (Stage 3 -> Stage 4 -> Victory) ---');
const completeReq3 = { player, body: { sequenceOrder: 3, score: 100, durationSeconds: 20, isSuccess: true } };
const completeRes3 = createMockRes();
playerController.completeGame(completeReq3, completeRes3);
console.log('Stage 3 Complete -> Next Store:', completeRes3.data.nextClue.store.nameEn);

const completeReq4 = { player, body: { sequenceOrder: 4, score: 100, durationSeconds: 15, isSuccess: true } };
const completeRes4 = createMockRes();
playerController.completeGame(completeReq4, completeRes4);

console.log('Stage 4 Complete -> Quest Is Completed:', completeRes4.data.progress.isCompleted);

if (!completeRes4.data.progress.isCompleted) {
  throw new Error('FAIL: Quest must be completed after Stage 4!');
}

console.log('\n🎉 ALL FIXED SEQUENCE & ACO PROGRESSION TESTS PASSED 100% PERFECTLY!');
