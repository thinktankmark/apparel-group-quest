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
    if (seqOrder === 4 || codeUpper === 'STEVE_MADDEN' || nameUpper.includes('STEVE') || idUpper.includes('STEVE')) return '/assets/steve-madden-store.png';
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
    const isSteveMadden = seqOrder === 4 || codeUpper === 'STEVE_MADDEN' || nameUpper.includes('STEVE') || idUpper.includes('STEVE');

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
            style={{ maxWidth: '100%', objectFit: 'contain', display: 'block' }}
          />
        )}
        {!isBhpc && isAco && (
          <img
            src="/assets/aco-logo.png"
            alt="Beverly Hills Polo Club"
            style={{ maxWidth: '100%', objectFit: 'contain', display: 'block' }}
          />
          // <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
          //   <span style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.5px' }}>
          //     ΔCO.
          //   </span>
          //   <span style={{ fontSize: '7.5px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '1px', marginTop: '1px' }}>
          //     athletesco
          //   </span>
          // </div>
        )}
        {!isBhpc && !isAco && isSkechers && (
          <img
            src="/assets/skechers-logo.png"
            alt="Skechers"
            style={{ maxWidth: '100%', objectFit: 'contain', display: 'block' }}
          />
        )}
        {!isBhpc && !isAco && !isSkechers && isSteveMadden && (
          <img
            src="/assets/steve-madden-logo.png"
            alt="Steve Madden"
            style={{ maxWidth: '100%', objectFit: 'contain', display: 'block' }}
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
    <div className="app-container" style={{ width: '100%', maxWidth: '500px', paddingBottom: '80px' }}>
      {/* Top Header Row with Apparel Group Logo on Left & Official Brand Logo on Right */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
        direction: 'ltr',
        padding: '0 4px',
        boxSizing: 'border-box'
      }}>
        {/* Left: Apparel Group Main Logo Container */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <img
            src="/assets/apparel-logo.png"
            alt="Apparel Group"
            style={{ maxWidth: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Right: Official Store Brand Logo Container */}
        {renderStoreLogo(store?.stationCode, store?.nameEn, store?.id, sequenceOrder)}
      </div>

      {/* Main Store Station Card */}
      <div style={{
        width: '100%',
        background: 'rgba(21, 43, 91, 0.92)',
        border: '1.5px solid #35589A',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        marginBottom: '20px'
      }}>
        {/* Storefront Image */}
        <div style={{ width: '100%', position: 'relative', overflow: 'hidden', padding: '12px 12px 0 12px' }}>
          <img
            src={getStoreImage(store?.stationCode, store?.nameEn, store?.id, sequenceOrder)}
            alt={store?.nameEn || 'Store'}
            style={{
              width: '100%',
              height: '190px',
              objectFit: 'cover',
              borderRadius: '14px',
              border: '1px solid #35589A'
            }}
          />
        </div>

        {/* Location Badge Pill */}
        <div style={{ padding: '0 16px', marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(4, 27, 78, 0.9)',
            border: '1px solid #FEC949',
            borderRadius: '20px',
            padding: '5px 14px',
            color: '#FEC949',
            fontSize: '11.5px',
            fontWeight: 700,
            textAlign: 'center'
          }}>
            📍 {store?.locationTextAr || ''} • {store?.locationTextEn || ''}
          </div>
        </div>

        {/* Text Content matching Figma */}
        <div style={{ padding: '20px 16px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, direction:'rtl', color: '#FEC949', marginBottom: '4px', lineHeight: 1.4 }}>
            تفضل بزيارة فرع {store?.nameAr || ''}<br />للحصول على دليلك {getClueOrdinalAr(sequenceOrder)}!
          </h2>
          <h3 style={{ fontSize: '13.5px', fontWeight: 700, direction:'ltr', color: '#FFFFFF', marginBottom: '16px', lineHeight: 1.4 }}>
            Meet us at {store?.nameEn || ''}<br />to get your {getClueOrdinalEn(sequenceOrder)} clue.
          </h3>
        </div>
      </div>

      {/* CTA Button matching Figma */}
      <button className="btn-primary" style={{ width: '100%' }}>
        <span className="text-ar">توجه إلى فرع {store?.nameAr || ''}</span>
        <span className="text-en">HEAD TO {(store?.nameEn || '').toUpperCase()}</span>
      </button>
    </div>
  );
};
