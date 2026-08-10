import React, { useState } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
  isFinalStage?: boolean;
}

type CellValue = 'GREEN_SHOE' | 'PINK_SHOE' | null;

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const XOGame: React.FC<GameProps> = ({ onSuccess }) => {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [showRetryModal, setShowRetryModal] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(1);

  const checkWinner = (b: CellValue[]): string | null => {
    for (const combo of WINNING_COMBOS) {
      const [a, bIdx, c] = combo;
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return b[a];
      }
    }
    if (b.every(cell => cell !== null)) return 'DRAW';
    return null;
  };

  const getSmartAiMove = (b: CellValue[], attempts: number): number => {
    const emptyIndices = b.map((val, idx) => (val === null ? idx : null)).filter(val => val !== null) as number[];
    if (emptyIndices.length === 0) return -1;

    // 1. Check if AI can win immediately
    for (const idx of emptyIndices) {
      const temp = [...b];
      temp[idx] = 'PINK_SHOE';
      if (checkWinner(temp) === 'PINK_SHOE') return idx;
    }

    // 2. Check if player is about to win & block
    for (const idx of emptyIndices) {
      const temp = [...b];
      temp[idx] = 'GREEN_SHOE';
      if (checkWinner(temp) === 'GREEN_SHOE') return idx;
    }

    // 3. Take Center if available
    if (b[4] === null && attempts < 3) return 4;

    // 4. Take Corners
    const openCorners = [0, 2, 6, 8].filter(idx => b[idx] === null);
    if (openCorners.length > 0 && attempts < 3) {
      return openCorners[Math.floor(Math.random() * openCorners.length)];
    }

    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || !isPlayerTurn || winner) return;

    const newBoard = [...board];
    newBoard[idx] = 'GREEN_SHOE'; // Player symbol
    setBoard(newBoard);

    const winResult = checkWinner(newBoard);
    if (winResult) {
      handleGameOver(winResult);
      return;
    }

    setIsPlayerTurn(false);

    // AI Move execution
    setTimeout(() => {
      const aiMove = getSmartAiMove(newBoard, attemptCount);
      if (aiMove !== undefined && newBoard[aiMove] === null) {
        newBoard[aiMove] = 'PINK_SHOE'; // AI symbol
        setBoard(newBoard);

        const aiWinResult = checkWinner(newBoard);
        if (aiWinResult) {
          handleGameOver(aiWinResult);
        } else {
          setIsPlayerTurn(true);
        }
      }
    }, 450);
  };

  const handleGameOver = (res: string) => {
    setWinner(res);
    if (res === 'GREEN_SHOE') {
      onSuccess(100, 30);
    } else {
      setAttemptCount(prev => prev + 1);
      setShowRetryModal(true);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setShowRetryModal(false);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '70px' }}>
      {/* Header Logo */}
      <HeaderLogo sequenceOrder={4} />

      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">تحدي XO للأحذية</h2>
        <p className="subtitle-en">Crocs XO Challenge</p>
        <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginTop: '4px' }}>
          اهزم الذكاء الاصطناعي في تحدي XO للمتابعة. / <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>Beat the AI in XO Challenge to proceed.</span>
        </p>
      </div>

      {/* Turn HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'rgba(254, 201, 73, 0.18)',
          border: '1.5px solid #FEC949',
          borderRadius: '20px',
          padding: '8px 18px',
          color: '#FEC949',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {isPlayerTurn ? (
            <>
              <span>دورك / Your Turn</span>
              <img src="/assets/xo-shoe-green.png" alt="Green Croc" style={{ width: '28px', height: 'auto' }} />
            </>
          ) : (
            <>
              <span>دور الذكاء الاصطناعي... / AI Thinking...</span>
              <img src="/assets/xo-shoe-pink.png" alt="Pink Croc" style={{ width: '28px', height: 'auto' }} />
            </>
          )}
        </div>
      </div>

      {/* 3x3 XO Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        width: '100%',
        maxWidth: '320px',
        marginBottom: '24px'
      }}>
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            style={{
              height: '95px',
              background: '#152B5B',
              border: cell === 'GREEN_SHOE' ? '2px solid #8CE63D' : cell === 'PINK_SHOE' ? '2px solid #FF5252' : '1.5px solid #35589A',
              borderRadius: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              padding: '6px'
            }}
          >
            {cell === 'GREEN_SHOE' && (
              <img
                src="/assets/xo-shoe-green.png"
                alt="Green Croc Shoe"
                style={{ width: '74px', height: 'auto', display: 'block', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
              />
            )}
            {cell === 'PINK_SHOE' && (
              <img
                src="/assets/xo-shoe-pink.png"
                alt="Pink Croc Shoe"
                style={{ width: '74px', height: 'auto', display: 'block', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Defeat / Retry Modal */}
      {showRetryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <img src="/assets/xo-shoe-pink.png" alt="Pink Croc" style={{ width: '50px', height: 'auto' }} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FF5252', marginBottom: '4px' }}>
              {winner === 'TIE' ? 'تعادل!' : 'فاز الذكاء الاصطناعي!'}
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, direction: 'ltr', unicodeBidi: 'isolate', color: '#FFFFFF', marginBottom: '8px' }}>
              {winner === 'TIE' ? 'Game Tied!' : 'AI Won this round!'}
            </h3>
            <button className="btn-primary" onClick={resetGame}>
              <span className="text-ar">اضغط لإعادة المحاولة.</span>
              <span className="text-en">TAP TO TRY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
