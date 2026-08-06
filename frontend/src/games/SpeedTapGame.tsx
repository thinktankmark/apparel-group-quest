import React, { useState, useEffect } from 'react';
import { GameVictoryScreen } from '../components/GameVictoryScreen';
import { HeaderLogo } from '../components/HeaderLogo';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
}

export const SpeedTapGame: React.FC<GameProps> = ({ onSuccess }) => {
  const [tappedCount, setTappedCount] = useState<number>(0);
  const [targetCount] = useState<number>(25); // Target set to 25
  const [activePosition, setActivePosition] = useState<{ top: number; left: number }>({ top: 100, left: 100 });
  const [isWon, setIsWon] = useState<boolean>(false);

  useEffect(() => {
    const moveSneaker = () => {
      if (isWon) return;
      const top = Math.floor(Math.random() * 180) + 20;
      const left = Math.floor(Math.random() * 240) + 20;
      setActivePosition({ top, left });
    };

    const interval = setInterval(moveSneaker, 750);
    return () => clearInterval(interval);
  }, [isWon]);

  const handleSneakerTap = () => {
    if (isWon) return;

    setTappedCount(prev => {
      const next = prev + 1;
      if (next >= targetCount) {
        setIsWon(true);
      }
      return next;
    });

    setActivePosition({
      top: Math.floor(Math.random() * 180) + 20,
      left: Math.floor(Math.random() * 240) + 20
    });
  };

  if (isWon) {
    return (
      <GameVictoryScreen
        gameTitleAr="النقرات السريعة للأحذية"
        gameTitleEn="Speed Sneaker Tap"
        scoreTextAr={`${tappedCount}/ ${targetCount} أحذية`}
        scoreTextEn={`${tappedCount}/ ${targetCount} Sneakers Tapped`}
        subtitleAr="نقرات سريعة ورائعة! أكملت التحدي الأخير لرحلة الكنز."
        subtitleEn="Lightning fast taps! You completed the final challenge of the quest."
        centerEmoji="⚡ 🏆 ✨"
        isFinalStage={true}
        onContinue={() => onSuccess(tappedCount, 20)}
      />
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '70px' }}>
      {/* Header Logo */}
      <HeaderLogo sequenceOrder={4} />

      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">النقرات السريعة للأحذية</h2>
        <p className="subtitle-en">Speed Sneaker Tap</p>
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
    </div>
  );
};
