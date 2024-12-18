export interface Participant {
  id: number;
  name: string;
  is_ready: boolean;
}

export interface ActivityData {
  achievements: number;
  points: number;
  gamesPlayed: number;
  hoursPlayed: number;
}

export interface Notification {
  id: string;
  type: string;
  data: {
    lobby_id?: string;
    lobby_name?: string;
    message: string;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
}

export type LobbyStatus = "waiting" | "in_progress" | "finished";

export type GameMode = "standard" | "custom" | "tournament";

export type GameSettings = {
  [key: string]: unknown;
};

export type Game = {
  id: number;
  lobby_id: number;
  status: string;
  current_turn_player_id: number;
  round_number: number;
  winner: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
};

export interface Lobby {
  id: number;
  name: string;
  max_players: number;
  current_players: number;
  current_player: User;
  status: LobbyStatus;
  participants: Participant[];
  privacy_level: string;
  spectator_allowed: boolean;
  spectator_count: number;
  game_mode: string;
  game_settings: unknown | null;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    name: string;
  };
  invitations: Invitation[];
}

export interface Invitation {
  id: number;
  lobby_id: number;
  game_mode: number;
  inviter_id: number;
  invited_user_id: number;
  status: string;
  invitation_token: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export type CardSuit = "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES";
export type CardValue =
  | "ACE"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "JACK"
  | "QUEEN"
  | "KING";
export type CardStatus = "in_deck" | "in_hand" | "played" | "discarded";
export type LocationType =
  | "deck"
  | "player_hand"
  | "played_pile"
  | "discard_pile";
export type DeckType = "standard" | "custom" | "special";

export interface Card {
  id: number;
  deck_id: number;
  game_id: number;
  code: string;
  value: CardValue;
  suit: CardSuit;
  image_url: string;
  status: CardStatus;
  location_type: LocationType;
  player_id: number | null;
  is_special_card: boolean;
  special_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeckConfiguration {
  shuffled: boolean;
  deck_count: number;
  special_rules?: Record<string, unknown>;
}

export interface Deck {
  id: number;
  game_id: number;
  deck_type: DeckType;
  total_cards: number;
  remaining_cards: number;
  external_deck_id: string;
  deck_configuration: DeckConfiguration;
  created_at: string;
  updated_at: string;
}

export interface GamePlayer {
  id: number;
  user_id: number;
  game_id: number;
  turn_order: number;
  cards_in_hand: number;
  score: number;
  status: "active" | "inactive" | "winner" | "loser";
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

export interface GameState {
  id: number;
  lobby_id: number;
  status: "waiting" | "initialized" | "in_progress" | "finished";
  current_turn_player_id: number;
  round_number: number;
  winner: number | null;
  created_at: string;
  updated_at: string;
  deck: Deck;
  players: GamePlayer[];
  played_cards: Card[];
}
