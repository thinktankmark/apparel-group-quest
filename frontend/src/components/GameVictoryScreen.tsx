import React from 'react';
import { HeaderLogo } from './HeaderLogo';

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
    <div className="app-container" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Header Logo */}
      <HeaderLogo />

      {/* Game Title */}
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '16px' }}>
        <h2 className="title-ar" style={{ fontSize: '22px', fontWeight: 800, color: '#FEC949', marginBottom: '2px' }}>
          {gameTitleAr}
        </h2>
        <p className="subtitle-en" style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
          {gameTitleEn}
        </p>
      </div>

      {/* Top Banner Card (Congratulations Challenge Completed) */}
      <div style={{
        width: '100%',
        background: '#0B193C',
        border: '1.5px solid #8CE63D',
        borderRadius: '20px',
        padding: '16px 14px',
        textAlign: 'center',
        marginBottom: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#8CE63D', marginBottom: '4px', lineHeight: 1.3 }}>
          🎉 {isFinalStage ? 'تهانينا! أكملت التحدي بنجاح!' : 'تهانينا! أكملت التحدي بنجاح!'}
        </h3>
        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px', lineHeight: 1.3, letterSpacing: '0.3px' }}>
          {isFinalStage ? 'CONGRATULATIONS! CHALLENGE COMPLETED!' : 'CONGRATULATIONS! CHALLENGE COMPLETED!'}
        </h4>
        <p style={{ fontSize: '11.5px', color: '#D0DCF2', margin: 0, lineHeight: 1.4 }}>
          {subtitleAr}<br />
          <span style={{ fontSize: '11px', color: '#9BB1DB' }}>{subtitleEn}</span>
        </p>
      </div>

      {/* Main Game Results Card */}
      <div style={{
        width: '100%',
        background: 'rgba(13, 35, 87, 0.95)',
        border: '1.5px solid #35589A',
        borderRadius: '24px',
        padding: '24px 16px',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        {/* Score Pill Badge */}
        <div style={{
          background: '#041B4E',
          border: '1.5px solid #8CE63D',
          borderRadius: '24px',
          padding: '8px 20px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#8CE63D' }}>
            ⭐ {scoreTextAr} / {scoreTextEn} ⭐
          </span>
        </div>

        {/* Center Circular Graphic Container matching screenshot Game3.2 */}
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 239, 125, 0.35) 0%, rgba(20, 70, 50, 0.75) 70%, rgba(11, 25, 60, 0.9) 100%)',
          border: '2px solid rgba(140, 230, 61, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '44px',
          boxShadow: '0 0 30px rgba(140, 230, 61, 0.35)',
          marginBottom: '12px'
        }}>
          {centerEmoji}
        </div>
      </div>

      {/* 100% COMPLETE! Progress Pill */}
      <div style={{
        width: '100%',
        background: '#8CE63D',
        borderRadius: '24px',
        padding: '12px 16px',
        textAlign: 'center',
        marginBottom: '16px',
        boxShadow: '0 4px 16px rgba(140, 230, 61, 0.4)'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 800, color: '#041B4E', letterSpacing: '0.5px' }}>
          100% COMPLETE!
        </span>
      </div>

      {/* Yellow CTA Button (CONTINUE) */}
      <button className="btn-primary" onClick={onContinue} style={{ width: '100%', marginBottom: '24px' }}>
        <span className="text-ar">متابعة</span>
        <span className="text-en">CONTINUE</span>
      </button>
    </div>
  );
};
