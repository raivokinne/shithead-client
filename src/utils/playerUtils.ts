import { Player, Card } from '../types/game';

export const createPlayers = (shuffledDeck: Card[], botCount: number): Player[] => {
  return [
    createHumanPlayer(shuffledDeck.slice(0, 9)),
    ...createBotPlayers(shuffledDeck.slice(9), botCount),
  ];
};

const createHumanPlayer = (cards: Card[]): Player => ({
  id: 'human',
  name: 'You',
  hand: cards.slice(0, 3),
  faceUpCards: cards.slice(3, 6),
  faceDownCards: cards.slice(6, 9),
  isHuman: true,
});

const createBotPlayers = (cards: Card[], count: number): Player[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `bot-${i}`,
    name: `Bot ${i + 1}`,
    hand: cards.slice(i * 9, i * 9 + 3),
    faceUpCards: cards.slice(i * 9 + 3, i * 9 + 6),
    faceDownCards: cards.slice(i * 9 + 6, i * 9 + 9),
    isHuman: false,
  }));
};
