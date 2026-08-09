import React, { useState, useEffect } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
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

export const MemoryGame: React.FC<GameProps> = ({ onSuccess }) => {
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
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || selectedCards.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (cards[first].imageSrc === cards[second].imageSrc) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setSelectedCards([]);

        if (newCards.every(c => c.isMatched)) {
          setTimeout(() => {
            setShowWinModal(true);
          }, 300);
        }
      } else {
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards([...newCards]);
          setSelectedCards([]);
        }, 800);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '70px' }}>
      {/* Header Logo */}
      <HeaderLogo sequenceOrder={1} />

      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">تحدي مطابقة الأزواج</h2>
        <p className="subtitle-en">Skechers Shoe Memory Match</p>
      </div>

      {/* Timer HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '380px',
        background: '#152B5B',
        border: '1.5px solid #FEC949',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '20px'
      }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
          الوقت المتبقي / Time Left
        </span>
        <span style={{ fontSize: '16px', fontWeight: 800, color: timeLeft <= 15 ? '#FF5252' : '#FEC949', direction: 'ltr', unicodeBidi: 'isolate' }}>
          ⏱️ {formatTimer(timeLeft)}
        </span>
      </div>

      {/* Grid Canvas (4 Columns x 3 Rows = 12 Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        width: '100%',
        maxWidth: '380px'
      }}>
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            style={{
              height: '85px',
              borderRadius: '14px',
              border: card.isMatched ? '2px solid #8CE63D' : card.isFlipped ? '2px solid #FEC949' : '1.5px solid #35589A',
              background: card.isFlipped || card.isMatched ? '#0b286d' : 'linear-gradient(135deg, #152B5B 0%, #03257E 100%)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
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

      {/* Win Modal Popup Card */}
      {showWinModal && (
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
