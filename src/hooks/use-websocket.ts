import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GameStateType } from '@/pages/game/Show';

interface GameWebSocketProps {
	gameId: string | undefined;
	onGameUpdate?: (update: GameStateType) => void;
}

type Data = {
	payload: {
		[key: string]: any
	}
}

export const useGameWebSocket = ({
	gameId,
	onGameUpdate,
}: GameWebSocketProps) => {
	const { toast } = useToast();
	const navigate = useNavigate();
	const wsRef = useRef<WebSocket | null>(null);
	const [data, setData] = useState<Data>()
	const [connectionStatus, setConnectionStatus] = useState<WebSocket['readyState']>(
		WebSocket.CONNECTING
	);

	useEffect(() => {
		const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:8000/games/${gameId}`;
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			setConnectionStatus(WebSocket.OPEN);
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
			toast({
				title: "Connection Error",
				description: "Failed to connect to game server",
				variant: "destructive",
			});
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				switch (data.type) {
					case 'game_started':
						toast({
							title: "Success",
							description: "Game started successfully",
						});
						if (data.payload.redirect) {
							navigate(data.payload.redirect);
						}
						break;
					case 'lobby_ready':
						if (data.payload.is_ready) {
							const isReady = data.payload.is_ready
							toast({
								title: isReady ? '✋ No Longer Ready' : '👍 Ready to Play',
								description: isReady ? 'You can make changes before the game starts' : 'Waiting for other players',
							});
							setData(data)
						}
						break;
					case 'game_update':
						onGameUpdate?.(data.payload);
						break;
					case 'game_error':
						toast({
							title: "Error",
							description: data.payload.message,
							variant: "destructive",
						});
						break;
					default:
						console.log('Unhandled message type:', data.type);
				}
			} catch (error) {
				console.error('WebSocket message error:', error);
				toast({
					title: "Error",
					description: "Failed to process server message",
					variant: "destructive",
				});
			}
		};

		return () => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.close();
			}
		};
	}, [gameId, navigate, toast, onGameUpdate]);

	const startGame = useCallback(() => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			toast({
				title: "Error",
				description: "Not connected to game server",
				variant: "destructive",
			});
			return;
		}

		wsRef.current.send(JSON.stringify({
			type: 'start_game',
			payload: { gameId }
		}));
	}, [gameId, toast]);

	const readyUp = useCallback((lobbyId: string) => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			toast({
				title: "Error",
				description: "Not connected to game server",
				variant: "destructive",
			});
			return;
		}
		wsRef.current.send(JSON.stringify({
			type: 'lobby_ready',
			payload: { lobbyId }
		}));
	}, [])


	return {
		data,
		startGame,
		connectionStatus,
		readyUp
	};
};

export default useGameWebSocket;
