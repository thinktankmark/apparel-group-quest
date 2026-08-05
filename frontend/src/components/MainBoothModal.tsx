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
      <div className="modal-card">
        <div style={{
          background: '#152B5B',
          border: '1px solid #FEC949',
          borderRadius: '8px',
          padding: '6px 12px',
          color: '#FEC949',
          fontSize: '10.5px',
          fontWeight: 700,
          marginBottom: '16px'
        }}>
          {t.boothPopupHeader}
        </div>

        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#FEC949', marginBottom: '4px' }}>
          {t.boothPopupTitle}
        </h2>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px' }}>
          {t.boothPopupSubtitle}
        </h3>

        <p style={{ fontSize: '11.5px', color: '#FFFFFF', marginBottom: '8px', lineHeight: 1.4 }}>
          {t.boothPopupBodyAr}
        </p>
        <p style={{ fontSize: '11px', color: '#9BB1DB', marginBottom: '24px', lineHeight: 1.4 }}>
          {t.boothPopupBodyEn}
        </p>

        <button className="btn-primary" onClick={onClose}>
          <span className="text-ar">{t.gotItBtn}</span>
          <span className="text-en">{t.gotItBtnSub}</span>
        </button>
      </div>
    </div>
  );
};
