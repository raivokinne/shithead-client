import { useState, useCallback, useEffect } from 'react';
import { Card, GameState } from '@/types';
import { instance } from '@/lib/axios';

export function useGame(gameId: string | undefined) {
    const [game, setGame] = useState<GameState | null>(null);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [playedCards, setPlayedCards] = useState<Card[]>([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchGameState = useCallback(async () => {
        if (!gameId) return;

        try {
            const response = await instance.get(`/games/${gameId}`);
            const { game, playerHand, playedCards, isPlayerTurn } = response.data;

            setGame(game);
            setPlayerHand(playerHand);
            setPlayedCards(playedCards);
            setIsPlayerTurn(isPlayerTurn);
        } catch (error) {
            console.error('Failed to fetch game state', error);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    const playCard = useCallback(async (cardId: number) => {
        if (!gameId || !isPlayerTurn) return;

        try {
            await instance.post(`/games/${gameId}/play-card`, { card_id: cardId });
            await fetchGameState();
        } catch (error) {
            console.error('Failed to play card', error);
        }
    }, [gameId, isPlayerTurn, fetchGameState]);

    useEffect(() => {
        if (gameId) {
            fetchGameState();
            const interval = setInterval(fetchGameState, 5000);
            return () => clearInterval(interval);
        }
    }, [gameId, fetchGameState]);

    return {
        game,
        playerHand,
        playedCards,
        isPlayerTurn,
        loading,
        playCard
    };
}
