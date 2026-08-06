import React, { useState, useEffect } from 'react';
import { FinalVictoryModal } from '../components/FinalVictoryModal';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
}

export const SpeedTapGame: React.FC<GameProps> = ({ onSuccess }) => {
  const [tappedCount, setTappedCount] = useState<number>(0);
  const [targetCount] = useState<number>(25); // Target set to 25
  const [activePosition, setActivePosition] = useState<{ top: number; left: number }>({ top: 100, left: 100 });
  const [showWinModal, setShowWinModal] = useState<boolean>(false);

  useEffect(() => {
    const moveSneaker = () => {
      const top = Math.floor(Math.random() * 180) + 20;
      const left = Math.floor(Math.random() * 240) + 20;
      setActivePosition({ top, left });
    };

    const interval = setInterval(moveSneaker, 750);
    return () => clearInterval(interval);
  }, []);

  const handleSneakerTap = () => {
    if (showWinModal) return;

    setTappedCount(prev => {
      const next = prev + 1;
      if (next >= targetCount) {
        setShowWinModal(true);
      }
      return next;
    });

    setActivePosition({
      top: Math.floor(Math.random() * 180) + 20,
      left: Math.floor(Math.random() * 240) + 20
    });
  };

  return (
    <div className="app-container" style={{ width: '100%', paddingBottom: '70px' }}>
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">حذاء سريع</h2>
        <p className="subtitle-en">Fast Shoe</p>
        <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginTop: '4px' }}>
          انقر على الأحذية الظاهرة بسرعة! / Tap the appearing sneakers quickly!
        </p>
      </div>

      {/* Counter HUD */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: '#152B5B',
        border: '1.5px solid #8CE63D',
        borderRadius: '12px',
        padding: '10px 16px',
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#8CE63D' }}>
          ⭐ {tappedCount} / {targetCount} Sneakers Tapped ⭐
        </span>
      </div>

      {/* Tap Arena */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        height: '280px',
        background: '#152B5B',
        border: '1.5px solid #35589A',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <button
          onClick={handleSneakerTap}
          style={{
            position: 'absolute',
            top: `${activePosition.top}px`,
            left: `${activePosition.left}px`,
            background: 'none',
            border: 'none',
            fontSize: '48px',
            cursor: 'pointer',
            transition: 'top 0.15s ease, left 0.15s ease'
          }}
        >
          👟
        </button>
      </div>

      {/* Final Victory Modal matching VictoryPage design & content */}
      {showWinModal && (
        <FinalVictoryModal
          onContinue={() => onSuccess(tappedCount, 20)}
        />
      )}
    </div>
  );
};
