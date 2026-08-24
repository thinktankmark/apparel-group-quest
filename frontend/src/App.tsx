import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CluePage } from './pages/CluePage';
import { StageRewardPage } from './pages/StageRewardPage';
import { GameVictoryScreen } from './components/GameVictoryScreen';
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
    id: 'store-bhpc',
    nameAr: 'فرع نادي بيفرلي هيلز للبولو',
    nameEn: 'BHPC Store',
    stationCode: 'BHPC',
    heroImageUrl: '264ac2a5b7a7381daed7e2020fedd3bf698ed358',
    locationTextAr: 'محطة فرع نادي بيفرلي هيلز للبولو',
    locationTextEn: 'BHPC Store Station'
  },
  {
    id: 'store-crocs',
    nameAr: 'فرع كروكس',
    nameEn: 'Crocs Store',
    stationCode: 'CROCS',
    heroImageUrl: '6b71cb2867429c6763e78bf41f798068e6c6129a',
    locationTextAr: 'محطة فرع كروكس',
    locationTextEn: 'Crocs Store Station'
  }
];

const AppContent: React.FC = () => {
  const { token, player, progress, activeClue, targetQrContext, completeStage, setTargetQrContext, logout, isLoadingProgress } = useAuth();
  const [view, setView] = useState<'WELCOME' | 'LOGIN' | 'SIGNUP' | 'CLUE' | 'GAME' | 'STAGE_REWARD' | 'FINAL_VICTORY_SCREEN' | 'VICTORY'>('LOGIN');
  const [gameError, setGameError] = useState<string | null>(null);

  const [scannedQrNum, setScannedQrNum] = useState<string | null>(() => {
    const saved = sessionStorage.getItem('ag_scanned_qr_num');
    if (saved) return saved;
    const tokenParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null;
    if (tokenParam) {
      if (tokenParam.includes('skechers')) return '1';
      if (tokenParam.includes('aco')) return '2';
      if (tokenParam.includes('bhpc') || tokenParam.includes('polo')) return '3';
      if (tokenParam.includes('crocs')) return '4';
      if (tokenParam.includes('main-booth')) return '0';
    }
    return null;
  });

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  }, []);

  useEffect(() => {
    const checkScannedNum = () => {
      const saved = sessionStorage.getItem('ag_scanned_qr_num');
      if (saved && saved !== scannedQrNum) {
        setScannedQrNum(saved);
      }
    };
    const interval = setInterval(checkScannedNum, 1000);
    return () => clearInterval(interval);
  }, [scannedQrNum]);

  // Auto-dismiss floating error toast after 18 seconds (or until manual dismissal)
  useEffect(() => {
    if (gameError) {
      const timer = setTimeout(() => {
        setGameError(null);
      }, 18000);
      return () => clearTimeout(timer);
    }
  }, [gameError]);

  const validateAndRouteStoreScan = (storeCtx: { storeId: string; sequenceOrder?: number; gameKey?: string }) => {
    if (isLoadingProgress) return; // Wait for backend progress to load!

    const currentSeq = progress?.currentSequenceOrder || 1;
    const activeStoreId = activeClue?.store?.id;
    const playerStoreSeq = progress?.storeSequence || ['store-skechers', 'store-bhpc', 'store-crocs'];

    // Check if the scanned storeId matches the player's current active store
    const isCurrentActiveStore = storeCtx.storeId === activeStoreId || storeCtx.storeId === playerStoreSeq[currentSeq - 1];

    // Check if the scanned storeId is one of the player's previously completed stores
    const completedStoreIds = playerStoreSeq.slice(0, currentSeq - 1);
    const isCompletedStore = completedStoreIds.includes(storeCtx.storeId);

    if (isCurrentActiveStore) {
      setGameError(null);
      setView('GAME');
    } else if (isCompletedStore) {
      setGameError("⚠️ لقد أكملت هذا الموقع بالفعل. / You have already completed this location.");
      setTargetQrContext(null);
      setView('CLUE');
    } else {
      const activeNameEn = activeClue?.store?.nameEn || 'Active Station Store';
      const activeNameAr = activeClue?.store?.nameAr || 'فرع المحطة النشط';
      setGameError(`⚠️ لم تقم بفتح هذا الموقع بعد. دليلك الحالي هو: ${activeNameAr}. / You haven't unlocked this location yet. Your active clue is for: ${activeNameEn}.`);
      setTargetQrContext(null);
      setView('CLUE');
    }
  };

  // Handle View State Transitions & Single Source of Truth Progress Protection
  useEffect(() => {
    const isTestPreview = new URLSearchParams(window.location.search).has('test_view');
    if (isTestPreview) return; // Skip progress lockouts when using admin test preview links!

    if (!token) {
      return; // Unauthenticated users stay on LOGIN or SIGNUP
    }

    if (progress?.isCompleted && view !== 'STAGE_REWARD' && view !== 'FINAL_VICTORY_SCREEN' && view !== 'VICTORY') {
      setView('VICTORY');
      return;
    }

    if (token && !isLoadingProgress && view !== 'LOGIN' && view !== 'SIGNUP' && view !== 'STAGE_REWARD' && view !== 'FINAL_VICTORY_SCREEN' && view !== 'VICTORY') {
      const targetCtx = targetQrContext || JSON.parse(sessionStorage.getItem('ag_target_qr') || 'null');
      if (targetCtx) {
        validateAndRouteStoreScan(targetCtx);
      }
    }
  }, [token, progress, targetQrContext, activeClue, isLoadingProgress, view]);

  const handleGameSuccess = async (score: number, durationSeconds: number) => {
    // ALWAYS use the player's current sequence order (1, 2, 3, or 4)
    const currentSeq = progress?.currentSequenceOrder || 1;
    try {
      const result = await completeStage(currentSeq, score, durationSeconds, true);
      setTargetQrContext(null);
      setGameError(null);

      // For 4th/last game (result.progress.isCompleted), show GameVictoryScreen first!
      // For intermediate games (1, 2, 3), show StageRewardPage.tsx!
      if (result.progress?.isCompleted) {
        setView('FINAL_VICTORY_SCREEN');
      } else {
        setView('STAGE_REWARD');
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
    const seq = progress?.currentSequenceOrder || 1;
    const playerSeq = progress?.storeSequence || ['store-skechers', 'store-bhpc', 'store-crocs'];
    const currentStoreId = playerSeq[seq - 1] || 'store-skechers';
    const store = STORES_LIST.find(s => s.id === currentStoreId) || STORES_LIST[0];

    const getGameKey = (sId: string) => {
      if (sId === 'store-skechers') return 'MEMORY_MATCH';
      if (sId === 'store-bhpc') return 'HORSE_JUMP';
      if (sId === 'store-crocs') return 'TIC_TAC_TOE';
      return 'MEMORY_MATCH';
    };

    return {
      sequenceOrder: seq,
      gameKey: getGameKey(currentStoreId),
      store
    };
  };

  const getGameKeyForView = () => {
    if (activeClue?.gameKey) return activeClue.gameKey;
    const storeId = activeClue?.store?.id || (progress?.storeSequence ? progress.storeSequence[(progress.currentSequenceOrder || 1) - 1] : 'store-skechers');
    if (storeId === 'store-skechers') return 'MEMORY_MATCH';
    if (storeId === 'store-bhpc') return 'HORSE_JUMP';
    if (storeId === 'store-crocs') return 'TIC_TAC_TOE';
    return 'MEMORY_MATCH';
  };

  const isFinalStage = (progress?.currentSequenceOrder || activeClue?.sequenceOrder || 1) === 3;

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
          setTargetQrContext(storeCtx);
          if (token) {
            validateAndRouteStoreScan(storeCtx);
          } else {
            setView('LOGIN');
          }
        }}
        onAdminTestPreview={(testView, stationNum) => {
          setGameError(null);
          const v = testView.toUpperCase();
          if (v === 'WELCOME' || v === 'INSTRUCTIONS') setView('WELCOME');
          else if (v === 'VICTORY') setView('VICTORY');
          else if (v === 'REWARD' || v === 'STAGE_REWARD') setView('STAGE_REWARD');
          else if (v === 'GAME' || v === 'CLUE') {
            const gameKeys = ['MEMORY_MATCH', 'SPEED_TAP', 'HORSE_JUMP', 'TIC_TAC_TOE'];
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
          onLoginSuccess={() => {
            setGameError(null);
            const targetCtx = targetQrContext || JSON.parse(sessionStorage.getItem('ag_target_qr') || 'null');
            if (targetCtx) {
              validateAndRouteStoreScan(targetCtx);
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
            validateAndRouteStoreScan(storeCtx);
          }}
        />
      )}

      {view === 'GAME' && (
        <div className="app-container" style={{ width: '100%' }}>
          <GameHost
            gameKey={getGameKeyForView()}
            onSuccess={handleGameSuccess}
            onFailure={handleGameFailure}
            lang="ar"
            isFinalStage={isFinalStage}
          />
        </div>
      )}

      {view === 'STAGE_REWARD' && (
        <StageRewardPage
          onContinue={() => setView('CLUE')}
          lang="ar"
        />
      )}

      {view === 'FINAL_VICTORY_SCREEN' && (
        <GameVictoryScreen
          gameTitleAr="تحدي البحث عن الكنز"
          gameTitleEn="Apparel Scavenger Hunt Quest"
          scoreTextAr="أكملت جميع المحطات الـ ٤ بنجاح!"
          scoreTextEn="ALL 4 STATIONS COMPLETED!"
          subtitleAr="أداء أسطوري ورائع! توجه إلى الجناح الرئيسي للمطالبة بجائزتك وحرق عجلة الحظ."
          subtitleEn="Legendary performance! Head to the Main Booth to claim your prize and spin the wheel."
          centerEmoji="🏆 🎁 ✨"
          isFinalStage={true}
          onContinue={() => setView('VICTORY')}
        />
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

      {/* Subtle Admin Top-Right Scanned Station Number Indicator */}
      {scannedQrNum && (
        <div style={{
          position: 'fixed',
          top: '6px',
          right: '10px',
          fontSize: '9.5px',
          fontWeight: 800,
          color: 'rgba(255, 255, 255, 0.45)',
          background: 'rgba(4, 27, 78, 0.55)',
          border: '1px solid rgba(53, 88, 154, 0.4)',
          borderRadius: '4px',
          padding: '2px 6px',
          letterSpacing: '0.4px',
          pointerEvents: 'none',
          zIndex: 999999,
          userSelect: 'none',
          direction: 'ltr',
          unicodeBidi: 'isolate'
        }}>
          {scannedQrNum}
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
