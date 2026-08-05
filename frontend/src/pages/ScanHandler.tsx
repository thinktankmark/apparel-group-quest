import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../i18n/translations';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

interface ScanHandlerProps {
  onMainBoothScanned: () => void;
  onStoreQrScanned: (storeData: { storeId: string; sequenceOrder: number; gameKey: string }) => void;
  lang: Language;
}

export const ScanHandler: React.FC<ScanHandlerProps> = ({ onMainBoothScanned, onStoreQrScanned }) => {
  const { setMainBoothToken, setTargetQrContext } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

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
        setError('Network error validating QR token.');
      });
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', color: '#FEC949', fontWeight: 700 }}>🔍 Validating venue QR code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>
        <div className="error-banner" style={{ textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return null;
};
