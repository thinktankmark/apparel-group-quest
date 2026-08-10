import React from 'react';
import { translations, Language } from '../i18n/translations';

interface MainBoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const MainBoothModal: React.FC<MainBoothModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const t = translations[lang];

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '420px', padding: '20px 18px' }}>
        

        {/* Main Booth Image */}
        <div style={{
          width: '100%',
          height: '180px',
          borderRadius: '14px',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid #FEC949',
          marginBottom: '16px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
        }}>
          <img
            src="/assets/main-booth.png"
            alt="Apparel Group Main Booth"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Header Pill */}
          <div style={{
            background: '#152B5B',
            border: '1px solid #FEC949',
            borderRadius: '8px',
            padding: '6px 12px',
            color: '#FEC949',
            position:'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width:'max-content',
            fontSize: '10.5px',
            fontWeight: 700,
            marginBottom: '0',
            textAlign: 'center'
          }}>
            {t.boothPopupHeader}
          </div>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#FEC949', marginBottom: '4px', textAlign: 'center' }}>
          {t.boothPopupTitle}
        </h2>
        <h3 style={{ fontSize: '13.5px', fontWeight: 700, direction: 'ltr', unicodeBidi: 'isolate', color: '#FFFFFF', marginBottom: '14px', textAlign: 'center' }}>
          {t.boothPopupSubtitle}
        </h3>

        {/* Body Text */}
        <p style={{ fontSize: '11.5px', color: '#FFFFFF', marginBottom: '6px', lineHeight: 1.4, textAlign: 'center', direction: 'rtl' }}>
          {t.boothPopupBodyAr}
        </p>
        <p style={{ fontSize: '11px', color: '#9BB1DB', direction: 'ltr', unicodeBidi: 'isolate', marginBottom: '20px', lineHeight: 1.4, textAlign: 'center' }}>
          {t.boothPopupBodyEn}
        </p>

        {/* Action Button */}
        <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
          <span className="text-ar">{t.gotItBtn}</span>
          <span className="text-en">{t.gotItBtnSub}</span>
        </button>
      </div>
    </div>
  );
};
