import React, { useState, useEffect } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
  isFinalStage?: boolean;
}

export const SpeedTapGame: React.FC<GameProps> = ({ onSuccess }) => {
  const [tappedCount, setTappedCount] = useState<number>(0);
  const [targetCount] = useState<number>(20);
  const [activePosition, setActivePosition] = useState<{ top: number; left: number }>({ top: 90, left: 100 });
  const [isWon, setIsWon] = useState<boolean>(false);

  useEffect(() => {
    const moveSneaker = () => {
      if (isWon) return;
      const top = Math.floor(Math.random() * 160) + 15;
      const left = Math.floor(Math.random() * 210) + 15;
      setActivePosition({ top, left });
    };

    const interval = setInterval(moveSneaker, 700);
    return () => clearInterval(interval);
  }, [isWon]);

  const handleSneakerTap = () => {
    if (isWon) return;

    setTappedCount(prev => {
      const next = prev + 1;
      if (next >= targetCount) {
        setIsWon(true);
        onSuccess(next, 20);
      }
      return next;
    });

    setActivePosition({
      top: Math.floor(Math.random() * 160) + 15,
      left: Math.floor(Math.random() * 210) + 15
    });
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '70px' }}>
      {/* Header Logo */}
      <HeaderLogo sequenceOrder={2} />

      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">النقرات السريعة للأحذية</h2>
        <p className="subtitle-en">Speed Sneaker Tap</p>
        <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginTop: '4px', direction: 'ltr', unicodeBidi: 'isolate' }}>
          Tap the appearing sneakers quickly!
        </p>
      </div>

      {/* Counter HUD */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#152B5B',
        border: '1.5px solid #8CE63D',
        borderRadius: '12px',
        padding: '10px 16px',
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 800, color: '#8CE63D', direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block' }}>
          ⭐ {tappedCount} / {targetCount} Sneakers Tapped ⭐
        </span>
      </div>

      {/* Tap Arena */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        height: '280px',
        background: 'linear-gradient(180deg, #091C47 0%, #152B5B 100%)',
        border: '2px solid #FEC949',
        borderRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        userSelect: 'none'
      }}>
        <button
          onClick={handleSneakerTap}
          style={{
            position: 'absolute',
            top: `${activePosition.top}px`,
            left: `${activePosition.left}px`,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '44px',
            lineHeight: 1,
            transition: 'top 0.15s ease, left 0.15s ease, transform 0.1s ease',
            filter: 'drop-shadow(0 4px 10px rgba(254, 201, 73, 0.5))',
            padding: '8px'
          }}
        >
          👟
        </button>
      </div>
    </div>
  );
};
