import { useState, useCallback, useEffect } from 'react';
import { TOTAL_CARDS_PER_PLAYER, type Card, type GameState } from '../types/game';
import { fetchNewDeck, drawCards } from '../utils/cardUtils';
import { isValidPlay, applySpecialCardRules, forcePickUpCards, initializeGame } from '../utils/gameUtils';
import { createPlayers } from '../utils/playerUtils';
import { removeCardFromPlayer } from '../utils/playerActions';
import { updateGameStateAfterDraw } from '../utils/gameStateUtils';

const CARDS_PER_HAND = 3;

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    playPile: [],
    burnPile: [],
    deck: '',
    remainingDeck: 0,
    status: 'setup',
    phase: 'hand',
    lastAction: '',
    extraTurn: false
  });

  const startGame = useCallback(async (botCount: number) => {
    const deckId = await fetchNewDeck();
    const totalPlayers = botCount + 1;
    const totalCardsNeeded = totalPlayers * TOTAL_CARDS_PER_PLAYER;

    if (totalCardsNeeded > 52) {
      console.error('Too many players for available cards!');
      return;
    }

    const shuffledDeck = await drawCards(deckId, totalCardsNeeded);
    if (!shuffledDeck || shuffledDeck.length < totalCardsNeeded) {
      console.error('Not enough cards to start the game!');
      return;
    }

    const players = createPlayers(shuffledDeck, botCount);
    const initialGameState = initializeGame(players, deckId);
    setGameState(initialGameState);
  }, []);

  const playCard = useCallback((playerId: string, card: Card) => {
    setGameState((prevState) => {
      const currentPlayer = prevState.players[prevState.currentPlayerIndex];

      if (playerId !== currentPlayer.id) {
        return prevState;
      }

      const topCard = prevState.playPile[prevState.playPile.length - 1];

      if (!isValidPlay(card, topCard, currentPlayer, prevState.phase, prevState.playPile)) {
        return prevState;
      }

      const { playPile, burnPile, extraTurn } = applySpecialCardRules(
        card,
        prevState.playPile,
        prevState.burnPile
      );

      const { newPhase } = removeCardFromPlayer(currentPlayer, card, prevState.phase);

      const updatedPlayers = prevState.players.map(player => {
        if (player.id !== playerId) return player;

        const newPlayer = { ...player };
        if (prevState.phase === 'hand') {
          newPlayer.hand = newPlayer.hand.filter(c => c.code !== card.code);
        } else if (prevState.phase === 'faceUp') {
          newPlayer.faceUpCards = newPlayer.faceUpCards.filter(c => c.code !== card.code);
        } else if (prevState.phase === 'faceDown') {
          newPlayer.faceDownCards = newPlayer.faceDownCards.filter(c => c.code !== card.code);
        }
        return newPlayer;
      });

      const nextPlayerIndex = extraTurn
        ? prevState.currentPlayerIndex
        : (prevState.currentPlayerIndex + 1) % prevState.players.length;

      let currentPhase = newPhase;
      if (currentPlayer.hand.length > 0) {
        currentPhase = 'hand';
      } else if (prevState.phase === 'hand' && currentPlayer.faceUpCards.length > 0) {
        currentPhase = 'faceUp';
      } else if (prevState.phase === 'faceUp' && currentPlayer.faceDownCards.length > 0) {
        currentPhase = 'faceDown';
      }

      return {
        ...prevState,
        players: updatedPlayers,
        playPile,
        burnPile,
        currentPlayerIndex: nextPlayerIndex,
        lastAction: `${currentPlayer.name} played ${card.value}${extraTurn ? ' and gets another turn' : ''}`,
        phase: currentPhase,
        extraTurn
      };
    });
  }, []);

  const handlePickUpPlayPile = useCallback(() => {
    setGameState((prevState) => {
      const currentPlayer = prevState.players[prevState.currentPlayerIndex];

      if (prevState.playPile.length === 0) {
        return prevState;
      }

      const updatedPlayer = forcePickUpCards(
        currentPlayer,
        prevState.playPile,
        prevState.phase,
      );

      if (updatedPlayer) {
        const updatedPlayers = prevState.players.map(player =>
          player.id === currentPlayer.id ? updatedPlayer : player
        );

        return {
          ...prevState,
          players: updatedPlayers,
          playPile: [],
          currentPlayerIndex: (prevState.currentPlayerIndex + 1) % prevState.players.length,
          phase: 'hand',
          extraTurn: false,
          lastAction: `${currentPlayer.name} picked up the pile`
        };
      }

      return prevState;
    });
  }, []);

  const drawCardFromDeck = useCallback(async () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (!currentPlayer || gameState.remainingDeck <= 0) {
      handlePhaseTransition();
      return;
    }

    const cardsToDraw = Math.min(
      CARDS_PER_HAND - currentPlayer.hand.length,
      gameState.remainingDeck
    );

    if (cardsToDraw <= 0) {
      handlePhaseTransition();
      return;
    }

    const newCards = await drawCards(gameState.deck, cardsToDraw);
    setGameState((prevState) =>
      updateGameStateAfterDraw(prevState, newCards, cardsToDraw)
    );
  }, [gameState]);

  const handlePhaseTransition = useCallback(() => {
    setGameState((prevState) => {
      const currentPlayer = prevState.players[prevState.currentPlayerIndex];
      let newPhase = prevState.phase;

      if (currentPlayer.hand.length === 0) {
        if (prevState.phase === 'hand' && currentPlayer.faceUpCards.length > 0) {
          newPhase = 'faceUp';
        } else if (prevState.phase === 'faceUp' && currentPlayer.faceDownCards.length > 0) {
          newPhase = 'faceDown';
        }
      }

      const nextPlayerIndex = prevState.extraTurn || newPhase !== prevState.phase
        ? prevState.currentPlayerIndex
        : (prevState.currentPlayerIndex + 1) % prevState.players.length;

      return {
        ...prevState,
        phase: newPhase,
        currentPlayerIndex: nextPlayerIndex,
        extraTurn: false
      };
    });
  }, []);

  useEffect(() => {
    const autoDrawCards = async () => {
      if (gameState.status === 'playing' && gameState.phase === 'hand') {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (currentPlayer?.hand.length < CARDS_PER_HAND && gameState.remainingDeck > 0) {
          await drawCardFromDeck();
        }
      }
    };

    const autoPickUpCards = async () => {
      if (gameState.status === 'playing' || gameState.phase === 'faceUp' || gameState.phase === 'hand') {
        if (gameState.playPile.length === 0) {
          return;
        }
        handlePickUpPlayPile();
      }
    }

    autoPickUpCards();
    autoDrawCards();
    const intervalId = setInterval(autoDrawCards, 1000);
    return () => clearInterval(intervalId);
  }, [gameState, drawCardFromDeck]);

  const validatePlay = useCallback(
    (card: Card, topCard?: Card) => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      return isValidPlay(card, topCard, currentPlayer, gameState.phase, gameState.playPile);
    },
    [gameState.players, gameState.currentPlayerIndex, gameState.phase, gameState.playPile]
  );

  return {
    gameState,
    startGame,
    playCard,
    drawCardFromDeck,
    isValidPlay: validatePlay,
    handlePickUpPlayPile
  };
};
