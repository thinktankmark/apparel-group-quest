import React from 'react';
import { HeaderLogo } from '../components/HeaderLogo';
import { Player } from '../context/AuthContext';

interface VictoryPageProps {
  player: Player | null;
  lang?: string;
}

export const VictoryPage: React.FC<VictoryPageProps> = ({ player }) => {
  return (
    <div className="app-container">
      <HeaderLogo />

      {/* Arabic Headline (Gold) */}
      <h1 style={{
        fontSize: '20px',
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
        fontSize: '13.5px',
        fontWeight: 500,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: '20px',
        lineHeight: 1.4,
        maxWidth: '440px'
      }}>
        تفضل بزيارة جناح مجموعة أباريل لتدوير العجلة والحصول على جائزتك!
      </p>

      {/* English Headline (Gold) */}
      <h2 style={{
        fontSize: '16px',
        fontWeight: 700,
        color: '#FEC949',
        direction: 'ltr',
        textAlign: 'center',
        marginBottom: '4px',
        lineHeight: 1.3
      }}>
        You have completed your last challenge!
      </h2>

      {/* English Subtitle (White) */}
      <p style={{
        fontSize: '13px',
        fontWeight: 400,
        color: '#FFFFFF',
        direction: 'ltr',
        textAlign: 'center',
        marginBottom: '24px',
        lineHeight: 1.4,
        maxWidth: '440px'
      }}>
        Meet us at the Apparel Group booth to spin the wheel and get your prize!
      </p>

      {/* Main Glassmorphism Booth Card matching Figma Screenshot */}
      <div style={{
        width: '100%',
        background: 'rgba(13, 35, 87, 0.95)',
        border: '1.5px solid #35589A',
        borderRadius: '24px',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Main Booth Photo */}
        <div style={{ width: '100%', overflow: 'hidden', borderRadius: '16px', marginBottom: '16px' }}>
          <img
            src="/assets/main-booth.png"
            alt="Apparel Group Main Booth"
            style={{
              width: '100%',
              height: '210px',
              objectFit: 'cover',
              display: 'block',
              borderRadius: '16px'
            }}
          />
        </div>

        {/* Location Pill Badge matching Figma Screenshot */}
        <div style={{
          background: '#041B4E',
          border: '1.5px solid #FEC949',
          borderRadius: '30px',
          padding: '8px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#FEC949' }}>
            📍 Apparel Group Main Booth • جناح مجموعة أباريل
          </span>
        </div>

        {/* Card Footer Text matching Figma Screenshot */}
        <div style={{ textAlign: 'center', padding: '0 8px' }}>
          <p style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
            🎁 جوائز فورية وقسائم شراء حصرية بانتظارك!
          </p>
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#9BB1DB', direction: 'ltr'}}>
            Instant prizes & exclusive vouchers await you!
          </p>
        </div>
      </div>
    </div>
  );
};
