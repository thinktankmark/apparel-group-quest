import React, { useState, useEffect, useRef } from 'react';
import { GameVictoryScreen } from '../components/GameVictoryScreen';
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

  // Real-time Smooth Endless Runner Physics Engine
  const stateRef = useRef({
    horseX: 70,           // Fixed steady runner horizontal position (px)
    horseY: 0,            // Vertical jump height (px)
    velocityY: 0,         // Vertical impulse velocity
    isJumping: false,     // Airborne status
    obstaclePos: 180,     // Initial spawn position (180% offscreen right)
    trackOffset: 0,       // Background track parallax scroll offset (px)
    score: 0,
    isGameOver: false,
    hasPassedObstacle: false
  });

  const handleJump = () => {
    const s = stateRef.current;
    if (s.isJumping || s.isGameOver || showRetryModal || showWinModal) return;

    s.isJumping = true;
    s.velocityY = 11.5; // Smooth upward vertical jump impulse
    s.hasPassedObstacle = false;
  };

  const handleStartGame = () => {
    if (!hasGameStarted) {
      setHasGameStarted(true);
    }
  };

  const handleRetry = () => {
    stateRef.current = {
      horseX: 70,
      horseY: 0,
      velocityY: 0,
      isJumping: false,
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

  // 60FPS Endless Runner Physics & Animation Loop
  useEffect(() => {
    if (!hasGameStarted || isGameOver || showWinModal || showRetryModal) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.033);
      lastTime = currentTime;

      const s = stateRef.current;

      if (!s.isGameOver) {
        // 1. Continuous Parallax Track Scrolling
        s.trackOffset = (s.trackOffset + 6) % 60;

        // 2. Smooth Vertical Jump Physics (No horizontal X shifting - lands at same steady runner position)
        if (s.isJumping) {
          s.horseY += s.velocityY;
          s.velocityY -= 0.52; // Comfortable floaty gravity

          // Smooth Touchdown Landing back on track
          if (s.horseY <= 0) {
            s.horseY = 0;
            s.velocityY = 0;
            s.isJumping = false;
          }
        }

        // 3. Oncoming Hurdle Motion
        const obstacleSpeed = 0.55;
        s.obstaclePos -= obstacleSpeed;

        const containerWidth = canvasRef.current?.clientWidth || 460;
        const obstaclePx = (s.obstaclePos / 100) * containerWidth;

        // Horse Bounding Box at fixed steady X position (70px)
        const horseLeft = s.horseX + 8;
        const horseRight = s.horseX + 38;
        const obstacleLeft = obstaclePx - 10;
        const obstacleRight = obstaclePx + 10;

        // 4. Collision Detection (32px vertical clearance required)
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

      // Visual DOM Updates (Galloping Bobbing + Smooth Rotation + Track Motion)
      const horseEl = document.getElementById('horse-runner-element');
      const obstacleEl = document.getElementById('obstacle-runner-element');
      const trackEl = document.getElementById('runner-track-element');

      if (horseEl) {
        let gallopBob = 0;
        let tiltDeg = 0;

        if (s.isJumping) {
          // Tilt upward during jump ascent, level out during descent
          tiltDeg = s.velocityY > 0 ? -10 : 4;
        } else {
          // Galloping stride bobbing & tilt rhythm
          gallopBob = Math.sin(currentTime / 70) * 3;
          tiltDeg = Math.sin(currentTime / 90) * 4;
        }

        horseEl.style.transform = `translate(${s.horseX}px, ${-(s.horseY + gallopBob)}px) scaleX(-1) rotate(${tiltDeg}deg)`;
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

  if (showWinModal) {
    return (
      <GameVictoryScreen
        gameTitleAr="سباق قفز البولو"
        gameTitleEn="Beverly Hills Polo Club — Jump Challenge"
        scoreTextAr={`${score}/ ${targetScore} قفزات`}
        scoreTextEn={`${score}/ ${targetScore} Obstacles Cleared`}
        subtitleAr="قفزات رائعة ومتقنة! أكملت التحدي بنجاح."
        subtitleEn="Flawless jumps! You cleared all polo hurdles."
        centerEmoji="🏇 🏆 ✨"
        isFinalStage={false}
        onContinue={() => onSuccess(score, 45)}
      />
    );
  }

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

        {/* Horse Character Element (Flipped horizontally to face RIGHT + Gallop Stride + Jump Arc) */}
        <div
          id="horse-runner-element"
          style={{
            position: 'absolute',
            bottom: '44px',
            left: '0px',
            fontSize: '44px',
            lineHeight: 1,
            zIndex: 10,
            transition: 'none'
          }}
        >
          🏇
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
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>💥 🏇</span>
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
    </div>
  );
};
