import React, { useState, useEffect, useRef } from 'react';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
}

export const HorseJumpGame: React.FC<GameProps> = ({ onSuccess }) => {
  const [score, setScore] = useState<number>(0);
  const targetScore = 15; // Target score set to 15

  const [showRetryModal, setShowRetryModal] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Canvas Dimensions & Physics Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Real-time Physics State (60 FPS Endless Runner)
  const stateRef = useRef({
    horseX: 60,           // Base ground position (px)
    horseY: 0,            // Ground height offset (px)
    velocityY: 0,         // Vertical impulse
    isJumping: false,     // Airborne status
    obstaclePos: 100,     // Obstacle X percentage (100% to -10%)
    score: 0,             // Current jump score
    isGameOver: false,
    hasPassedObstacle: false
  });

  const handleJump = () => {
    const s = stateRef.current;
    if (s.isJumping || s.isGameOver || showRetryModal || showWinModal) return;

    s.isJumping = true;
    s.velocityY = 13.5; // High jump impulse
    s.hasPassedObstacle = false;
  };

  const handleRetry = () => {
    stateRef.current = {
      horseX: 60,
      horseY: 0,
      velocityY: 0,
      isJumping: false,
      obstaclePos: 100,
      score: 0,
      isGameOver: false,
      hasPassedObstacle: false
    };
    setScore(0);
    setShowRetryModal(false);
    setShowWinModal(false);
    setIsGameOver(false);
  };

  // 60FPS Endless Runner Physics Loop
  useEffect(() => {
    if (isGameOver || showWinModal || showRetryModal) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.033);
      lastTime = currentTime;

      const s = stateRef.current;

      if (!s.isGameOver) {
        // 1. Update Horse Vertical Jump Physics & Forward Arc Trajectory
        if (s.isJumping) {
          s.horseY += s.velocityY;
          s.velocityY -= 0.65; // Gravity acceleration

          // Calculate Forward Displacement Arc (Horse moves forward X while airborne up to +110px)
          const jumpProgress = Math.max(0, s.horseY / 130);
          s.horseX = 60 + jumpProgress * 105;

          // Touchdown Landing
          if (s.horseY <= 0) {
            s.horseY = 0;
            s.velocityY = 0;
            s.horseX = 60; // Landed smoothly back on ground track
            s.isJumping = false;
          }
        }

        // 2. Update Oncoming Obstacle Motion
        const obstacleSpeed = 1.35; // Constant smooth endless runner speed
        s.obstaclePos -= obstacleSpeed;

        // Canvas width pixel mapping
        const containerWidth = canvasRef.current?.clientWidth || 460;
        const obstaclePx = (s.obstaclePos / 100) * containerWidth;

        // Horse Collision Box: [horseX, horseX + 50]
        const horseLeft = s.horseX;
        const horseRight = s.horseX + 50;

        // Obstacle Collision Box: [obstaclePx - 15, obstaclePx + 15]
        const obstacleLeft = obstaclePx - 15;
        const obstacleRight = obstaclePx + 15;

        // Real-time Trajectory Overlap Check
        if (obstacleRight >= horseLeft && obstacleLeft <= horseRight) {
          // If Horse Y (airborne height) is less than barrier clearance height (52px) -> Collision!
          if (s.horseY < 52) {
            s.isGameOver = true;
            setIsGameOver(true);
            setShowRetryModal(true);
          }
        }

        // 3. Score Increment on Clean Obstacle Clearance
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

        // Reset Obstacle to Right Side for Next Barrier
        if (s.obstaclePos <= -10) {
          s.obstaclePos = 100;
          s.hasPassedObstacle = false;
        }
      }

      // Force React render for visual sync
      if (canvasRef.current && !s.isGameOver) {
        const horseEl = canvasRef.current.querySelector('.horse-runner') as HTMLElement;
        const obstacleEl = canvasRef.current.querySelector('.obstacle-runner') as HTMLElement;
        const shadowEl = canvasRef.current.querySelector('.horse-shadow') as HTMLElement;

        if (horseEl) {
          horseEl.style.bottom = `${35 + s.horseY}px`;
          horseEl.style.left = `${s.horseX}px`;
        }
        if (shadowEl) {
          shadowEl.style.left = `${s.horseX + 8}px`;
          shadowEl.style.opacity = `${Math.max(0.1, 1 - s.horseY / 120)}`;
        }
        if (obstacleEl) {
          obstacleEl.style.left = `${s.obstaclePos}%`;
        }
      }

      if (!s.isGameOver) {
        animationFrameId.current = requestAnimationFrame(loop);
      }
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isGameOver, showWinModal, showRetryModal]);

  return (
    <div className="app-container" style={{ width: '100%', paddingBottom: '80px' }}>
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">تحدي قفز البولو</h2>
        <p className="subtitle-en">Polo Jump Challenge</p>
      </div>

      {/* Score & Target HUD */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(21, 43, 91, 0.9)',
        border: '1.5px solid #35589A',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#FEC949' }}>
          Score: {score} / {targetScore}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#8CE63D' }}>
          الهدف: 15 قفزة / Target: 15 Jumps
        </span>
      </div>

      {/* Endless Runner Interactive Jump Track */}
      <div
        ref={canvasRef}
        onClick={handleJump}
        style={{
          width: '100%',
          maxWidth: '500px',
          height: '270px',
          background: 'linear-gradient(180deg, #0B193C 0%, #041B4E 60%, #152B5B 100%)',
          border: '1.5px solid #35589A',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          marginBottom: '20px',
          userSelect: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}
      >
        {/* Animated Ground Runner Track */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '35px',
          background: '#04153B',
          borderTop: '2px solid #35589A',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100%',
            height: '2px',
            background: 'repeating-linear-gradient(90deg, #FEC949, #FEC949 20px, transparent 20px, transparent 40px)',
            animation: 'dashMove 0.8s linear infinite'
          }} />
        </div>

        {/* Dynamic Landing Shadow */}
        <div
          className="horse-shadow"
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '68px',
            width: '40px',
            height: '8px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            transition: 'left 0.016s linear, opacity 0.016s linear'
          }}
        />

        {/* Horse Endless Runner Sprite (Facing Right with Parabolic Arc & Trajectory Displacement) */}
        <div
          className="horse-runner"
          style={{
            position: 'absolute',
            bottom: '35px',
            left: '60px',
            fontSize: '52px',
            transform: 'scaleX(-1)',
            transition: 'left 0.016s linear, bottom 0.016s linear',
            zIndex: 2,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'
          }}
        >
          🏇
        </div>

        {/* Oncoming Moving Barrier */}
        <div
          className="obstacle-runner"
          style={{
            position: 'absolute',
            bottom: '35px',
            left: '100%',
            fontSize: '34px',
            transform: 'translateX(-50%)',
            zIndex: 1,
            transition: 'left 0.016s linear'
          }}
        >
          🚧
        </div>

        {/* Tap Prompt Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          width: '100%',
          textAlign: 'center',
          fontSize: '12px',
          color: '#FEC949',
          fontWeight: 700,
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
          zIndex: 3
        }}>
          انقر للقفز فوق العقبة! 👆 / Tap screen to jump over barrier!
        </div>
      </div>

      {/* Collision Retry Modal */}
      {showRetryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>💥 🏇</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FF5252', marginBottom: '4px' }}>
              اصطدمت بالعقبة!
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
              You touched the obstacle!
            </h3>
            <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginBottom: '24px' }}>
              اضغط لإعادة المحاولة للوصول إلى 15 قفزة.<br />Tap retry to reach 15 jumps.
            </p>
            <button className="btn-primary" onClick={handleRetry}>
              <span className="text-ar">إعادة المحاولة</span>
              <span className="text-en">RETRY GAME</span>
            </button>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {showWinModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>⭐ 🏆</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#8CE63D', marginBottom: '4px' }}>
              تهانينا! حققت 15 قفزة بنجاح!
            </h2>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
              CONGRATULATIONS! 15 JUMPS REACHED!
            </h3>
            <p style={{ fontSize: '11px', color: '#9BB1DB', marginBottom: '24px' }}>
              أداء استثنائي! لقد فتحت الدليل التالي لرحلة الكنز.<br />Great job! You unlocked the next clue.
            </p>
            <button className="btn-primary" onClick={() => onSuccess(score, 25)}>
              <span className="text-ar">احصل على دليلك التالي</span>
              <span className="text-en">GET YOUR NEXT CLUE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
