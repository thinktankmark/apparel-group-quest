import React from 'react';
import { HeaderLogo } from '../components/HeaderLogo';

interface WelcomePageProps {
  onStart: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  return (
    <div className="app-container" style={{ width: '100%', maxWidth: '500px', paddingBottom: '32px', direction: 'ltr' }}>
      <HeaderLogo />

      {/* Title Block */}
      <h1 className="title-ar" style={{ fontSize: '18px', fontWeight: 700, color: '#FEC949', marginBottom: '4px', textAlign: 'center' }}>
        كيف تشارك في رحلة البحث عن الكنز؟
      </h1>
      <h2 style={{ fontSize: '14px', fontWeight: 400, color: '#FFFFFF', marginBottom: '28px', textAlign: 'center' }}>
        How to Play the Treasure Hunt?
      </h2>

      {/* Dotted Vertical Timeline Container (Enforced LTR so numbers and dotted line are strictly on the LEFT) */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px', direction: 'ltr' }}>
        {/* Dotted Line Pinned to LEFT */}
        <div style={{
          position: 'absolute',
          top: '20px',
          bottom: '20px',
          left: '14px',
          width: '2px',
          borderLeft: '2px dashed #FEC949',
          zIndex: 0
        }} />

        {/* Step 1 */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '14px', alignItems: 'flex-start', direction: 'ltr' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#FEC949',
            color: '#1B3774',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '12px',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(254, 201, 73, 0.4)'
          }}>
            01
          </div>

          <div style={{
            flex: 1,
            background: 'rgba(21, 43, 91, 0.92)',
            border: '1.2px solid #35589A',
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(4px)'
          }}>
            <img
              src="/assets/step1.png"
              alt="Step 1 Store Station"
              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
            />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px', textAlign: 'start' }}>
                ١. اتبع الأدلة.
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FEC949', marginBottom: '8px', textAlign: 'start' }}>
                1. Follow the clues.
              </div>
              <div style={{ fontSize: '11px', color: '#D0DCF2', marginBottom: '2px', textAlign: 'start' }}>
                اكتشف الأدلة وقم بمسح رموز QR.
              </div>
              <div style={{ fontSize: '10.5px', color: '#9BB1DB', textAlign: 'start' }}>
                Discover the clue checkpoints and scan the QR codes.
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '14px', alignItems: 'flex-start', direction: 'ltr' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#FEC949',
            color: '#1B3774',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '12px',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(254, 201, 73, 0.4)'
          }}>
            02
          </div>

          <div style={{
            flex: 1,
            background: 'rgba(21, 43, 91, 0.92)',
            border: '1.2px solid #35589A',
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(4px)'
          }}>
            <img
              src="/assets/step2.png"
              alt="Step 2 Browser Game"
              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
            />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px', textAlign: 'start' }}>
                ٢. العب التحديات للحصول على أدلة جديدة.
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FEC949', marginBottom: '8px', textAlign: 'start' }}>
                2. Play the Challenges on your browser and get new clues.
              </div>
              <div style={{ fontSize: '11px', color: '#D0DCF2', marginBottom: '2px', textAlign: 'start' }}>
                امسح رمز QR ولعب الألعاب على الهاتف لفتح أدلة جديدة.
              </div>
              <div style={{ fontSize: '10.5px', color: '#9BB1DB', textAlign: 'start' }}>
                Scan QR codes & play web games to reveal new clues.
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '14px', alignItems: 'flex-start', direction: 'ltr' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#FEC949',
            color: '#1B3774',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '12px',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(254, 201, 73, 0.4)'
          }}>
            03
          </div>

          <div style={{
            flex: 1,
            background: 'rgba(21, 43, 91, 0.92)',
            border: '1.2px solid #35589A',
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(4px)'
          }}>
            <img
              src="/assets/step3.png"
              alt="Step 3 Claim Gift"
              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
            />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px', textAlign: 'start' }}>
                ٣. أكمل جميع نقاط التحدي واستلم هديتك من جناحنا.
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FEC949', marginBottom: '8px', textAlign: 'start' }}>
                3. Complete the treasure hunt to get your gift.
              </div>
              <div style={{ fontSize: '11px', color: '#D0DCF2', marginBottom: '2px', textAlign: 'start' }}>
                إنهاء التحديات وتوجّه للجناح لاستلام هديتك الحصرية.
              </div>
              <div style={{ fontSize: '10.5px', color: '#9BB1DB', textAlign: 'start' }}>
                Finish all checkpoints & claim your gift at our booth.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button className="btn-primary" onClick={onStart}>
        <span className="text-ar">احصل على دليلك الأول</span>
        <span className="text-en">GET YOUR FIRST CLUE</span>
      </button>
    </div>
  );
};
