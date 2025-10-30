export type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL' | 'EASY' | 'MEDIUM' | 'HARD';

export type Genre =
  | 'CRIME'
  | 'SOBRENATURAL'
  | 'COTIDIANO'
  | 'BIZARRO'
  | 'FUTURISTA'
  | 'COMEDY'
  | 'DRAMA'
  | 'HORROR';

export type StoryStatus = 'PENDENTE' | 'APROVADA' | 'REJEITADA';

export type GameStatus =
  | 'WAITING_FOR_PLAYERS'
  | 'WAITING_FOR_STORY_SELECTION'
  | 'IN_PROGRESS'
  | 'COMPLETED';

export type AnswerType = 'SIM' | 'NAO' | 'IRRELEVANTE';

export interface Player {
    id: number;
    name?: string;
    username?: string;
    host?: boolean;
}

export interface Story {
    id: number;
    title: string;
    description?: string;
    enigmaticSituation?: string;
    fullSolution?: string;
    genre?: Genre | string;
    difficulty?: Difficulty | string;
    creatorName?: string;
    status?: StoryStatus;
}

export interface Move {
    id: number;
    question?: string;
    text?: string;
    questionText?: string;
    player?: Player;
    authorName?: string;
    answer?: AnswerType | null;
    createdAt?: string;
}

export interface GameSession {
    id: number;
    roomCode?: string;
    code?: string;
    status: GameStatus;
    story?: Story;
    storyOptions?: Story[];
    master?: Player;
    players?: Player[];
    moves?: Move[];
    createdAt?: string;
}