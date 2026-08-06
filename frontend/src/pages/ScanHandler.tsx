import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../i18n/translations';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://apparel-hunt-api.onrender.com').replace(/\/$/, '');

interface ScanHandlerProps {
  onMainBoothScanned: () => void;
  onStoreQrScanned: (storeData: { storeId: string; sequenceOrder: number; gameKey: string }) => void;
  onAdminTestPreview?: (testView: string, stationNumber: number) => void;
  lang: Language;
}

export const ScanHandler: React.FC<ScanHandlerProps> = ({ onMainBoothScanned, onStoreQrScanned, onAdminTestPreview }) => {
  const { setMainBoothToken, setTargetQrContext } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const testView = params.get('test_view');
    const stationNum = parseInt(params.get('station') || '1', 10);

    // Admin testing preview override link (?test_view=WELCOME | CLUE | GAME | VICTORY)
    if (testView && onAdminTestPreview) {
      setLoading(false);
      onAdminTestPreview(testView, stationNum);
      return;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/qr/validate?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.error) {
          setError(data.message || 'Invalid or expired QR code.');
          return;
        }

        if (data.isMainBooth) {
          setMainBoothToken(data.mainBoothToken);
          onMainBoothScanned();
        } else {
          const ctx = {
            storeId: data.store.id,
            sequenceOrder: data.sequenceOrder,
            gameKey: data.gameKey
          };
          setTargetQrContext(ctx);
          onStoreQrScanned(ctx);
        }
      })
      .catch(err => {
        setLoading(false);
        setError(err.message || 'Error validating QR token');
      });
  }, []);

  if (!loading && !error) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {loading && (
          <>
            <span style={{ fontSize: '36px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⏳</span>
            <p style={{ fontSize: '13px', color: '#FEC949', fontWeight: 700 }}>جاري التحقق... / Validating QR Code...</p>
          </>
        )}
        {error && (
          <>
            <span style={{ fontSize: '42px', marginBottom: '12px' }}>⚠️</span>
            <h2 style={{ fontSize: '16px', color: '#FF5252', marginBottom: '8px' }}>رمز غير صالح / Invalid Code</h2>
            <p style={{ fontSize: '12px', color: '#FFFFFF', marginBottom: '20px' }}>{error}</p>
            <button className="btn-primary" onClick={() => setError(null)}>
              <span className="text-ar">إغلاق</span>
              <span className="text-en">CLOSE</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
