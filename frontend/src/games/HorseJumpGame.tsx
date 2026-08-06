import React, { useState, useEffect, useRef } from 'react';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
}

export const HorseJumpGame: React.FC<GameProps> = ({ onSuccess }) => {
  const [score, setScore] = useState<number>(0);
  const targetScore = 10; // Target score set to 10

  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [showRetryModal, setShowRetryModal] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Real-time Endless Runner Physics Engine
  const stateRef = useRef({
    horseX: 60,           // Base ground position (px)
    horseY: 0,            // Ground height offset (px)
    velocityY: 0,         // Vertical impulse
    jumpStep: 0,          // Airborne frame counter
    totalJumpSteps: 34,   // Total frames for smooth jump
    isJumping: false,     // Airborne status
    obstaclePos: 170,     // 2-second initial delay (spawns 170% offscreen right)
    score: 0,
    isGameOver: false,
    hasPassedObstacle: false
  });

  const handleJump = () => {
    const s = stateRef.current;
    if (s.isJumping || s.isGameOver || showRetryModal || showWinModal) return;

    s.isJumping = true;
    s.velocityY = 13.0; // Vertical impulse
    s.jumpStep = 0;
    s.hasPassedObstacle = false;
  };

  const handleStartGame = () => {
    if (!hasGameStarted) {
      setHasGameStarted(true);
    }
  };

  const handleRetry = () => {
    stateRef.current = {
      horseX: 60,
      horseY: 0,
      velocityY: 0,
      jumpStep: 0,
      totalJumpSteps: 34,
      isJumping: false,
      obstaclePos: 170, // Reset to 2-second initial delay
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

  // 60FPS Physics Loop
  useEffect(() => {
    if (!hasGameStarted || isGameOver || showWinModal || showRetryModal) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.033);
      lastTime = currentTime;

      const s = stateRef.current;

      if (!s.isGameOver) {
        // 1. Vertical Jump Physics
        if (s.isJumping) {
          s.horseY += s.velocityY;
          s.velocityY -= 0.68; // Gravity acceleration
          s.jumpStep += 1;

          // Smooth Parabolic Arc
          const timeProgress = Math.min(1.0, s.jumpStep / s.totalJumpSteps);
          s.horseX = 60 + timeProgress * 50; // Smooth forward arc

          // Touchdown Landing
          if (s.horseY <= 0) {
            s.horseY = 0;
            s.velocityY = 0;
            s.isJumping = false;
            s.horseX = 60; // Landed smoothly back on ground
          }
        } else {
          s.horseX = 60; // Base ground position
        }

        // 2. Update Oncoming Obstacle Motion
        const obstacleSpeed = 1.25;
        s.obstaclePos -= obstacleSpeed;

        const containerWidth = canvasRef.current?.clientWidth || 460;
        const obstaclePx = (s.obstaclePos / 100) * containerWidth;

        // Horse & Obstacle Bounding Boxes
        const horseLeft = s.horseX;
        const horseRight = s.horseX + 45;
        const obstacleLeft = obstaclePx - 15;
        const obstacleRight = obstaclePx + 15;

        // 3. Collision Detection
        if (obstacleRight >= horseLeft && obstacleLeft <= horseRight) {
          // If Horse Y height is less than barrier clearance height (46px) -> Collision!
          if (s.horseY < 46) {
            s.isGameOver = true;
            setIsGameOver(true);
            setShowRetryModal(true);
          }
        }

        // 4. Score Increment on Clean Clearance
        if (s.obstaclePos < 5 && !s.hasPassedObstacle && !s.isGameOver) {
          s.hasPassedObstacle = true;
          s.score += 1;
          setScore(s.score);

          if (s.score >= targetScore) {
            s.isGameOver = true;
            setIsGameOver(true);
            setShowWinModal(true);
          }
        }

        // Reset Obstacle to Right Side with Spacing (-35%)
        if (s.obstaclePos <= -35) {
          s.obstaclePos = 100;
          s.hasPassedObstacle = false;
        }
      }

      // Visual DOM Updates
      const horseEl = document.getElementById('horse-runner-element');
      const obstacleEl = document.getElementById('obstacle-runner-element');

      if (horseEl) {
        horseEl.style.transform = `translate(${s.horseX}px, ${-s.horseY}px)`;
      }
      if (obstacleEl) {
        obstacleEl.style.left = `${s.obstaclePos}%`;
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
      className="app-container"
      onClick={() => {
        if (!hasGameStarted) {
          handleStartGame();
        } else {
          handleJump();
        }
      }}
      style={{
        width: '100%',
        paddingBottom: '40px',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
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
        borderRadius: '16px',
        padding: '12px 20px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'start' }}>
          <span style={{ fontSize: '11px', color: '#9BB1DB' }}>النقاط / Score</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#FEC949' }}>
            {score} / {targetScore}
          </span>
        </div>

        <div style={{
          background: 'rgba(254, 201, 73, 0.18)',
          border: '1px solid #FEC949',
          borderRadius: '20px',
          padding: '6px 14px',
          color: '#FEC949',
          fontSize: '12px',
          fontWeight: 700
        }}>
          {hasGameStarted ? 'انقر للقفز! 🏇 Tap to Jump!' : 'جاهز؟ 🏇 Ready?'}
        </div>
      </div>

      {/* 2D Canvas Runner Container */}
      <div
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '240px',
          background: 'linear-gradient(180deg, #091D4A 0%, #152B5B 70%, #213F7C 100%)',
          border: '2px solid #FEC949',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          cursor: 'pointer'
        }}
      >
        {/* Tap to Start Overlay */}
        {!hasGameStarted && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleStartGame();
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(3, 37, 126, 0.88)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '20px',
              padding: '20px'
            }}
          >
            <div style={{ fontSize: '54px', marginBottom: '12px' }}>🐎 🏁</div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FEC949', marginBottom: '6px', textAlign: 'center' }}>
              انقر في أي مكان لبدء اللعبة!
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px', textAlign: 'center' }}>
              Tap anywhere to start the game!
            </h3>
            <button className="btn-primary" style={{ maxWidth: '260px', pointerEvents: 'none' }}>
              <span className="text-ar">ابدأ اللعبة الآن</span>
              <span className="text-en">START GAME</span>
            </button>
          </div>
        )}

        {/* Dynamic Track Background */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: '#1A3673',
          borderTop: '3px solid #FEC949'
        }}>
          {/* Dashed Moving Track Lines */}
          <div style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'repeating-linear-gradient(90deg, #FEC949 0, #FEC949 15px, transparent 15px, transparent 30px)',
            backgroundSize: '30px 4px',
            backgroundPosition: '0 18px',
            backgroundRepeat: 'repeat-x',
            opacity: 0.6
          }} />
        </div>

        {/* Horse Character Element */}
        <div
          id="horse-runner-element"
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '0px',
            fontSize: '44px',
            lineHeight: 1,
            zIndex: 10,
            transition: 'none',
            transform: 'translate(60px, 0px)',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
          }}
        >
          🐎
        </div>

        {/* Obstacle Barrier Element */}
        <div
          id="obstacle-runner-element"
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '170%',
            fontSize: '36px',
            lineHeight: 1,
            zIndex: 9,
            transition: 'none',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
          }}
        >
          🚧
        </div>
      </div>

      {/* Tap Instruction Button */}
      <div style={{ width: '100%', maxWidth: '460px', marginTop: '20px' }}>
        <button
          className="btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            if (!hasGameStarted) handleStartGame();
            else handleJump();
          }}
        >
          <span className="text-ar">{hasGameStarted ? '⚡ انقر للقفز فوق الحواجز! ⚡' : '🚀 انقر هنا لبدء اللعبة 🚀'}</span>
          <span className="text-en">{hasGameStarted ? 'TAP TO JUMP OVER BARRIERS!' : 'TAP HERE TO START GAME'}</span>
        </button>
      </div>

      {/* Defeat Modal */}
      {showRetryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>💥 🐎</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FF5252', marginBottom: '4px' }}>
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

      {/* Victory Modal */}
      {showWinModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>🎉 🏆</span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#8CE63D', marginBottom: '4px' }}>
              تهانينا! أكملت سباق قفز البولو بنجاح!
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
              CONGRATULATIONS! YOU COMPLETED THE CHALLENGE!
            </h3>
            <p style={{ fontSize: '12px', color: '#9BB1DB', marginBottom: '24px' }}>
              حققت {targetScore} قفزات ناجحة! فتحت الدليل التالي لرحلة الكنز.
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
