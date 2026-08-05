import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CluePage } from './pages/CluePage';
import { VictoryPage } from './pages/VictoryPage';
import { GameHost } from './games/GameRegistry';
import { ScanHandler } from './pages/ScanHandler';

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

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Floating Error Toast (Position Fixed overlay) */}
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
      />

      {/* Views Router */}
      {view === 'SIGNUP' && (
        <SignupPage
          lang="ar"
          onSignupSuccess={() => { setGameError(null); setView('WELCOME'); }}
          onGoToLogin={() => { setGameError(null); setView('LOGIN'); }}
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

      {view === 'CLUE' && activeClue && (
        <CluePage
          lang="ar"
          activeClue={activeClue}
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

      {/* Fixed Bottom Center Footer for User ID & Logout Button */}
      {token && player && (
        <div style={{
          position: 'fixed',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '460px',
          background: 'rgba(21, 43, 91, 0.95)',
          border: '1.5px solid #FEC949',
          borderRadius: '16px',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          zIndex: 9999
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'start' }}>
            <span style={{ fontSize: '10px', color: '#9BB1DB' }}>معرّف اللاعب / User ID</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FEC949' }}>
              👤 {player.email || player.phoneNumber}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(220, 53, 69, 0.3)',
              border: '1px solid #FF5252',
              borderRadius: '8px',
              color: '#FFB8B8',
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            خروج 🚪 Logout
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
