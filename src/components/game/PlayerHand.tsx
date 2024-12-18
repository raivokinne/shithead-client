import React from 'react';
import { Card, Player } from '@/types/game';
import { PlayingCard } from './PlayingCard';
import { cn } from '@/lib/utils';

interface PlayerHandProps {
  player: Player;
  isCurrentPlayer: boolean;
  onPlayCard: (card: Card) => void;
  showFront: boolean;
  isValidPlay: (card: Card, topCard?: Card) => boolean;
  topCard?: Card;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  isCurrentPlayer,
  onPlayCard,
  showFront,
  isValidPlay,
  topCard,
}) => {
  const renderCardSection = (cards: Card[], section: 'hand' | 'faceUp' | 'faceDown') => {
    return cards.map((card) => {
      const shouldShowCard =
        (section === 'hand' && showFront) ||
        section === 'faceUp' ||
        (section === 'faceDown' &&
          player.hand.length === 0 &&
          player.faceUpCards.length === 0);

      const isCardPlayable =
        isCurrentPlayer &&
        ((section === 'hand' && showFront) ||
          section === 'faceUp' ||
          (section === 'faceDown' &&
            player.hand.length === 0 &&
            player.faceUpCards.length === 0));

      return (
        <div
          key={`${player.id}-${section}-${card.code}`}
          className={cn(
            "transition-transform hover:-translate-y-1",
            isCardPlayable &&
            (section === 'hand' || section === 'faceUp') &&
            isValidPlay(card, topCard) &&
            "cursor-pointer"
          )}
          onClick={() => {
            if (isCardPlayable &&
              (section === 'hand' || section === 'faceUp') &&
              isValidPlay(card, topCard)) {
              onPlayCard(card);
            }
          }}
        >
          <PlayingCard
            card={card}
            showFront={shouldShowCard}
            isPlayable={
              isCardPlayable &&
              (section === 'hand' || section === 'faceUp') &&
              isValidPlay(card, topCard)
            }
          />
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {player.faceDownCards.length > 0 && (
        <div className="relative flex justify-center gap-2 items-center">
          {renderCardSection(player.faceDownCards, 'faceDown')}
          {player.faceUpCards.length > 0 && (
            <div className="absolute top-1/2 -translate-y-1/2 flex gap-2">
              {renderCardSection(player.faceUpCards, 'faceUp')}
            </div>
          )}
        </div>
      )}

      {player.hand.length > 0 && (
        <div className="flex justify-center gap-2 items-center">
          {renderCardSection(player.hand, 'hand')}
        </div>
      )}
    </div>
  );
};
