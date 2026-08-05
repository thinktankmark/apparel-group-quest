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
}

export const GameHost: React.FC<GameHostProps> = ({ gameKey, onSuccess, onFailure, lang }) => {
  switch (gameKey) {
    case 'MEMORY_MATCH':
      return <MemoryGame onSuccess={onSuccess} onFailure={onFailure} lang={lang} />;
    case 'SHOE_XO':
      return <XOGame onSuccess={onSuccess} onFailure={onFailure} lang={lang} />;
    case 'HORSE_JUMP':
    case 'POLO_JUMP':
      return <HorseJumpGame onSuccess={onSuccess} onFailure={onFailure} lang={lang} />;
    case 'SPEED_TAP':
      return <SpeedTapGame onSuccess={onSuccess} onFailure={onFailure} lang={lang} />;
    default:
      return <MemoryGame onSuccess={onSuccess} onFailure={onFailure} lang={lang} />;
  }
};
