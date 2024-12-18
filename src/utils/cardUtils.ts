import { Card, SPECIAL_CARDS, VALUE_ORDER } from '../types/game';

export const fetchNewDeck = async (): Promise<string> => {
  const response = await fetch(
    'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
  );
  const data = await response.json();
  return data.deck_id;
};

export const drawCards = async (deckId: string, count: number): Promise<Card[]> => {
  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`
  );
  const data = await response.json();

  const uniqueCards = Array.from(
    new Set(data.cards.map((c: any) => c.code))
  ).map((code) => data.cards.find((c: any) => c.code === code));

  return uniqueCards.slice(0, count).map((c: any) => ({
    code: c.code,
    image: c.image,
    value: c.value,
    suit: c.suit,
  }));
};

export const isSpecialCard = (card: Card): boolean => {
  return card.value === SPECIAL_CARDS.SIX ||
         card.value === SPECIAL_CARDS.TEN;
};

export const getValidCardsForPlay = (
  cards: Card[],
  topCard?: Card
): Card[] => {
  if (!topCard) return cards;

  return cards.filter(card =>
    isSpecialCard(card) ||
    VALUE_ORDER.indexOf(card.value) >= VALUE_ORDER.indexOf(topCard.value)
  );
};

