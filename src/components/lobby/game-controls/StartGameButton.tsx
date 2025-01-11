import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGameWebSocket } from '@/hooks/use-websocket';

interface StartGameButtonProps {
	disabled: boolean;
	playersReady: number;
	totalPlayers: number;
	gameId: string | undefined;
}

export function StartGameButton({
	disabled,
	playersReady,
	totalPlayers,
	gameId
}: StartGameButtonProps) {
	const { toast } = useToast();
	const { startGame, connectionStatus } = useGameWebSocket({
		gameId,
		onGameUpdate: (update) => {
			console.log('Game update:', update);
		},
	});

	const isConnected = connectionStatus === WebSocket.OPEN;
	const isDisabled = disabled || !isConnected || playersReady !== totalPlayers;

	const handleStartGame = () => {
		if (!isConnected) {
			toast({
				title: 'Error',
				description: 'Not connected to game server',
				variant: 'destructive',
			});
			return;
		}

		if (playersReady !== totalPlayers) {
			toast({
				title: 'Error',
				description: 'All players must be ready to start the game',
				variant: 'destructive',
			});
			return;
		}

		startGame();
	};

	return (
		<Button
			size="lg"
			className="w-full"
			disabled={isDisabled}
			onClick={handleStartGame}
		>
			<PlayCircle className="mr-2 h-5 w-5" />
			{!isConnected ? 'Connecting...' : 'Start Game'}
		</Button>
	);
}
