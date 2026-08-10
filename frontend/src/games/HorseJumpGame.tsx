import React, { useState, useEffect, useRef } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';
import { GameVictoryScreen } from '../components/GameVictoryScreen';

interface GameProps {
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang?: string;
  isFinalStage?: boolean;
}

export const HorseJumpGame: React.FC<GameProps> = ({ onSuccess, isFinalStage = false }) => {
  const [score, setScore] = useState<number>(0);
  const targetScore = 5;

  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [showRetryModal, setShowRetryModal] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const horseRef = useRef<HTMLDivElement>(null);
  const hurdleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
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
    if (!hasGameStarted) {
      setHasGameStarted(true);
      return;
    }
    if (s.isJumping || s.isGameOver || showWinModal) return;

    s.isJumping = true;
    s.velocityY = 15.5; // Upward jump force
    s.jumpStartX = s.horseX;
    s.jumpTargetX = Math.min(s.horseX + 40, 240); // Forward distance
    s.jumpFrame = 0;
  };

  const handleRetry = () => {
    const s = stateRef.current;
    s.horseX = 45;
    s.horseY = 0;
    s.velocityY = 0;
    s.isJumping = false;
    s.obstaclePos = 180;
    s.trackOffset = 0;
    s.score = 0;
    s.isGameOver = false;
    s.hasPassedObstacle = false;

    setScore(0);
    setShowRetryModal(false);
    setShowWinModal(false);
    setHasGameStarted(true);

    // Sync initial positions directly to DOM
    if (horseRef.current) {
      horseRef.current.style.bottom = '42px';
      horseRef.current.style.left = '45px';
    }
    if (hurdleRef.current) {
      hurdleRef.current.style.left = '180%';
    }
  };

  useEffect(() => {
    if (!hasGameStarted || showWinModal || showRetryModal) return;

    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const s = stateRef.current;
      if (s.isGameOver) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.033);
      lastTime = currentTime;

      // 1. Runner Forward & Jump Physics
      if (s.isJumping) {
        s.jumpFrame++;
        s.horseY += s.velocityY;
        s.velocityY -= 0.85; // Gravity acceleration

        // Parabolic forward landing interpolation
        const progress = Math.min(s.jumpFrame / s.totalJumpFrames, 1);
        s.horseX = s.jumpStartX + (s.jumpTargetX - s.jumpStartX) * Math.sin(progress * (Math.PI / 2));

        if (s.horseY <= 0) {
          s.horseY = 0;
          s.velocityY = 0;
          s.isJumping = false;
        }
      } else {
        // Natural runner ground retraction
        if (s.horseX > 45) {
          s.horseX = Math.max(45, s.horseX - 0.7);
        }
      }

      // 2. Parallax Track & Obstacle Movement
      const trackSpeed = 220; // px/sec
      s.trackOffset += trackSpeed * dt;
      s.obstaclePos -= (trackSpeed / 4.6) * dt; // Move hurdle left (% speed)

      // Direct 60FPS DOM Style Updates for Ultra Smooth Animation
      if (horseRef.current) {
        horseRef.current.style.bottom = `${42 + s.horseY}px`;
        horseRef.current.style.left = `${s.horseX}px`;
      }
      if (hurdleRef.current) {
        hurdleRef.current.style.left = `${s.obstaclePos}%`;
      }
      if (gridRef.current) {
        gridRef.current.style.left = `-${s.trackOffset % 60}px`;
      }
      if (floorRef.current) {
        floorRef.current.style.left = `-${s.trackOffset % 40}px`;
      }

      // 3. Collision Detection (AABB Bounding Box)
      const canvasWidth = canvasRef.current ? canvasRef.current.clientWidth : 400;
      const hurdlePxLeft = (s.obstaclePos / 100) * canvasWidth;
      const hurdleWidthPx = 42;

      const runnerLeft = s.horseX + 12;
      const runnerRight = s.horseX + 63;
      const hurdleLeft = hurdlePxLeft;
      const hurdleRight = hurdlePxLeft + hurdleWidthPx;

      const isHorizontalOverlap = runnerRight > hurdleLeft && runnerLeft < hurdleRight;
      const isLowHeight = s.horseY < 36; // Collision threshold height

      if (isHorizontalOverlap && isLowHeight) {
        s.isGameOver = true;
        setShowRetryModal(true);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        return;
      }

      // 4. Score Point Assignment
      if (hurdleRight < runnerLeft && !s.hasPassedObstacle) {
        s.hasPassedObstacle = true;
        s.score += 1;
        const newScore = s.score;
        setScore(newScore);

        if (newScore >= targetScore) {
          setShowWinModal(true);
          if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
          return;
        }
      }

      // 5. Respawn Hurdle Offscreen Right
      if (s.obstaclePos < -15) {
        s.obstaclePos = 135 + Math.random() * 45;
        s.hasPassedObstacle = false;
      }

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [hasGameStarted, showWinModal, showRetryModal]);

  // If this is the player's final stage and they won -> Render GameVictoryScreen
  if (showWinModal && isFinalStage) {
    return (
      <GameVictoryScreen
        gameTitleAr="تحدي قفز البولو"
        gameTitleEn="BHPC Polo Jump Challenge"
        scoreTextAr={`${score} / ${targetScore} الحواجز المقفوزة`}
        scoreTextEn={`${score} / ${targetScore} Hurdles Cleared`}
        subtitleAr="أداء أسطوري ورائع! أكملت التحدي الأخير لرحلة الكنز."
        subtitleEn="Legendary performance! You completed the final challenge of the quest."
        centerEmoji="🏇 🏆 ✨"
        isFinalStage={true}
        onContinue={() => onSuccess(score, 45)}
      />
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '70px' }}>
      {/* Header Logo */}
      <HeaderLogo sequenceOrder={3} />

      <div style={{ width: '100%', textAlign: 'center', marginBottom: '12px' }}>
        <h2 className="title-ar">تحدي قفز فرسان البولو</h2>
        <p className="subtitle-en">Polo Rider Jump Challenge</p>
        <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginTop: '4px' }}>
          انقر للقفز وتفادي الحواجز الخشبية على المضمار! / <span style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>Tap to jump over wooden hurdles!</span>
        </p>
      </div>

      {/* Score Counter & Instructions */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#152B5B',
        border: '1.5px solid #FEC949',
        borderRadius: '12px',
        padding: '10px 16px',
        textAlign: 'center',
        marginBottom: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#FEC949' }}>
          🏇 SCORE: {score} / {targetScore}
        </span>
        <span style={{ fontSize: '11px', color: '#8CE63D', fontWeight: 700 }}>
          {!hasGameStarted ? '👆 TAP GAME TO START' : '⚡ RUNNING...'}
        </span>
      </div>

      {/* Runner Game Canvas */}
      <div
        ref={canvasRef}
        onClick={handleJump}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '270px',
          background: 'linear-gradient(180deg, #0A193B 0%, #152B5B 65%, #1A3673 100%)',
          border: '2.5px solid #FEC949',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: '20px'
        }}
      >
        {/* Parallax Background Grid */}
        <div
          ref={gridRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '560px',
            height: '100%',
            backgroundImage: 'linear-gradient(90deg, rgba(53, 88, 154, 0.15) 1px, transparent 1px)',
            backgroundSize: '30px 100%'
          }}
        />

        {/* Start Tap Overlay */}
        {!hasGameStarted && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9, 28, 71, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 30,
            backdropFilter: 'blur(3px)'
          }}>
            <img src="/assets/polo-rider.png" alt="BHPC Polo Rider" style={{ width: '90px', height: 'auto', marginBottom: '12px' }} />
            <div style={{
              background: '#FEC949',
              color: '#091C47',
              padding: '10px 24px',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 800,
              boxShadow: '0 4px 15px rgba(254, 201, 73, 0.4)'
            }}>
              👆 TAP ANYWHERE TO START JUMPING
            </div>
          </div>
        )}

        {/* Track Grass Floor */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '42px',
          background: 'linear-gradient(180deg, #1E4620 0%, #112812 100%)',
          borderTop: '3px solid #8CE63D'
        }}>
          <div
            ref={floorRef}
            style={{
              position: 'absolute',
              top: '6px',
              left: 0,
              width: '560px',
              height: '4px',
              backgroundImage: 'linear-gradient(90deg, #8CE63D 50%, transparent 50%)',
              backgroundSize: '40px 4px'
            }}
          />
        </div>

        {/* Official White BHPC Polo Rider Silhouette Character */}
        <div
          ref={horseRef}
          style={{
            position: 'absolute',
            bottom: '42px',
            left: '45px',
            width: '75px',
            height: '75px',
            zIndex: 20
          }}
        >
          <img
            src="/assets/polo-rider.png"
            alt="BHPC Polo Rider Silhouette"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            }}
          />
        </div>

        {/* Hurdle Obstacle */}
        <div
          ref={hurdleRef}
          style={{
            position: 'absolute',
            bottom: '42px',
            left: '180%',
            width: '42px',
            height: '46px',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          <div style={{
            width: '100%',
            height: '12px',
            background: '#8B4513',
            border: '1.5px solid #FEC949',
            borderRadius: '3px',
            marginBottom: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.4)'
          }} />
          <div style={{
            width: '100%',
            height: '12px',
            background: '#A0522D',
            border: '1.5px solid #FEC949',
            borderRadius: '3px',
            marginBottom: '4px'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '85%' }}>
            <div style={{ width: '7px', height: '18px', background: '#5C2E0B', borderRadius: '2px' }} />
            <div style={{ width: '7px', height: '18px', background: '#5C2E0B', borderRadius: '2px' }} />
          </div>
        </div>
      </div>

      {/* Defeat / Retry Modal */}
      {showRetryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span style={{ fontSize: '48px', marginBottom: '12px' }}>💥 🏇</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FF5252', marginBottom: '4px' }}>
              اصطدمت بالحاجز!
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, direction: 'ltr', unicodeBidi: 'isolate', color: '#FFFFFF', marginBottom: '8px' }}>
              HURDLE STUMBLED!
            </h3>
            <p style={{ fontSize: '11.5px', color: '#9BB1DB', marginBottom: '20px', lineHeight: 1.4 }}>
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

      {/* Win Modal Popup Card (Intermediate Stages 1-3) */}
      {showWinModal && !isFinalStage && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ fontSize: '48px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/polo-rider.png" alt="BHPC Polo Rider" style={{ width: '58px', height: 'auto', display: 'block' }} /> 🏆
            </div>
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
