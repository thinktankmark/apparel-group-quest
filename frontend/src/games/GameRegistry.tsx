import React from 'react';
import { MemoryGame } from './MemoryGame';
import { XOGame } from './XOGame';
import { HorseJumpGame } from './HorseJumpGame';
import { SpeedTapGame } from './SpeedTapGame';

interface GameHostProps {
  gameKey: string;
  onSuccess: (score: number, durationSeconds: number) => void;
  onFailure: () => void;
  lang: 'ar' | 'en';
  isFinalStage?: boolean;
}

export const GameHost: React.FC<GameHostProps> = ({ gameKey, onSuccess, onFailure, lang, isFinalStage = false }) => {
  const normalizedKey = (gameKey || '').toUpperCase();

  if (normalizedKey === 'MEMORY_MATCH' || normalizedKey === 'MEMORY') {
    return <MemoryGame onSuccess={onSuccess} onFailure={onFailure} lang={lang} isFinalStage={isFinalStage} />;
  }

  if (normalizedKey === 'TIC_TAC_TOE' || normalizedKey === 'XO_GAME' || normalizedKey === 'SHOE_XO' || normalizedKey === 'XO') {
    return <XOGame onSuccess={onSuccess} onFailure={onFailure} lang={lang} isFinalStage={isFinalStage} />;
  }

  if (normalizedKey === 'HORSE_JUMP' || normalizedKey === 'POLO_JUMP' || normalizedKey === 'HORSE') {
    return <HorseJumpGame onSuccess={onSuccess} onFailure={onFailure} lang={lang} isFinalStage={isFinalStage} />;
  }

  if (normalizedKey === 'SPEED_TAP' || normalizedKey === 'SPEED_SNEAKER_TAP' || normalizedKey === 'SPEED') {
    return <SpeedTapGame onSuccess={onSuccess} onFailure={onFailure} lang={lang} isFinalStage={isFinalStage} />;
  }

  return <XOGame onSuccess={onSuccess} onFailure={onFailure} lang={lang} isFinalStage={isFinalStage} />;
};
