import React, { useState, useEffect, useRef } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
}

export const HorseJumpGame: React.FC<GameProps> = ({ onSuccess }) => {
  const [score, setScore] = useState<number>(0);
  const targetScore = 5;

  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [showRetryModal, setShowRetryModal] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Real-time Forward-Landing Runner Physics Engine
  const stateRef = useRef({
    horseX: 45,           // Current runner horizontal position (px)
    horseY: 0,            // Vertical jump height (px)
    velocityY: 0,         // Vertical impulse velocity
    isJumping: false,     // Airborne status
    jumpStartX: 45,       // X position at start of jump
    jumpTargetX: 85,      // Landed X position ahead on track
    jumpFrame: 0,         // Airborne frame counter
    totalJumpFrames: 42,  // Total airborne frames
    obstaclePos: 180,     // Initial hurdle spawn position (180% offscreen right)
    trackOffset: 0,       // Background track parallax scroll offset (px)
    score: 0,
    isGameOver: false,
    hasPassedObstacle: false
  });

  const handleJump = () => {
    const s = stateRef.current;
    if (s.isJumping || s.isGameOver || showRetryModal || showWinModal) return;

    s.isJumping = true;
    s.velocityY = 11.8; // Upward jump impulse
    s.jumpStartX = s.horseX;
    s.jumpTargetX = Math.min(s.horseX + 40, 160); // Target landing position ahead on track
    s.jumpFrame = 0;
    s.hasPassedObstacle = false;
  };

  const handleStartGame = () => {
    if (!hasGameStarted) {
      setHasGameStarted(true);
    }
  };

  const handleRetry = () => {
    stateRef.current = {
      horseX: 45,
      horseY: 0,
      velocityY: 0,
      isJumping: false,
      jumpStartX: 45,
      jumpTargetX: 85,
      jumpFrame: 0,
      totalJumpFrames: 42,
      obstaclePos: 180,
      trackOffset: 0,
      score: 0,
      isGameOver: false,
      hasPassedObstacle: false
    };
    setScore(0);
    setShowRetryModal(false);
    setShowWinModal(false);
    setIsGameOver(false);
    setHasGameStarted(false);
  };

  // 60FPS Runner Physics Loop
  useEffect(() => {
    if (!hasGameStarted || isGameOver || showWinModal || showRetryModal) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.033);
      lastTime = currentTime;

      const s = stateRef.current;

      if (!s.isGameOver) {
        // 1. Continuous Parallax Track Scrolling (Gentle 1.2px per frame)
        s.trackOffset = (s.trackOffset + 1.2) % 60;

        // 2. Airborne Physics with Forward Leap Arc & Landing Ahead
        if (s.isJumping) {
          s.jumpFrame += 1;
          const progress = Math.min(1.0, s.jumpFrame / s.totalJumpFrames);

          // Smoothly advance X forward during jump arc so it lands ahead
          s.horseX = s.jumpStartX + ((s.jumpTargetX - s.jumpStartX) * progress);

          s.horseY += s.velocityY;
          s.velocityY -= 0.52; // Floaty gravity

          // Touchdown Landing Ahead on Track
          if (s.horseY <= 0) {
            s.horseY = 0;
            s.velocityY = 0;
            s.isJumping = false;
            s.horseX = s.jumpTargetX; // Lands at the new forward position ahead!
          }
        } else {
          // Gentle, natural return drift toward base position so player can leap forward again
          if (s.horseX > 45) {
            s.horseX = Math.max(45, s.horseX - 0.35);
          }
        }

        // 3. Oncoming Hurdle Motion (Comfortable 0.38 speed)
        const obstacleSpeed = 0.38;
        s.obstaclePos -= obstacleSpeed;

        const containerWidth = canvasRef.current?.clientWidth || 460;
        const obstaclePx = (s.obstaclePos / 100) * containerWidth;

        // Horse Bounding Box
        const horseLeft = s.horseX + 8;
        const horseRight = s.horseX + 42;
        const obstacleLeft = obstaclePx - 10;
        const obstacleRight = obstaclePx + 10;

        // 4. Collision Detection (32px clearance required)
        if (obstacleRight >= horseLeft && obstacleLeft <= horseRight) {
          if (s.horseY < 32) {
            s.isGameOver = true;
            setIsGameOver(true);
            setShowRetryModal(true);
          }
        }

        // 5. Score Increment on Clean Clearance
        if (obstacleRight < horseLeft && !s.hasPassedObstacle && !s.isGameOver) {
          s.hasPassedObstacle = true;
          s.score += 1;
          setScore(s.score);

          if (s.score >= targetScore) {
            s.isGameOver = true;
            setIsGameOver(true);
            setShowWinModal(true);
          }
        }

        // Reset Obstacle to Right Side with ample spacing (130%)
        if (s.obstaclePos <= -20) {
          s.obstaclePos = 130;
          s.hasPassedObstacle = false;
        }
      }

      // Visual DOM Updates (Forward Landing + Gallop Stride + Track Motion)
      const horseEl = document.getElementById('horse-runner-element');
      const obstacleEl = document.getElementById('obstacle-runner-element');
      const trackEl = document.getElementById('runner-track-element');

      if (horseEl) {
        let gallopBob = 0;
        let tiltDeg = 0;

        if (s.isJumping) {
          // Dynamic tilt during forward jump arc
          tiltDeg = s.velocityY > 0 ? -10 : 3;
        } else {
          // Galloping stride bobbing & tilt rhythm
          gallopBob = Math.sin(currentTime / 70) * 3;
          tiltDeg = Math.sin(currentTime / 90) * 3;
        }

        horseEl.style.transform = `translate(${s.horseX}px, ${-(s.horseY + gallopBob)}px) rotate(${tiltDeg}deg)`;
      }

      if (obstacleEl) {
        obstacleEl.style.left = `${s.obstaclePos}%`;
      }

      if (trackEl) {
        trackEl.style.backgroundPosition = `${-s.trackOffset}px 18px`;
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [hasGameStarted, isGameOver, showWinModal, showRetryModal]);

  return (
    <div
      onClick={() => {
        if (!hasGameStarted) {
          handleStartGame();
        } else {
          handleJump();
        }
      }}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '40px',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Single Header Logo */}
      <HeaderLogo />

      {/* Title */}
      <h1 className="title-ar">سباق قفز البولو</h1>
      <h2 className="subtitle-en">Beverly Hills Polo Club — Jump Challenge</h2>

      {/* Target Score & Progress HUD */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(21, 43, 91, 0.9)',
        border: '1.5px solid #35589A',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🏆</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#FEC949' }}>
            الهدف / Target: {targetScore}
          </span>
        </div>
        <div style={{ background: '#041B4E', padding: '4px 12px', borderRadius: '12px', border: '1px solid #35589A' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#8CE63D' }}>
            النقاط: {score}
          </span>
        </div>
      </div>

      {/* Runner Canvas Container */}
      <div
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '240px',
          background: 'linear-gradient(180deg, #091C47 0%, #152B5B 70%, #1D3B7A 100%)',
          border: '2px solid #FEC949',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          marginBottom: '16px',
          cursor: 'pointer'
        }}
      >
        {/* Tap To Start Overlay */}
        {!hasGameStarted && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(1, 18, 62, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            padding: '20px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '48px', marginBottom: '12px', animation: 'bounce 1s infinite' }}>👇 🏇</span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FEC949', marginBottom: '4px' }}>
              انقر على الشاشة للبدء!
            </h2>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
              Tap anywhere to start the game!
            </h3>
            <button className="btn-primary" style={{ maxWidth: '260px', pointerEvents: 'none' }}>
              <span className="text-ar">ابدأ اللعبة الآن</span>
              <span className="text-en">START GAME</span>
            </button>
          </div>
        )}

        {/* Dynamic Endless Runner Track Background */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '44px',
          background: '#1A3673',
          borderTop: '3px solid #FEC949'
        }}>
          {/* Dashed Moving Track Lines (Parallax Scrolling) */}
          <div
            id="runner-track-element"
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: 'repeating-linear-gradient(90deg, #FEC949 0, #FEC949 20px, transparent 20px, transparent 40px)',
              backgroundSize: '40px 4px',
              backgroundPosition: '0px 18px',
              backgroundRepeat: 'repeat-x',
              opacity: 0.7
            }}
          />
        </div>

        {/* Official Beverly Hills Polo Club Rider Character Image */}
        <div
          id="horse-runner-element"
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '0px',
            zIndex: 10,
            transition: 'none'
          }}
        >
          <img
            src="/assets/polo-rider.png"
            alt="BHPC Polo Rider"
            style={{
              width: '58px',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
            }}
          />
        </div>

        {/* Oncoming Hurdle Barrier Obstacle */}
        <div
          id="obstacle-runner-element"
          style={{
            position: 'absolute',
            bottom: '44px',
            left: '180%',
            fontSize: '32px',
            lineHeight: 1,
            zIndex: 9,
            transition: 'none'
          }}
        >
          🚧
        </div>
      </div>

      {/* Jump Button CTA */}
      <button
        className="btn-primary"
        onClick={(e) => {
          e.stopPropagation();
          if (!hasGameStarted) {
            handleStartGame();
          } else {
            handleJump();
          }
        }}
      >
        <span className="text-ar">{hasGameStarted ? 'انقر للقفز! 🏇' : 'ابدأ اللعبة! 🏇'}</span>
        <span className="text-en">{hasGameStarted ? 'TAP TO JUMP!' : 'TAP TO START!'}</span>
      </button>

      {/* Retry Modal */}
      {showRetryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>💥 <img
            src="/assets/polo-rider.png"
            alt="BHPC Polo Rider"
            style={{
              width: '58px',
              height: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
            }}
          /></span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FF5252', marginBottom: '4px' }}>
              اصطدمت بالحاجز!
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              You hit the barrier!
            </h3>
            <p style={{ fontSize: '12px', color: '#9BB1DB', marginBottom: '24px' }}>
              نقاطك الحالية: <strong style={{ color: '#FEC949' }}>{score} / {targetScore}</strong><br />
              انقر لإعادة المحاولة ومواصلة السباق.
            </p>
            <button className="btn-primary" onClick={handleRetry}>
              <span className="text-ar">إعادة المحاولة</span>
              <span className="text-en">RETRY JUMP</span>
            </button>
          </div>
        </div>
      )}

      {/* Win Modal Popup Card (Matching Memory Match & XO Game Popup Modals) */}
      {showWinModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}><img
            src="/assets/polo-rider.png"
            alt="BHPC Polo Rider"
            style={{
              width: '58px',
              height: 'auto',
              display: 'block'
            }}
          /> 🏆</span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#8CE63D', marginBottom: '4px' }}>
              تهانينا! أكملت تحدي البولو!
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', direction: 'ltr', unicodeBidi: 'isolate', marginBottom: '12px' }}>
              CONGRATULATIONS! POLO CHALLENGE CLEARED!
            </h3>
            <p style={{ fontSize: '11px', color: '#9BB1DB', marginBottom: '24px' }}>
              أداء رائع! فتحت الدليل التالي لرحلة الكنز. / <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>Great job! You unlocked the next clue.</span>
            </p>
            <button className="btn-primary" onClick={() => onSuccess(score, 45)}>
              <span className="text-ar">احصل على دليلك التالي</span>
              <span className="text-en">GET YOUR NEXT CLUE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
