import React from 'react';
import { ActiveClue } from '../context/AuthContext';

interface CluePageProps {
  activeClue: ActiveClue;
  onScanStoreQr: (storeData: { storeId: string; sequenceOrder: number; gameKey: string }) => void;
  lang: 'ar' | 'en';
}

export const CluePage: React.FC<CluePageProps> = ({ activeClue }) => {
  const { store, sequenceOrder } = activeClue;

  // Storefront images mapping
  const getStoreImage = (code: string = '', nameEn: string = '', storeId: string = '', seqOrder: number = 1) => {
    const codeUpper = (code || '').toUpperCase();
    const nameUpper = (nameEn || '').toUpperCase();
    const idUpper = (storeId || '').toUpperCase();

    if (seqOrder === 3 || codeUpper === 'BHPC' || nameUpper.includes('POLO') || nameUpper.includes('BHPC') || idUpper.includes('BHPC')) return '/assets/polo-store.png';
    if (seqOrder === 2 || codeUpper === 'ACO' || nameUpper.includes('ACO') || idUpper.includes('ACO')) return '/assets/aco-store.png';
    if (seqOrder === 4 || codeUpper === 'CROCS' || codeUpper === 'STEVE_MADDEN' || nameUpper.includes('CROCS') || nameUpper.includes('STEVE') || idUpper.includes('CROCS')) return '/assets/steve-madden-store.png';
    if (seqOrder === 1 || codeUpper === 'SKECHERS' || nameUpper.includes('SKECHERS') || idUpper.includes('SKECHERS')) return '/assets/skechers-store.png';
    return '/assets/polo-store.png';
  };

  // Render Official Uploaded Brand Logo PNGs
  const renderStoreLogo = (code: string = '', nameEn: string = '', storeId: string = '', seqOrder: number = 1) => {
    const codeUpper = (code || '').toUpperCase();
    const nameUpper = (nameEn || '').toUpperCase();
    const idUpper = (storeId || '').toUpperCase();

    const isBhpc = seqOrder === 3 || codeUpper === 'BHPC' || nameUpper.includes('POLO') || nameUpper.includes('BHPC') || nameUpper.includes('BEVERLY') || idUpper.includes('BHPC');
    const isAco = seqOrder === 2 || codeUpper === 'ACO' || nameUpper.includes('ACO') || idUpper.includes('ACO');
    const isSkechers = seqOrder === 1 || codeUpper === 'SKECHERS' || nameUpper.includes('SKECHERS') || idUpper.includes('SKECHERS');
    const isCrocs = seqOrder === 4 || codeUpper === 'CROCS' || codeUpper === 'STEVE_MADDEN' || nameUpper.includes('CROCS') || nameUpper.includes('STEVE') || idUpper.includes('CROCS');

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {isBhpc && (
          <img
            src="/assets/polo-logo.png"
            alt="Beverly Hills Polo Club"
            style={{ maxWidth: '190px', objectFit: 'contain', display: 'block' }}
          />
        )}
        {!isBhpc && isAco && (
          <img
            src="/assets/aco-logo.png"
            alt="ACO Store"
            style={{ maxWidth: '100%', objectFit: 'contain', display: 'block' }}
          />
        )}
        {!isBhpc && !isAco && isSkechers && (
          <img
            src="/assets/skechers-logo.png"
            alt="Skechers"
            style={{ maxWidth: '100%', objectFit: 'contain', display: 'block' }}
          />
        )}
        {(!isBhpc && !isAco && !isSkechers && isCrocs) && (
          <img
            src="/assets/crocs-logo.png"
            alt="Crocs"
            style={{ maxWidth: '140px', objectFit: 'contain', display: 'block', filter: 'brightness(0) invert(1)' }}
          />
        )}
      </div>
    );
  };

  const getClueOrdinalAr = (seq: number) => {
    if (seq === 1) return 'الأول';
    if (seq === 2) return 'الثاني';
    if (seq === 3) return 'الثالث';
    return 'الرابع';
  };

  const getClueOrdinalEn = (seq: number) => {
    if (seq === 1) return 'first';
    if (seq === 2) return 'second';
    if (seq === 3) return 'third';
    return 'fourth';
  };

  return (
    <div className="app-container">
      {/* Top Header Row with Apparel Group Logo on Left & Official Brand Logo on Right */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '0 4px'
      }}>
        {/* Apparel Group Corporate Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/assets/apparel-logo.png"
            alt="Apparel Group Logo"
            style={{
              width: '115px',
              maxHeight: '44px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Dynamic Store Brand Logo */}
        <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {renderStoreLogo(store?.stationCode, store?.nameEn, store?.id, sequenceOrder)}
        </div>
      </div>

      <div className="location-pill" style={{ marginBottom: '16px' }}>
        <span className="icon">📍</span>
        <span className="text-ar">الدليل {getClueOrdinalAr(sequenceOrder)}: ابحث عن المحطة</span>
        <span className="text-en">Clue #{sequenceOrder}: Find the station</span>
      </div>

      <h1 className="title-ar" style={{ fontSize: '20px', marginBottom: '4px' }}>
        أنت قريب جداً!
      </h1>
      <h2 style={{ fontSize: '13.5px', color: '#FFFFFF', textAlign: 'center', marginBottom: '20px', fontWeight: 600, direction: 'ltr', unicodeBidi: 'isolate' }}>
        You're almost there!
      </h2>

      {/* Target Store Hero Image Card */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: '#152B5B',
        border: '1.5px solid #35589A',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
      }}>
        <div style={{ width: '100%', height: '180px', position: 'relative', overflow: 'hidden' }}>
          <img
            src={getStoreImage(store?.stationCode, store?.nameEn, store?.id, sequenceOrder)}
            alt={store?.nameEn || 'Store Station'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(to top, #152B5B, transparent)'
          }} />
        </div>

        <div style={{ padding: '16px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FEC949', marginBottom: '4px', direction: 'rtl' }}>
            {store?.nameAr || (sequenceOrder === 4 ? 'فرع كروكس' : 'فرع المحطة')}
          </h3>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: 0, direction: 'ltr', unicodeBidi: 'isolate' }}>
            {store?.nameEn || (sequenceOrder === 4 ? 'Crocs Store' : 'Station Store')}
          </h4>
        </div>
      </div>

      {/* Next Step Instructions Card */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(21, 43, 91, 0.6)',
        border: '1.5px solid #FEC949',
        borderRadius: '16px',
        padding: '18px 16px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#FEC949', marginBottom: '6px', lineHeight: 1.4, direction: 'rtl' }}>
          ابحث عن رمـز الاستجابة السريعة (QR) في الفرع وامسحه لتشغيل التحدي!
        </p>
        <p style={{ fontSize: '12px', color: '#D0DCF2', margin: 0, lineHeight: 1.4, direction: 'ltr', unicodeBidi: 'isolate' }}>
          Look for the QR code at the store and scan it to launch the challenge!
        </p>
      </div>
    </div>
  );
};
