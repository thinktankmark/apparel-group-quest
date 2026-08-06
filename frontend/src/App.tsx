import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CluePage } from './pages/CluePage';
import { VictoryPage } from './pages/VictoryPage';
import { GameHost } from './games/GameRegistry';
import { ScanHandler } from './pages/ScanHandler';

const STORES_LIST = [
  {
    id: 'store-skechers',
    nameAr: 'فرع سكتشرز',
    nameEn: 'Skechers Store',
    stationCode: 'SKECHERS',
    heroImageUrl: '34d55b61686498bafee0e7b9cd22896b69575b91',
    locationTextAr: 'محطة فرع سكتشرز',
    locationTextEn: 'Skechers Store Station'
  },
  {
    id: 'store-aco',
    nameAr: 'فرع أكو',
    nameEn: 'ACO Store',
    stationCode: 'ACO',
    heroImageUrl: 'cca4f63abe8d7095ba2e58420d30d9f620dcac66',
    locationTextAr: 'محطة فرع أكو',
    locationTextEn: 'ACO Store Station'
  },
  {
    id: 'store-bhpc',
    nameAr: 'فرع نادي بيفرلي هيلز للبولو',
    nameEn: 'BHPC Store',
    stationCode: 'BHPC',
    heroImageUrl: '264ac2a5b7a7381daed7e2020fedd3bf698ed358',
    locationTextAr: 'محطة فرع نادي بيفرلي هيلز للبولو',
    locationTextEn: 'BHPC Store Station'
  },
  {
    id: 'store-steve-madden',
    nameAr: 'فرع ستيف مادن',
    nameEn: 'Steve Madden Store',
    stationCode: 'STEVE_MADDEN',
    heroImageUrl: '6b71cb2867429c6763e78bf41f798068e6c6129a',
    locationTextAr: 'محطة فرع ستيف مادن',
    locationTextEn: 'Steve Madden Store Station'
  }
];

