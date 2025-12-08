import React, { useState, useCallback } from 'react';
import { GameSession, GameType, GameStatus } from '@/lib/types';
import { GameContext, GameContextType } from './GameContextType';

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<GameSession | null>(null);
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGameStatus = useCallback((status: GameStatus) => {
    if (currentGame) {
      setCurrentGame({ ...currentGame, status });
    }
  }, [currentGame]);

  const resetGame = useCallback(() => {
    setCurrentGame(null);
    setGameType(null);
    setError(null);
  }, []);

  const value: GameContextType = {
    currentGame,
    setCurrentGame,
    gameType,
    setGameType,
    isLoading,
    setIsLoading,
    error,
    setError,
    updateGameStatus,
    resetGame,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
