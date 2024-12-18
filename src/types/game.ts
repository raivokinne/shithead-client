export type CardValue = typeof VALUE_ORDER[number];

export interface Card {
  code: string;
  image: string;
  value: CardValue;
  suit: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  faceUpCards: Card[];
  faceDownCards: Card[];
  isHuman: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  playPile: Card[];
  burnPile: Card[];
  deck: string;
  remainingDeck: number;
  status: 'setup' | 'playing' | 'finished';
  phase: 'hand' | 'faceUp' | 'faceDown';
  lastAction?: string;
  extraTurn: boolean;
}

export const GAME_RULES = {
  MAX_CARDS: 52,
  CARDS_PER_PLAYER: {
    HAND: 3,
    FACE_UP: 3,
    FACE_DOWN: 3,
  },
  SPECIAL_CARDS: {
    SIX: '6',
    TEN: '10',
    JACK: 'JACK',
  },
} as const;


export const CARDS_PER_PLAYER = {
  HAND: 3,
  FACE_UP: 3,
  FACE_DOWN: 3
} as const;

export const TOTAL_CARDS_PER_PLAYER =
  CARDS_PER_PLAYER.HAND +
  CARDS_PER_PLAYER.FACE_UP +
  CARDS_PER_PLAYER.FACE_DOWN;

export const SPECIAL_CARDS = {
  SIX: '6',
  TEN: '10',
  JACK: 'JACK'
} as const;

export const VALUE_ORDER = [
  '2', '3', '4', '5', '6', '7', '8', '9', '10',
  'JACK', 'QUEEN', 'KING', 'ACE'
] as const;

export interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  playPile: Card[];
  burnPile: Card[];
  remainingDeck: number;
  lastAction?: string;
  onPlayCard: (playerIndex: number, card: Card) => void;
  onDrawCard: () => void;
  isValidPlay: (card: Card, topCard?: Card) => boolean;
  onPickUpPlayPile: () => void;
}