const AppContent: React.FC = () => {
  const { token, player, progress, activeClue, targetQrContext, completeStage, setTargetQrContext, logout } = useAuth();
  const [view, setView] = useState<'WELCOME' | 'LOGIN' | 'SIGNUP' | 'CLUE' | 'GAME' | 'VICTORY'>('SIGNUP');
  const [gameError, setGameError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  // Auto-dismiss floating error toast after 4 seconds
  useEffect(() => {
    if (gameError) {
      const timer = setTimeout(() => {
        setGameError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameError]);

  // Handle View State Transitions & Single Source of Truth Progress Protection
  useEffect(() => {
    if (progress?.isCompleted) {
      setView('VICTORY');
      return;
    }

    if (token && view !== 'LOGIN') {
      const targetCtx = targetQrContext || JSON.parse(sessionStorage.getItem('ag_target_qr') || 'null');
      if (targetCtx) {
        const currentSeq = progress?.currentSequenceOrder || 1;
        if (targetCtx.sequenceOrder === currentSeq) {
          setView('GAME');
        } else if (targetCtx.sequenceOrder < currentSeq) {
          setGameError("⚠️ لقد أكملت هذا الموقع بالفعل. / You have already completed this location.");
          setTargetQrContext(null);
          setView('CLUE');
        } else {
          setGameError("⚠️ لم تقم بفتح هذا الموقع بعد. / You haven't unlocked this location yet.");
          setTargetQrContext(null);
          setView('CLUE');
        }
      }
    }
  }, [token, progress, targetQrContext, view]);

  const handleGameSuccess = async (score: number, durationSeconds: number) => {
    const currentSeq = targetQrContext?.sequenceOrder || progress?.currentSequenceOrder || 1;
    try {
      const result = await completeStage(currentSeq, score, durationSeconds, true);
      setTargetQrContext(null);
      setGameError(null);

      if (result.progress?.isCompleted) {
        setView('VICTORY');
      } else {
        setView('CLUE');
      }
    } catch (err: any) {
      setGameError(err.message || 'Error updating progress.');
    }
  };

  const handleGameFailure = () => {
    // Retry state handled inside game components
  };

  const handleLogout = () => {
    logout();
    setTargetQrContext(null);
    setGameError(null);
    setView('LOGIN');
  };

  const getClueForView = () => {
    if (activeClue) return activeClue;
    const seq = targetQrContext?.sequenceOrder || 1;
    const store = STORES_LIST[Math.min(Math.max(seq - 1, 0), 3)];
    const gameKeys = ['MEMORY_MATCH', 'TIC_TAC_TOE', 'HORSE_JUMP', 'SPEED_TAP'];
    return {
      sequenceOrder: seq,
      gameKey: targetQrContext?.gameKey || gameKeys[Math.min(Math.max(seq - 1, 0), 3)],
      store
    };
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
      {/* Floating Error Toast */}
      {gameError && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '460px',
          background: 'rgba(220, 53, 69, 0.95)',
          border: '1.5px solid #FF5252',
          padding: '12px 18px',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 700,
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ flex: 1, textAlign: 'center' }}>{gameError}</span>
          <button
            onClick={() => setGameError(null)}
            style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '16px', fontWeight: 700, marginLeft: '12px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* URL Physical Store & Main Booth QR Scan Handler */}
      <ScanHandler
        lang="ar"
        onMainBoothScanned={() => {
          setGameError(null);
          if (token) {
            if (progress?.isCompleted) setView('VICTORY');
            else setView('CLUE');
          } else {
            setView('SIGNUP');
          }
        }}
        onStoreQrScanned={(storeCtx) => {
          setGameError(null);
          logout(); // Force re-authentication on store scan
          setTargetQrContext(storeCtx);
          setView('LOGIN');
        }}
        onAdminTestPreview={(testView, stationNum) => {
          setGameError(null);
          const v = testView.toUpperCase();
          if (v === 'WELCOME' || v === 'INSTRUCTIONS') setView('WELCOME');
          else if (v === 'VICTORY') setView('VICTORY');
          else if (v === 'GAME' || v === 'CLUE') {
            const gameKeys = ['MEMORY_MATCH', 'TIC_TAC_TOE', 'HORSE_JUMP', 'SPEED_TAP'];
            const gameKey = gameKeys[Math.min(Math.max(stationNum - 1, 0), 3)];
            setTargetQrContext({ storeId: `store-test-${stationNum}`, sequenceOrder: stationNum, gameKey });
            setView(v as any);
          }
        }}
      />

      {/* Views Router */}
      {view === 'SIGNUP' && (
        <SignupPage
          lang="ar"
          onSignupSuccess={() => { setGameError(null); setView('WELCOME'); }}
          onGoToLogin={() => { setGameError(null); setView('SIGNUP'); }}
        />
      )}

      {view === 'WELCOME' && (
        <WelcomePage
          onStart={() => { setGameError(null); setView('CLUE'); }}
        />
      )}

      {view === 'LOGIN' && (
        <LoginPage
          lang="ar"
          onLoginSuccess={(freshSeqOrder) => {
            setGameError(null);
            const targetCtx = targetQrContext || JSON.parse(sessionStorage.getItem('ag_target_qr') || 'null');
            if (targetCtx) {
              const currentSeq = freshSeqOrder || progress?.currentSequenceOrder || 1;
              if (targetCtx.sequenceOrder === currentSeq) {
                setView('GAME');
              } else if (targetCtx.sequenceOrder < currentSeq) {
                setGameError("⚠️ لقد أكملت هذا الموقع بالفعل. / You have already completed this location.");
                setTargetQrContext(null);
                setView('CLUE');
              } else {
                setGameError("⚠️ لم تقم بفتح هذا الموقع بعد. / You haven't unlocked this location yet.");
                setTargetQrContext(null);
                setView('CLUE');
              }
            } else {
              setView('CLUE');
            }
          }}
          onGoToSignup={() => { setGameError(null); setView('SIGNUP'); }}
        />
      )}

      {view === 'CLUE' && (
        <CluePage
          lang="ar"
          activeClue={getClueForView()}
          onScanStoreQr={(storeCtx) => {
            setGameError(null);
            setTargetQrContext(storeCtx);
            setView('GAME');
          }}
        />
      )}

      {view === 'GAME' && (
        <div className="app-container" style={{ width: '100%' }}>
          <GameHost
            gameKey={targetQrContext?.gameKey || activeClue?.gameKey || 'MEMORY_MATCH'}
            onSuccess={handleGameSuccess}
            onFailure={handleGameFailure}
            lang="ar"
          />
        </div>
      )}

      {view === 'VICTORY' && (
        <VictoryPage player={player} lang="ar" />
      )}

      {/* Minimal User ID & Logout Footer matching Figma Screenshot */}
      {token && player && (
        <div style={{
          width: '100%',
          maxWidth: '500px',
          margin: '20px auto 16px auto',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          color: '#9BB1DB',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.8px',
          zIndex: 10
        }}>
          <span>USER: {player.phoneNumber?.replace(/\D/g, '').slice(-8) || player.email?.split('@')[0] || '47846214'}</span>
          <span style={{ color: '#35589A' }}>•</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF5252',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            Logout 🚪
          </button>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
