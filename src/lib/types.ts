export type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL';

export type Genre = 'CRIME' | 'SOBRENATURAL' | 'COTIDIANO' | 'BIZARRO' | 'FUTURISTA';

export type StoryStatus = 'PENDENTE' | 'APROVADA' | 'REJEITADA';

export type GameStatus =
  | 'WAITING_FOR_PLAYERS'
  | 'WAITING_FOR_STORY_SELECTION'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export type AnswerType = 'SIM' | 'NAO' | 'IRRELEVANTE';

export interface User {
    id: number;
    name: string;
    email?: string;
}

export interface Player {
    id: number;
    name: string;
    host?: boolean;
}

export interface Story {
    id: number;
    title: string;
    description?: string;
    status?: StoryStatus;
}

export interface Move {
    id: number;
    text?: string;
    questionText?: string;
    player?: Player;
    answer?: AnswerType;
}

export interface GameSession {
    id: number;
    code: string;
    status: GameStatus;
    players?: Player[];
    stories?: Story[];
    moves?: Move[];
}