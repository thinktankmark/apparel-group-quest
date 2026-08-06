import React from 'react';
import { HeaderLogo } from './HeaderLogo';

interface FinalVictoryModalProps {
  onContinue: () => void;
}

export const FinalVictoryModal: React.FC<FinalVictoryModalProps> = ({ onContinue }) => {
  return (
    <div className="modal-overlay" style={{ padding: '16px', overflowY: 'auto' }}>
      <div className="modal-card" style={{
        maxWidth: '460px',
        padding: '24px 18px',
        background: '#0B193C',
        border: '2px solid #FEC949',
        borderRadius: '24px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Top Header Logo */}
        <HeaderLogo />

        {/* Arabic Headline (Gold) */}
        <h1 style={{
          fontSize: '19px',
          fontWeight: 800,
          color: '#FEC949',
          textAlign: 'center',
          marginBottom: '6px',
          lineHeight: 1.3
        }}>
          لقد أكملت تحديك الأخير بنجاح!
        </h1>

        {/* Arabic Subtitle (White) */}
        <p style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: '16px',
          lineHeight: 1.4
        }}>
          تفضل بزيارة جناح مجموعة أباريل لتدوير العجلة والحصول على جائزتك!
        </p>

        {/* English Headline (Gold) */}
        <h2 style={{
          fontSize: '15px',
          fontWeight: 700,
          color: '#FEC949',
          textAlign: 'center',
          marginBottom: '4px',
          lineHeight: 1.3
        }}>
          You have completed your last challenge!
        </h2>

        {/* English Subtitle (White) */}
        <p style={{
          fontSize: '12.5px',
          fontWeight: 400,
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: '20px',
          lineHeight: 1.4
        }}>
          Meet us at the Apparel Group booth to spin the wheel and get your prize!
        </p>

        {/* Main Glassmorphism Booth Card matching VictoryPage */}
        <div style={{
          width: '100%',
          background: 'rgba(13, 35, 87, 0.95)',
          border: '1.5px solid #35589A',
          borderRadius: '20px',
          padding: '14px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Main Booth Photo */}
          <div style={{ width: '100%', overflow: 'hidden', borderRadius: '14px', marginBottom: '14px' }}>
            <img
              src="/assets/step3.png"
              alt="Apparel Group Main Booth"
              style={{
                width: '100%',
                height: '180px',
                objectFit: 'cover',
                display: 'block',
                borderRadius: '14px'
              }}
            />
          </div>

          {/* Location Pill Badge */}
          <div style={{
            background: '#041B4E',
            border: '1.5px solid #FEC949',
            borderRadius: '30px',
            padding: '6px 16px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#FEC949' }}>
              📍 Apparel Group Main Booth • جناح مجموعة أباريل
            </span>
          </div>

          {/* Card Footer Text */}
          <div style={{ textAlign: 'center', padding: '0 4px' }}>
            <p style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
              🎁 جوائز فورية وقسائم شراء حصرية بانتظارك!
            </p>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#9BB1DB' }}>
              Instant prizes & exclusive vouchers await you!
            </p>
          </div>
        </div>

        {/* View Final Result Yellow CTA Button */}
        <button className="btn-primary" onClick={onContinue} style={{ width: '100%' }}>
          <span className="text-ar">عرض النتيجة النهائية</span>
          <span className="text-en">VIEW FINAL RESULT</span>
        </button>
      </div>
    </div>
  );
};
