import React from 'react';
import { ActiveClue } from '../context/AuthContext';

interface CluePageProps {
  activeClue: ActiveClue;
  onScanStoreQr: (storeData: { storeId: string; sequenceOrder: number; gameKey: string }) => void;
  lang: 'ar' | 'en';
}

export const CluePage: React.FC<CluePageProps> = ({ activeClue }) => {
  const { store, sequenceOrder } = activeClue;

  // Storefront images mapping (Check store code / name / id FIRST)
  const getStoreImage = (code: string = '', nameEn: string = '', storeId: string = '') => {
    const codeUpper = (code || '').toUpperCase();
    const nameUpper = (nameEn || '').toUpperCase();
    const idUpper = (storeId || '').toUpperCase();

    if (codeUpper === 'BHPC' || nameUpper.includes('POLO') || nameUpper.includes('BHPC') || idUpper.includes('BHPC')) return '/assets/polo-store.png';
    if (codeUpper === 'ACO' || nameUpper.includes('ACO') || idUpper.includes('ACO')) return '/assets/aco-store.png';
    if (codeUpper === 'CROCS' || nameUpper.includes('CROCS') || idUpper.includes('CROCS')) return '/assets/crocs-store.png';
    if (codeUpper === 'SKECHERS' || nameUpper.includes('SKECHERS') || idUpper.includes('SKECHERS')) return '/assets/skechers-store.png';
    return '/assets/polo-store.png';
  };

  // Render Official Uploaded Brand Logo PNGs (Check store code / name / id FIRST)
  const renderStoreLogo = (code: string = '', nameEn: string = '', storeId: string = '') => {
    const codeUpper = (code || '').toUpperCase();
    const nameUpper = (nameEn || '').toUpperCase();
    const idUpper = (storeId || '').toUpperCase();

    const isBhpc = codeUpper === 'BHPC' || nameUpper.includes('POLO') || nameUpper.includes('BHPC') || nameUpper.includes('BEVERLY') || idUpper.includes('BHPC');
    const isAco = codeUpper === 'ACO' || nameUpper.includes('ACO') || idUpper.includes('ACO');
    const isSkechers = codeUpper === 'SKECHERS' || nameUpper.includes('SKECHERS') || idUpper.includes('SKECHERS');
    const isCrocs = codeUpper === 'CROCS' || nameUpper.includes('CROCS') || idUpper.includes('CROCS');

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexShrink: 0,
        height: '44px'
      }}>
        {isBhpc && (
          <img
            src="/assets/polo-logo.png"
            alt="Beverly Hills Polo Club"
            style={{ maxWidth: '170px', maxHeight: '40px', objectFit: 'contain', display: 'block' }}
          />
        )}
        {!isBhpc && isAco && (
          <img
            src="/assets/aco-logo.png"
            alt="ACO Store"
            style={{ maxWidth: '110px', maxHeight: '40px', objectFit: 'contain', display: 'block' }}
          />
        )}
        {!isBhpc && !isAco && isSkechers && (
          <img
            src="/assets/skechers-logo.png"
            alt="Skechers"
            style={{ maxWidth: '140px', maxHeight: '40px', objectFit: 'contain', display: 'block' }}
          />
        )}
        {!isBhpc && !isAco && !isSkechers && isCrocs && (
          <img
            src="/assets/crocs-logo.png"
            alt="Crocs"
            style={{ maxWidth: '120px', maxHeight: '36px', objectFit: 'contain', display: 'block' }}
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
      {/* Top Header Row: Left Apparel Group Logo, Right Official Brand Logo */}
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
        {/* Left: Apparel Group Main Logo */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img
            src="/assets/apparel-logo.png"
            alt="Apparel Group"
            style={{ width: '115px', maxHeight: '44px', objectFit: 'contain' }}
          />
        </div>

        {/* Right: Official Store Brand Logo */}
        {renderStoreLogo(store?.stationCode, store?.nameEn, store?.id)}
      </div>

      {/* Main Store Station Card */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(21, 43, 91, 0.92)',
        border: '1.5px solid #35589A',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        marginBottom: '20px'
      }}>
        {/* Storefront Image */}
        <div style={{ width: '100%', position: 'relative', overflow: 'hidden', padding: '12px 12px 0 12px', boxSizing: 'border-box' }}>
          <img
            src={getStoreImage(store?.stationCode, store?.nameEn, store?.id)}
            alt={store?.nameEn || 'Store'}
            style={{
              width: '100%',
              height: '190px',
              objectFit: 'cover',
              borderRadius: '14px',
              border: '1px solid #35589A',
              display: 'block'
            }}
          />
        </div>

        {/* Location Badge Pill */}
        <div style={{ padding: '0 16px', marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(4, 27, 78, 0.9)',
            border: '1px solid #FEC949',
            borderRadius: '20px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#FEC949',
            fontSize: '11.5px',
            fontWeight: 700,
            textAlign: 'center'
          }}>
            <span>📍</span>
            <span style={{ direction: 'rtl' }}>{store?.nameAr || 'فرع المحطة'}</span>
            <span style={{ color: '#35589A' }}>•</span>
            <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{store?.nameEn || 'Station Store'}</span>
          </div>
        </div>

        {/* Text Content matching Figma */}
        <div style={{ padding: '18px 16px 20px 16px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, direction: 'rtl', color: '#FEC949', marginBottom: '6px', lineHeight: 1.4 }}>
            تفضل بزيارة {store?.nameAr || ''} للحصول على دليلك {getClueOrdinalAr(sequenceOrder)}!
          </h2>
          <h3 style={{ fontSize: '13.5px', fontWeight: 700, direction: 'ltr', unicodeBidi: 'isolate', color: '#FFFFFF', margin: 0, lineHeight: 1.4 }}>
            Meet us at {store?.nameEn || ''} to get your {getClueOrdinalEn(sequenceOrder)} clue.
          </h3>
        </div>
      </div>

      {/* CTA Button matching Figma */}
      <button className="btn-primary" style={{ width: '100%' }}>
        <span className="text-ar">توجه إلى {store?.nameAr || ''}</span>
        <span className="text-en">HEAD TO {(store?.nameEn || '').toUpperCase()}</span>
      </button>
    </div>
  );
};
