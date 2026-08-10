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
    if (b[4] === null) return 4;

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
      <HeaderLogo sequenceOrder={4} />

      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">تحدي إكس أو كروكس</h2>
        <p className="subtitle-en">Crocs Tic-Tac-Toe Challenge</p>
        <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginTop: '4px' }}>
          احصل على ٣ أحذية متتالية للفوز! / <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>Get 3 shoes in a row to win!</span>
        </p>
      </div>

      {/* Turn & Status Indicator */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#152B5B',
        border: '1.5px solid #35589A',
        borderRadius: '12px',
        padding: '10px 16px',
        textAlign: 'center',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 700 }}>
          {isPlayerTurn ? '🟢 دورك الآن (حذاء كروكس)' : '🤖 دور الذكاء الاصطناعي...'}
        </span>
        <button
          onClick={resetGame}
          style={{
            background: '#FEC949',
            color: '#091C47',
            border: 'none',
            borderRadius: '16px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          🔄 إعادة اللعب
        </button>
      </div>

      {/* XO 3x3 Grid Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(21, 43, 91, 0.9)',
        border: '2px solid #FEC949',
        borderRadius: '20px',
        padding: '14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
      }}>
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={!isPlayerTurn || cell !== null || winner !== null}
            style={{
              height: '110px',
              background: cell ? '#0A193B' : 'rgba(255, 255, 255, 0.05)',
              border: cell === 'GREEN_SHOE' ? '2px solid #8CE63D' : cell === 'PINK_SHOE' ? '2px solid #FF5252' : '1px dashed #35589A',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: cell || !isPlayerTurn || winner ? 'default' : 'pointer',
              fontSize: '40px',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
          >
            {cell === 'GREEN_SHOE' && (
              <span style={{ filter: 'drop-shadow(0 4px 8px rgba(140, 230, 61, 0.6))' }}>👟</span>
            )}
            {cell === 'PINK_SHOE' && (
              <span style={{ filter: 'drop-shadow(0 4px 8px rgba(255, 82, 82, 0.6))' }}>👠</span>
            )}
          </button>
        ))}
      </div>

      {/* Defeat / Retry Modal */}
      {showRetryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>🤖 👠</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FF5252', marginBottom: '4px' }}>
              لم تفز في هذه الجولة!
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, direction: 'ltr', unicodeBidi: 'isolate', color: '#FFFFFF', marginBottom: '8px' }}>
              AI MATCHED 3 SHOES!
            </h3>
            <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginBottom: '20px', lineHeight: 1.4 }}>
              لا تقلق، يمكنك إعادة المحاولة والتغلب على الذكاء الاصطناعي الآن!
            </p>
            <button className="btn-primary" onClick={resetGame}>
              <span className="text-ar">إعادة المحاولة</span>
              <span className="text-en">RETRY MATCH</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
