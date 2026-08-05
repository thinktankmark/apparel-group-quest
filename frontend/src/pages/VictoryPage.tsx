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

      {/* Main Congratulations Header */}
      <h1 className="title-ar" style={{ fontSize: '18px', marginBottom: '4px' }}>
        تهانينا! لقد أكملت رحلة البحث عن الكنز بنجاح 🎉
      </h1>
      <h2 className="subtitle-en" style={{ fontSize: '13.5px', marginBottom: '20px' }}>
        Congratulations! You successfully completed the Treasure Hunt 🎉
      </h2>

      {/* Booth Destination Card */}
      <div className="station-card">
        <div style={{
          width: '100%',
          height: '180px',
          background: 'linear-gradient(180deg, #152B5B 0%, #162F65 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '56px',
          position: 'relative'
        }}>
          🎁 🎡 🏆
          <div style={{
            position: 'absolute',
            bottom: '12px',
            background: '#152B5B',
            border: '1px solid #FEC949',
            borderRadius: '6px',
            padding: '4px 12px',
            color: '#FEC949',
            fontSize: '10.5px',
            fontWeight: 700
          }}>
            📍 قاعة المعرض ٣ • جناح #A-12 | Exhibition Hall 3 • Booth #A-12
          </div>
        </div>

        <div style={{ padding: '20px', textAlign: 'center', width: '100%' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px', lineHeight: 1.4 }}>
            تفضل بزيارة جناحنا الرئيسي الآن واستلم هديتك الحصرية!
          </p>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#FEC949', marginBottom: '10px' }}>
            Visit our main booth now to claim your exclusive gift!
          </p>
          <p style={{ fontSize: '11px', color: '#D0DCF2', lineHeight: 1.4, marginBottom: '4px' }}>
            سيقوم موظف الجناح بالتحقق من حسابك برقم الهاتف أو البريد الإلكتروني وتظليم هديتك فوراً.
          </p>
          <p style={{ fontSize: '10.5px', color: '#9BB1DB', lineHeight: 1.4 }}>
            Staff will verify your account via email or phone number and hand over your prize.
          </p>
        </div>
      </div>

      {/* Proof of Completion Confirmation Banner */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(140, 230, 61, 0.15)',
        border: '1.5px solid #8CE63D',
        borderRadius: '12px',
        padding: '12px 16px',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#8CE63D', marginBottom: '2px' }}>
          ✅ اكتملت جميع التحديات بنجاح!
        </div>
        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#8CE63D' }}>
          ALL CHALLENGES COMPLETED SUCCESSFULLY!
        </div>
      </div>

      {/* Participant User Footer Badge */}
      <div style={{
        marginTop: 'auto',
        marginBottom: '16px',
        textAlign: 'center',
        color: '#9BB1DB',
        fontSize: '11px',
        fontWeight: 700
      }}>
        USER: {player ? player.phoneNumber.replace(/\D/g, '').slice(-8) || '47846214' : '47846214'}
      </div>
    </div>
  );
};
