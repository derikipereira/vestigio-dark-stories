// ============================
// GAME TYPES & ENUMS
// ============================

export type GameType = 'VESTIGIO' | 'TRIVIA' | 'HANGMAN';

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

export type TriviaCategory = 'GEOGRAPHY' | 'HISTORY' | 'SCIENCE' | 'SPORTS' | 'ARTS' | 'GENERAL';

export type ActionType = 
  | 'ANSWER_QUESTION'
  | 'GUESS_LETTER'
  | 'SKIP_QUESTION'
  | 'REVEAL_HINT'
  | 'SELECT_STORY'
  | 'PLAYER_READY';

// ============================
// PLAYER
// ============================

export interface Player {
    id: number;
    name?: string;
    username?: string;
    host?: boolean;
}

// ============================
// VESTIGIO GAME
// ============================

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

// ============================
// TRIVIA GAME
// ============================

export interface TriviaQuestion {
    id: number;
    question: string;
    category?: TriviaCategory;
    difficulty?: Difficulty;
    correctAnswer: string;
    incorrectAnswers?: string[];
    options?: string[]; // All answers shuffled
    creatorName?: string;
    createdAt?: string;
}

export interface TriviaMove {
    id: number;
    playerId: number;
    playerName?: string;
    selectedAnswerIndex: number;
    selectedAnswer?: string;
    isCorrect: boolean;
    pointsEarned: number;
    createdAt?: string;
}

export interface TriviaScore {
    playerId: number;
    playerName?: string;
    totalPoints: number;
    correctAnswers: number;
    totalQuestions: number;
}

// ============================
// HANGMAN GAME
// ============================

export interface HangmanWord {
    id: number;
    word: string;
    difficulty?: Difficulty;
    category?: string;
    hint?: string;
    creatorName?: string;
    createdAt?: string;
}

export interface HangmanMove {
    id: number;
    playerId: number;
    playerName?: string;
    guessedLetter: string;
    isCorrect: boolean;
    wrongGuessCount: number;
    revealedLetters: string[]; // Current state of word e.g. "H_NG_AN"
    createdAt?: string;
}

export interface HangmanGameState {
    word?: string;
    difficulty?: Difficulty;
    hint?: string;
    revealedLetters: string[];
    guessedLetters: string[];
    wrongGuessCount: number;
    maxWrongGuesses: number;
    isGameOver: boolean;
    isGameWon: boolean;
    winner?: Player;
}

// ============================
// GAME SESSION
// ============================

export interface GameContent {
    // VESTIGIO
    story?: Story;
    storyOptions?: Story[];
    
    // TRIVIA
    questions?: TriviaQuestion[];
    currentQuestionIndex?: number;
    scores?: TriviaScore[];
    
    // HANGMAN
    hangmanState?: HangmanGameState;
    words?: HangmanWord[];
}

export interface GameSession {
    id: number;
    roomCode?: string;
    code?: string;
    gameType: GameType;
    status: GameStatus;
    content?: GameContent;
    story?: Story; // Legacy VESTIGIO support
    storyOptions?: Story[];
    master?: Player;
    players?: Player[];
    moves?: Move[] | TriviaMove[] | HangmanMove[];
    contentOptions?: any[];
    winner?: Player;
    createdAt?: string;
}

// ============================
// CONFIG PARAMS
// ============================

export interface GameConfigParams {
    // VESTIGIO - obrigatório
    storyId?: number;
    
    // TRIVIA
    questionCount?: number;
    category?: TriviaCategory;
    
    // Comum
    difficulty?: Difficulty;
    
    // Extensível
    [key: string]: any;
}

// ============================
// WEBSOCKET & ACTIONS
// ============================

export interface GameAction {
    actionType: ActionType;
    payload: any;
}

export interface WebSocketMessage {
    type: 'GAME_UPDATE' | 'MOVE' | 'PLAYER_JOINED' | 'GAME_STARTED' | 'GAME_FINISHED' | 'ERROR';
    data: any;
}