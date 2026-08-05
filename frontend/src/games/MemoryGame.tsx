import React, { useState, useEffect } from 'react';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
}

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame: React.FC<GameProps> = ({ onSuccess }) => {
  const [timeLeft, setTimeLeft] = useState<number>(90); // 1 minute, 30 seconds countdown
  const [cards, setCards] = useState<Card[]>(() => {
    const icons = ['👟', '👠', '👞', '👡', '👢', '🥾'];
    const paired = [...icons, ...icons].map((icon, idx) => ({
      id: idx,
      icon,
      isFlipped: false,
      isMatched: false
    }));
    return paired.sort(() => Math.random() - 0.5);
  });
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

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
      if (cards[first].icon === cards[second].icon) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setSelectedCards([]);

        // Check if all pairs are matched
        if (newCards.every(c => c.isMatched)) {
          setTimeout(() => {
            onSuccess(100, 90 - timeLeft);
          }, 500);
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
    <div className="app-container" style={{ width: '100%', paddingBottom: '70px' }}>
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">تحدي مطابقة الأزواج</h2>
        <p className="subtitle-en">Shoe Memory Match</p>
      </div>

      {/* Timer HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '360px',
        background: '#152B5B',
        border: '1.5px solid #FEC949',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '20px'
      }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
          الوقت المتبقي / Time Left
        </span>
        <span style={{ fontSize: '16px', fontWeight: 800, color: timeLeft <= 15 ? '#FF5252' : '#FEC949' }}>
          ⏱️ {formatTimer(timeLeft)}
        </span>
      </div>

      {/* Grid Canvas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        width: '100%',
        maxWidth: '360px'
      }}>
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            style={{
              height: '75px',
              borderRadius: '14px',
              fontSize: '32px',
              border: card.isMatched ? '2px solid #8CE63D' : '1.5px solid #35589A',
              background: card.isFlipped || card.isMatched ? '#152B5B' : 'linear-gradient(135deg, #152B5B 0%, #03257E 100%)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          >
            {card.isFlipped || card.isMatched ? card.icon : '❓'}
          </button>
        ))}
      </div>
    </div>
  );
};
