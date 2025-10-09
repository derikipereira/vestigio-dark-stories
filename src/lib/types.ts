export type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL';

export type Genre = 'CRIME' | 'SOBRENATURAL' | 'COTIDIANO' | 'BIZARRO' | 'FUTURISTA';

export type StoryStatus = 'PENDENTE' | 'APROVADA' | 'REJEITADA';

export type GameStatus = 
  | 'WAITING_FOR_PLAYERS' 
  | 'WAITING_FOR_STORY_SELECTION' 
  | 'IN_PROGRESS' 
  | 'FINISHED';

export type AnswerType = 'SIM' | 'NAO' | 'IRRELEVANTE';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Player {
  id: number;
  username: string;
}


export interface Story {
  id: number;
  title: string;
  enigmaticSituation: string;
  fullSolution: string;
  genre: Genre;
  difficulty: Difficulty;
  creatorName: string;
}

export interface StoryResponseDTO extends Story {
  status: StoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GameSessionResponseDTO {
  id: number;
  roomCode: string;
    status: GameStatus;
    story: Story;
    master: Player;
    players: Player[];
    moves: Move[];
    createdAt: string;
}


export interface Move {
  id: number;
  question: string;
  answer: AnswerType | null;
  author: Player;
  timestamp: string;
}


export interface GameSession {
  id: number;
  roomCode: string;
  status: GameStatus;
  story: Story | null;
  storyOptions?: Story[];
  master: Player;
  players: Player[];
  moves: Move[];
  createdAt: string;
}