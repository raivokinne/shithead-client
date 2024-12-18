import { Card, VALUE_ORDER, Player, GameState } from '../types/game';

// Constants for game rules
const CARDS_PER_PLAYER = {
  HAND: 3,
  FACE_UP: 3,
  FACE_DOWN: 3
};

const SPECIAL_CARDS = {
  SIX: '6',
  TEN: '10',
  JACK: 'JACK'
};

export const initializeGame = (players: Player[], deckId: string): GameState => {
  return {
    players,
    currentPlayerIndex: 0,
    playPile: [],
    burnPile: [],
    deck: deckId,
    remainingDeck: 52 - (players.length * (CARDS_PER_PLAYER.HAND + CARDS_PER_PLAYER.FACE_UP + CARDS_PER_PLAYER.FACE_DOWN)),
    status: 'playing',
    phase: 'hand',
    lastAction: '',
    extraTurn: false
  };
};

export const isValidPlay = (
  cardToPlay: Card,
  topCard: Card | undefined,
  currentPlayer: Player,
  currentPhase: 'hand' | 'faceUp' | 'faceDown',
  playPile: Card[]
): boolean => {
  const availableCards = getCurrentPhaseCards(currentPlayer, currentPhase);
  if (!isCardInCurrentPhase(cardToPlay, availableCards)) return false;

  if (!isValidPhasePlay(currentPlayer, currentPhase)) return false;

  if (!topCard || playPile.length === 0) return true;

  if (cardToPlay.value === SPECIAL_CARDS.SIX) return true;
  if (cardToPlay.value === SPECIAL_CARDS.TEN) return true;

  if (playPile.length > 0 && playPile[playPile.length - 1].value === SPECIAL_CARDS.SIX) {
    return true;
  }

  if (isLastCardJack(cardToPlay, currentPlayer, playPile)) return true;

  if (isPartOfFourOfAKind(cardToPlay, playPile)) return true;

  return compareCardValues(cardToPlay, topCard);
};

export const applySpecialCardRules = (card: Card, playPile: Card[], burnPile: Card[]) => {
  let extraTurn = false;
  let newPlayPile = [...playPile, card];
  let newBurnPile = [...burnPile];

  if (card.value === SPECIAL_CARDS.TEN) {
    newBurnPile = [...newBurnPile, ...newPlayPile];
    newPlayPile = [];
    extraTurn = true;
  } else if (card.value === SPECIAL_CARDS.SIX) {
    newPlayPile = [card];
    extraTurn = false;
  } else if (newPlayPile.length >= 4) {
    const lastFourCards = newPlayPile.slice(-4);
    const allSameValue = lastFourCards.every(c => c.value === card.value);
    if (allSameValue) {
      newBurnPile = [...newBurnPile, ...newPlayPile];
      newPlayPile = [];
      extraTurn = true;
    }
  }

  return {
    playPile: newPlayPile,
    burnPile: newBurnPile,
    extraTurn,
  };
};

const getCurrentPhaseCards = (player: Player, phase: string): Card[] => {
  switch (phase) {
    case 'hand':
      return player.hand;
    case 'faceUp':
      return player.faceUpCards;
    case 'faceDown':
      return player.faceDownCards;
    default:
      return [];
  }
};

const isCardInCurrentPhase = (card: Card, availableCards: Card[]): boolean => {
  return availableCards.some(c => c.code === card.code);
};

const isValidPhasePlay = (player: Player, currentPhase: string): boolean => {
  if (currentPhase === 'faceUp' && player.hand.length > 0) return false;
  if (currentPhase === 'faceDown' && (player.hand.length > 0 || player.faceUpCards.length > 0)) return false;
  return true;
};

const isLastCardJack = (card: Card, player: Player, playPile: Card[]): boolean => {
  return (
    card.value === SPECIAL_CARDS.JACK &&
    player.hand.length === 1 &&
    playPile.length === 1
  );
};

const isPartOfFourOfAKind = (card: Card, playPile: Card[]): boolean => {
  if (playPile.length < 3) return false;
  const lastThreeCards = playPile.slice(-3);
  return lastThreeCards.every(c => c.value === card.value);
};

const compareCardValues = (cardToPlay: Card, topCard: Card): boolean => {
  const topCardIndex = VALUE_ORDER.indexOf(topCard.value);
  const playCardIndex = VALUE_ORDER.indexOf(cardToPlay.value);
  return playCardIndex >= topCardIndex;
};

export const forcePickUpCards = (
  currentPlayer: Player,
  playPile: Card[],
  currentPhase: 'hand' | 'faceUp' | 'faceDown'
): Player | null => {
  if (playPile.length === 0) return null;

  const topCard = playPile[playPile.length - 1];
  const availableCards = getCurrentPhaseCards(currentPlayer, currentPhase);

  const canPlayCard = availableCards.some(card =>
    card.value === SPECIAL_CARDS.SIX ||
    card.value === SPECIAL_CARDS.TEN ||

    (topCard.value === SPECIAL_CARDS.SIX) ||

    isPartOfFourOfAKind(card, playPile) ||

    compareCardValues(card, topCard)
  );

  if (canPlayCard) return null;

  const updatedPlayer = { ...currentPlayer };
  updatedPlayer.hand = [...currentPlayer.hand, ...playPile];
  return updatedPlayer;
};
