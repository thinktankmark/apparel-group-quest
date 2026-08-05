import React, { useState } from 'react';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
}

export const XOGame: React.FC<GameProps> = ({ onSuccess }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [showRetryModal, setShowRetryModal] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]            // Diagonals
  ];

  const checkWinner = (b: (string | null)[]) => {
    for (const [a, c, d] of winningLines) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    if (b.every(cell => cell !== null)) return 'TIE';
    return null;
  };

  // Smart AI Strategy: Competitive on attempts #1 and #2, then AI lets player win on attempt #3 max!
  const getSmartAiMove = (b: (string | null)[], attempts: number): number => {
    const emptyIndices = b.map((val, i) => val === null ? i : null).filter(val => val !== null) as number[];

    // 1. Can AI ('👠') win in 1 move? Take it if attempt < 3
    if (attempts < 3) {
      for (const line of winningLines) {
        const aiCount = line.filter(idx => b[idx] === '👠').length;
        const emptyCount = line.filter(idx => b[idx] === null).length;
        if (aiCount === 2 && emptyCount === 1) {
          return line.find(idx => b[idx] === null)!;
        }
      }
    }

    // 2. Can Player ('👟') win in 1 move? Block it if attempt < 3
    if (attempts < 3) {
      for (const line of winningLines) {
        const playerCount = line.filter(idx => b[idx] === '👟').length;
        const emptyCount = line.filter(idx => b[idx] === null).length;
        if (playerCount === 2 && emptyCount === 1) {
          return line.find(idx => b[idx] === null)!;
        }
      }
    }

    // 3. Max 3 Tries Mercy: On attempt 3+, AI leaves open winning opportunities for player!
    if (b[4] === null && attempts < 3) return 4;

    const openCorners = [0, 2, 6, 8].filter(idx => b[idx] === null);
    if (openCorners.length > 0 && attempts < 3) {
      return openCorners[Math.floor(Math.random() * openCorners.length)];
    }

    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || !isPlayerTurn || winner) return;

    const newBoard = [...board];
    newBoard[idx] = '👟'; // Player symbol
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
        newBoard[aiMove] = '👠'; // AI symbol
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
    if (res === '👟') {
      setShowWinModal(true);
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
    setShowWinModal(false);
  };

  return (
    <div className="app-container" style={{ width: '100%', paddingBottom: '70px' }}>
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">تحدي XO للأحذية</h2>
        <p className="subtitle-en">Shoes XO Challenge</p>
        <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginTop: '4px' }}>
          اهزم الذكاء الاصطناعي في تحدي XO للمتابعة. / Beat the AI in XO Challenge to proceed.
        </p>
      </div>

      {/* Turn & Attempt HUD */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'rgba(254, 201, 73, 0.18)',
          border: '1px solid #FEC949',
          borderRadius: '20px',
          padding: '6px 16px',
          color: '#FEC949',
          fontSize: '13px',
          fontWeight: 700
        }}>
          {isPlayerTurn ? 'دورك / Your Turn 👟' : 'دور الذكاء الاصطناعي... / AI Thinking... 嘧'}
        </div>
        <div style={{
          background: 'rgba(140, 230, 61, 0.18)',
          border: '1px solid #8CE63D',
          borderRadius: '20px',
          padding: '6px 12px',
          color: '#8CE63D',
          fontSize: '11.5px',
          fontWeight: 700
        }}>
          المحاولة / Attempt #{attemptCount} (Max 3)
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
              border: '1.5px solid #35589A',
              borderRadius: '16px',
              fontSize: '42px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Defeat / Retry Modal */}
      {showRetryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>🤖 👠</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FF5252', marginBottom: '4px' }}>
              {winner === 'TIE' ? 'تعادل!' : 'فاز الذكاء الاصطناعي!'}
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              {winner === 'TIE' ? 'Game Tied!' : 'AI Won this round!'}
            </h3>
            <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginBottom: '24px' }}>
              اضغط لإعادة المحاولة وهزيمة الذكاء الاصطناعي. (المحاولة القادمة #{attemptCount})<br />
              Tap retry to beat the AI. (Next Attempt #{attemptCount})
            </p>
            <button className="btn-primary" onClick={resetGame}>
              <span className="text-ar">إعادة المحاولة</span>
              <span className="text-en">RETRY GAME</span>
            </button>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {showWinModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>🎉 🏆</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#8CE63D', marginBottom: '4px' }}>
              تهانينا! لقد فزت بالجولة!
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
              CONGRATULATIONS! YOU WIN!
            </h3>
            <p style={{ fontSize: '11px', color: '#9BB1DB', marginBottom: '24px' }}>
              أداء رائع! فتحت الدليل التالي لرحلة الكنز. / Great job! You unlocked the next clue.
            </p>
            <button className="btn-primary" onClick={() => onSuccess(100, 30)}>
              <span className="text-ar">احصل على دليلك التالي</span>
              <span className="text-en">GET YOUR NEXT CLUE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
