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
  const targetScore = 5; // Target score set to 10

  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [showRetryModal, setShowRetryModal] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Real-time Smooth Endless Runner Physics Engine
  const stateRef = useRef({
    horseX: 60,           // Base ground position (px)
    horseY: 0,            // Ground height offset (px)
    velocityY: 0,         // Vertical impulse
    jumpStep: 0,          // Airborne frame counter
    totalJumpSteps: 40,   // Total frames for smooth floaty jump
    isJumping: false,     // Airborne status
    obstaclePos: 190,     // 3.5s initial delay (spawns 190% offscreen right)
    score: 0,
    isGameOver: false,
    hasPassedObstacle: false
  });

  const handleJump = () => {
    const s = stateRef.current;
    if (s.isJumping || s.isGameOver || showRetryModal || showWinModal) return;

    s.isJumping = true;
    s.velocityY = 12.5; // Smooth vertical jump impulse
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
      totalJumpSteps: 40,
      isJumping: false,
      obstaclePos: 190, // Reset with 3.5s initial delay
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

  // Smooth 60FPS Physics Loop
  useEffect(() => {
    if (!hasGameStarted || isGameOver || showWinModal || showRetryModal) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.033);
      lastTime = currentTime;

      const s = stateRef.current;

      if (!s.isGameOver) {
        // 1. Smooth Vertical Jump Physics
        if (s.isJumping) {
          s.horseY += s.velocityY;
          s.velocityY -= 0.55; // Floaty, comfortable gravity
          s.jumpStep += 1;

          // Parabolic forward arc
          const timeProgress = Math.min(1.0, s.jumpStep / s.totalJumpSteps);
          s.horseX = 60 + timeProgress * 30;

          // Smooth Touchdown Landing
          if (s.horseY <= 0) {
            s.horseY = 0;
            s.velocityY = 0;
            s.isJumping = false;
            s.horseX = 60;
          }
        } else {
          s.horseX = 60; // Base ground position
        }

        // 2. Smooth Oncoming Obstacle Motion (Slower, comfortable speed)
        const obstacleSpeed = 0.52; // Slower speed so players can easily react and jump
        s.obstaclePos -= obstacleSpeed;

        const containerWidth = canvasRef.current?.clientWidth || 460;
        const obstaclePx = (s.obstaclePos / 100) * containerWidth;

        // Horse & Obstacle Bounding Boxes with forgiving hitboxes
        const horseLeft = s.horseX + 10;
        const horseRight = s.horseX + 35;
        const obstacleLeft = obstaclePx - 10;
        const obstacleRight = obstaclePx + 10;

        // 3. Fair Collision Detection
        if (obstacleRight >= horseLeft && obstacleLeft <= horseRight) {
          // If Horse Y height is less than 30px clearance -> Collision!
          if (s.horseY < 30) {
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

        // Reset Obstacle to Right Side with ample spacing (130%)
        if (s.obstaclePos <= -25) {
          s.obstaclePos = 130;
          s.hasPassedObstacle = false;
        }
      }

      // Visual DOM Updates with Horizontally Flipped Horse (facing RIGHT)
      const horseEl = document.getElementById('horse-runner-element');
      const obstacleEl = document.getElementById('obstacle-runner-element');

      if (horseEl) {
        horseEl.style.transform = `translate(${s.horseX}px, ${-s.horseY}px) scaleX(-1)`;
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
            <h3 style={{ fontSize: '12px', fontWeight: 600, direction:'ltr', color: '#FFFFFF', marginBottom: '16px' }}>
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

        {/* Horse Character Element (Flipped horizontally to face RIGHT) */}
        <div
          id="horse-runner-element"
          style={{
            position: 'absolute',
            bottom: '40px',
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
            bottom: '40px',
            left: '190%',
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
            <h3 style={{ fontSize: '14px', fontWeight: 700, direction:'ltr', color: '#FFFFFF', marginBottom: '8px' }}>
              You hit the barrier!
            </h3>
            <p style={{ fontSize: '12px', color: '#9BB1DB', marginBottom: '24px' }}>
              نقاطك الحالية: <strong style={{ color: '#FEC949' }}>{score} / {targetScore}</strong><br />
              انقر لإعادة المحاولة ومواصلة السباق.
            </p>
            <button className="btn-primary" onClick={handleRetry}>
              <span className="text-ar">إعادة المحاولة</span>
              <span className="text-en">TAP TO TRY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
