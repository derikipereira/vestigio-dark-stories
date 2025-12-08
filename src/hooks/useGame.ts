import { useContext } from 'react';
import { GameContext, GameContextType } from '@/context/GameContextType';

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
