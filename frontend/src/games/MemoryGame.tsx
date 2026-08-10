import React, { useState, useEffect } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';
import { GameVictoryScreen } from '../components/GameVictoryScreen';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
  isFinalStage?: boolean;
}

interface Card {
  id: number;
  imageSrc: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SHOE_IMAGES = [
  '/assets/skechers-1.png',
  '/assets/skechers-2.png',
  '/assets/skechers-3.png',
  '/assets/skechers-4.png',
  '/assets/skechers-5.png',
  '/assets/skechers-6.png'
];

export const MemoryGame: React.FC<GameProps> = ({ onSuccess, isFinalStage = false }) => {
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [cards, setCards] = useState<Card[]>(() => {
    const paired = [...SHOE_IMAGES, ...SHOE_IMAGES].map((imageSrc, idx) => ({
      id: idx,
      imageSrc,
      isFlipped: false,
      isMatched: false
    }));
    return paired.sort(() => Math.random() - 0.5);
  });
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);

  // Timer countdown
  useEffect(() => {
    if (showWinModal || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showWinModal]);

  const handleCardClick = (index: number) => {
    if (isBusy || cards[index].isFlipped || cards[index].isMatched || showWinModal) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsBusy(true);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].imageSrc === cards[secondIdx].imageSrc) {
        // Matched Pair!
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstIdx].isMatched = true;
            updated[secondIdx].isMatched = true;
            if (updated.every(c => c.isMatched)) {
              setShowWinModal(true);
            }
            return updated;
          });
          setFlippedCards([]);
          setIsBusy(false);
        }, 350);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[firstIdx].isFlipped = false;
            updated[secondIdx].isFlipped = false;
            return updated;
          });
          setFlippedCards([]);
          setIsBusy(false);
        }, 700);
      }
    }
  };

  // If this is the player's final stage and they won -> Render GameVictoryScreen
  if (showWinModal && isFinalStage) {
    return (
      <GameVictoryScreen
        gameTitleAr="تحدي مطابقة سكتشرز"
        gameTitleEn="Skechers Memory Match"
        scoreTextAr="مطابقة كاملة لجميع الأحذية!"
        scoreTextEn="MATCH COMPLETED!"
        subtitleAr="أداء أسطوري ورائع! أكملت التحدي الأخير لرحلة الكنز."
        subtitleEn="Legendary performance! You completed the final challenge of the quest."
        centerEmoji="👟 🏆 ✨"
        isFinalStage={true}
        onContinue={() => onSuccess(100, Math.max(90 - timeLeft, 10))}
      />
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '70px' }}>
      {/* Header Logo */}
      <HeaderLogo />

      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">تحدي الذاكرة سكتشرز</h2>
        <p className="subtitle-en">Skechers Memory Match</p>
        <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginTop: '4px' }}>
          طابق جميع أزواج الأحذية للمتابعة. / <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>Match all shoe pairs to proceed.</span>
        </p>
      </div>

      {/* Timer HUD */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#152B5B',
        border: '1.5px solid #FEC949',
        borderRadius: '12px',
        padding: '10px 16px',
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 800, color: '#FEC949', direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block' }}>
          ⏱️ TIME REMAINING: {timeLeft}s
        </span>
      </div>

      {/* 4 Columns x 3 Rows Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        width: '100%',
        maxWidth: '420px',
        marginBottom: '20px'
      }}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            style={{
              height: '84px',
              background: card.isFlipped || card.isMatched ? 'linear-gradient(135deg, #1A3673 0%, #152B5B 100%)' : '#0F214A',
              border: card.isMatched ? '2px solid #8CE63D' : card.isFlipped ? '2px solid #FEC949' : '1.5px solid #35589A',
              borderRadius: '14px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              padding: '6px'
            }}
          >
            {card.isFlipped || card.isMatched ? (
              <img
                src={card.imageSrc}
                alt="Skechers Shoe"
                style={{ width: '100%', height: 'auto', maxHeight: '68px', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: '22px', color: '#FEC949' }}>❓</span>
            )}
          </button>
        ))}
      </div>

      {/* Win Modal Popup Card (Intermediate Stages 1-3) */}
      {showWinModal && !isFinalStage && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>🎉 🏆</span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#8CE63D', marginBottom: '4px' }}>
              تهانينا! لقد فزت بالجولة!
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', direction: 'ltr', unicodeBidi: 'isolate', marginBottom: '12px' }}>
              CONGRATULATIONS! YOU WIN!
            </h3>
            <p style={{ fontSize: '11px', color: '#9BB1DB', marginBottom: '24px' }}>
              أداء رائع! فتحت الدليل التالي لرحلة الكنز. <br /> <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>Great job! You unlocked the next clue.</span>
            </p>
            <button className="btn-primary" onClick={() => onSuccess(100, Math.max(90 - timeLeft, 10))}>
              <span className="text-ar">احصل على دليلك التالي</span>
              <span className="text-en">GET YOUR NEXT CLUE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
