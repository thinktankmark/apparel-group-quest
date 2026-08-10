import React, { useState, useEffect } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';
import { GameVictoryScreen } from '../components/GameVictoryScreen';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
  isFinalStage?: boolean;
}

export const SpeedTapGame: React.FC<GameProps> = ({ onSuccess, isFinalStage = false }) => {
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
      }
      return next;
    });

    setActivePosition({
      top: Math.floor(Math.random() * 160) + 15,
      left: Math.floor(Math.random() * 210) + 15
    });
  };

  // If this is the player's final stage and they won -> Render GameVictoryScreen
  if (isWon && isFinalStage) {
    return (
      <GameVictoryScreen
        gameTitleAr="النقرات السريعة للأحذية"
        gameTitleEn="Speed Sneaker Tap"
        scoreTextAr={`${tappedCount} / ${targetCount} أحذية`}
        scoreTextEn={`${tappedCount} / ${targetCount} Sneakers Tapped`}
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
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
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
            padding: 0,
            cursor: 'pointer',
            transition: 'top 0.15s ease, left 0.15s ease',
            zIndex: 10
          }}
        >
          <img
            src="/assets/speed-tap-sneaker.png"
            alt="Speed Tap Sneaker"
            style={{
              width: '95px',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.7))',
              transform: 'rotate(-12deg)'
            }}
          />
        </button>
      </div>

      {/* Win Modal Popup Card (Intermediate Stages 1-3) */}
      {isWon && !isFinalStage && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>⚡ 🏆</span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#8CE63D', marginBottom: '4px' }}>
              تهانينا! أكملت تحدي النقرات!
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', direction: 'ltr', unicodeBidi: 'isolate', marginBottom: '12px' }}>
              CONGRATULATIONS! SPEED TAP CLEARED!
            </h3>
            <p style={{ fontSize: '11px', color: '#9BB1DB', marginBottom: '24px' }}>
              أداء رائع! فتحت الدليل التالي لرحلة الكنز. / <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>Great job! You unlocked the next clue.</span>
            </p>
            <button className="btn-primary" onClick={() => onSuccess(tappedCount, 20)}>
              <span className="text-ar">احصل على دليلك التالي</span>
              <span className="text-en">GET YOUR NEXT CLUE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
