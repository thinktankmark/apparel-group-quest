import React, { useState, useEffect } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
  isFinalStage?: boolean;
}

interface Card {
  id: number;
  imageSrc: string;
  alt: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_IMAGES = [
  { id: 1, src: '/assets/crocs-store.png', alt: 'Crocs' },
  { id: 2, src: '/assets/polo-rider.png', alt: 'Polo Rider' },
  { id: 3, src: '/assets/skechers-store.png', alt: 'Skechers' },
];

export const MemoryGame: React.FC<GameProps> = ({ onSuccess }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(90);

  const initGame = () => {
    const deck = [...MEMORY_IMAGES, ...MEMORY_IMAGES].map((item, index) => ({
      id: index,
      imageSrc: item.src,
      alt: item.alt,
      isFlipped: false,
      isMatched: false
    }));
    // Shuffle cards
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setFlippedCards([]);
    setIsBusy(false);
    setTimeLeft(90);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Timer Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCardClick = (index: number) => {
    if (isBusy || cards[index].isFlipped || cards[index].isMatched) return;

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
              onSuccess(100, Math.max(90 - timeLeft, 10));
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

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '70px' }}>
      <HeaderLogo sequenceOrder={1} />

      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">تحدي مطابقة الذاكرة</h2>
        <p className="subtitle-en">Skechers Memory Match Challenge</p>
        <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginTop: '4px' }}>
          اقلب الكروت وطابق الصور المتشابهة! / <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>Flip cards to find all matching pairs!</span>
        </p>
      </div>

      {/* Timer & Status Bar */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#152B5B',
        border: '1.5px solid #FEC949',
        borderRadius: '12px',
        padding: '10px 16px',
        textAlign: 'center',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#FEC949' }}>
          ⏱️ TIME: {timeLeft}s
        </span>
        <button
          onClick={initGame}
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
          🔄 RESET
        </button>
      </div>

      {/* Memory Cards 3x2 Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto'
      }}>
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            disabled={card.isMatched}
            style={{
              height: '115px',
              background: card.isFlipped || card.isMatched ? '#152B5B' : 'linear-gradient(135deg, #1A3673 0%, #0A193B 100%)',
              border: card.isMatched ? '2px solid #8CE63D' : card.isFlipped ? '2px solid #FEC949' : '1.5px solid #35589A',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: card.isMatched ? 'default' : 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            {card.isFlipped || card.isMatched ? (
              <img
                src={card.imageSrc}
                alt={card.alt}
                style={{ width: '70%', height: '70%', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: '22px', color: '#FEC949' }}>❓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
