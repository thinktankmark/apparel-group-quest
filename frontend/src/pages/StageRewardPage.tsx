import React from 'react';
import { HeaderLogo } from '../components/HeaderLogo';

interface StageRewardPageProps {
  onContinue: () => void;
  lang?: 'ar' | 'en';
}

export const StageRewardPage: React.FC<StageRewardPageProps> = ({ onContinue }) => {
  return (
    <div className="app-container" style={{ justifyContent: 'space-between', paddingBottom: '30px' }}>
      {/* Apparel Group Main Header Logo */}
      <HeaderLogo />

      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '18px', margin: 'auto 0' }}>
        {/* Top Sunburst Voucher Reward Card matching Figma */}
        <div style={{
          width: '100%',
          backgroundImage: "url('/assets/congrats-box-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: '1.5px solid #35589A',
          borderRadius: '24px',
          padding: '32px 20px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Background Radial Glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            pointerEvents: 'none'
          }} />

          {/* Main Title */}
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#FEC949', margin: '0 0 2px 0', direction: 'rtl' }}>
            مبروك!
          </h1>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 24px 0', direction: 'ltr', unicodeBidi: 'isolate' }}>
            Congratulations!
          </h2>

          {/* Voucher Notice Text */}
          <p style={{ fontSize: '15px', fontWeight: 800, color: '#FEC949', lineHeight: 1.5, marginBottom: '8px', direction: 'rtl' }}>
            لقد ربحت قسيمة!<br />أظهر هذه الرسالة للكاشير لاستلام قسيمتك.
          </p>
          <p style={{ fontSize: '13px', color: '#FFFFFF', lineHeight: 1.5, margin: 0, direction: 'ltr', unicodeBidi: 'isolate', fontWeight: 500 }}>
            You’ve won a voucher!<br />Show this message at the cashier to collect your voucher.
          </p>
        </div>

        {/* Middle Continue Playing Notice Card matching Figma */}
        <div style={{
          width: '100%',
          background: 'rgba(21, 43, 91, 0.75)',
          border: '1.5px solid #35589A',
          borderRadius: '20px',
          padding: '22px 18px',
          textAlign: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <p style={{ fontSize: '15px', fontWeight: 800, color: '#FEC949', marginBottom: '8px', lineHeight: 1.4, direction: 'rtl' }}>
            يمكنك متابعة اللعب والفوز بجوائز أكبر!
          </p>
          <p style={{ fontSize: '13px', color: '#FFFFFF', margin: 0, lineHeight: 1.4, direction: 'ltr', unicodeBidi: 'isolate', fontWeight: 500 }}>
            You can continue playing for a chance to win even bigger prizes!
          </p>
        </div>

        {/* Primary Yellow Button matching Figma */}
        <button className="btn-primary" onClick={onContinue} style={{ width: '100%', marginTop: '6px' }}>
          <span className="text-ar">تابع اللعب</span>
          <span className="text-en">CONTINUE TO PLAY</span>
        </button>
      </div>
    </div>
  );
};
