import React from 'react';

interface GameVictoryScreenProps {
  gameTitleAr: string;
  gameTitleEn: string;
  scoreTextAr: string;
  scoreTextEn: string;
  subtitleAr: string;
  subtitleEn: string;
  onContinue: () => void;
  centerEmoji?: string;
  isFinalStage?: boolean;
}

export const GameVictoryScreen: React.FC<GameVictoryScreenProps> = ({
  gameTitleAr,
  gameTitleEn,
  scoreTextAr,
  scoreTextEn,
  subtitleAr,
  subtitleEn,
  onContinue,
  centerEmoji = '⚡ 🏆 ✨',
  isFinalStage = false
}) => {
  return (
    <div className="modal-overlay" style={{ zIndex: 99999 }}>
      <div className="modal-card" style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(13, 35, 87, 0.98)',
        border: '2px solid #FEC949',
        borderRadius: '24px',
        padding: '24px 20px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Top Banner Card (Congratulations Challenge Completed) */}
        <div style={{
          width: '100%',
          background: '#0B193C',
          border: '1.5px solid #8CE63D',
          borderRadius: '16px',
          padding: '14px 12px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#8CE63D', marginBottom: '4px', lineHeight: 1.3, direction: 'rtl' }}>
            🎉 {isFinalStage ? 'تهانينا! أكملت التحدي بنجاح!' : 'تهانينا! أكملت التحدي بنجاح!'}
          </h3>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px', lineHeight: 1.3, letterSpacing: '0.3px', direction: 'ltr', unicodeBidi: 'isolate' }}>
            {isFinalStage ? 'CONGRATULATIONS! FINAL CHALLENGE COMPLETED!' : 'CONGRATULATIONS! CHALLENGE COMPLETED!'}
          </h4>
          <p style={{ fontSize: '11.5px', color: '#D0DCF2', margin: 0, lineHeight: 1.4, direction: 'rtl' }}>
            {subtitleAr}
          </p>
          <p style={{ fontSize: '11px', color: '#9BB1DB', margin: '2px 0 0 0', direction: 'ltr', unicodeBidi: 'isolate' }}>
            {subtitleEn}
          </p>
        </div>

        {/* Score Pill Badge */}
        <div style={{
          background: '#041B4E',
          border: '1.5px solid #8CE63D',
          borderRadius: '24px',
          padding: '8px 20px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#8CE63D', direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block' }}>
            ⭐ {scoreTextEn} ⭐
          </span>
        </div>

        {/* Center Circular Graphic Container */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 239, 125, 0.35) 0%, rgba(20, 70, 50, 0.75) 70%, rgba(11, 25, 60, 0.9) 100%)',
          border: '2px solid rgba(140, 230, 61, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '40px',
          boxShadow: '0 0 30px rgba(140, 230, 61, 0.35)',
          marginBottom: '16px'
        }}>
          {centerEmoji}
        </div>

        {/* 100% COMPLETE! Progress Pill */}
        <div style={{
          width: '100%',
          background: '#8CE63D',
          borderRadius: '24px',
          padding: '2px 16px 3px',
          textAlign: 'center',
          marginBottom: '20px',
          boxShadow: '0 4px 16px rgba(140, 230, 61, 0.4)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#041B4E', letterSpacing: '0.5px', direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block' }}>
            100% COMPLETE!
          </span>
        </div>

        {/* Yellow CTA Button (CONTINUE) */}
        <button className="btn-primary" onClick={onContinue} style={{ width: '100%' }}>
          <span className="text-ar">متابعة</span>
          <span className="text-en">CONTINUE</span>
        </button>
      </div>
    </div>
  );
};
