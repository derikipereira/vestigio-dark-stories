import { createContext } from 'react';
import { GameSession, GameType, GameStatus } from '@/lib/types';

export interface GameContextType {
  currentGame: GameSession | null;
  setCurrentGame: (game: GameSession | null) => void;
  gameType: GameType | null;
  setGameType: (type: GameType) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  updateGameStatus: (status: GameStatus) => void;
  resetGame: () => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);
