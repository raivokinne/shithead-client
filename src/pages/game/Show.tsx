import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useGameWebSocket } from '@/hooks/use-websocket';
import { instance } from '@/lib/axios';
import { Users, Crown, Signal } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';

interface CardType {
	id: string;
	code: string;
	image_url: string;
	value: string;
	suit: string;
	status: string;
	location_type: string;
	player_id?: string;
}

interface Player {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	card_count: number;
	is_current: boolean;
	user_id: string;
}

export interface GameStateType {
	id: string;
	status: string;
	current_player_id?: string;
	round_number: number;
	players: Player[];
	lobby: {
		id: string;
		name: string;
		owner_name: string;
		type: string;
		max_players: number;
		current_players: number;
		game_mode: string;
	};
}

export default function Show() {
	const { id: gameId } = useParams<{ id: string }>();
	const [isLoading, setIsLoading] = useState(true);
	const [cards, setCards] = useState<CardType[]>([]);
	const [gameState, setGameState] = useState<GameStateType | null>(null);
	const [error, setError] = useState<string | null>(null);
	const isInitialLoadComplete = useRef(false);
	const playPileRef = useRef<HTMLDivElement | null>(null);
	const { user } = useAuthStore();

	const { connectionStatus, playCard } = useGameWebSocket({
		gameId,
		onGameUpdate: (update) => {
			console.log("Game update received:", update);
			if (update.card_played) {
				setCards(prevCards => prevCards.map(card =>
					card.id === update.card_played!.id
						? { ...card, location_type: 'play_pile', player_id: undefined }
						: card
				));
			}
			if (update.card_drawn) {
				setCards(prevCards => prevCards.map(card =>
					card.id === update.card_drawn!.id
						? { ...card, location_type: 'hand', player_id: gameState?.current_player_id }
						: card
				));
			}
			if (update.current_player_id) {
				setGameState(prev => prev ? { ...prev, current_player_id: update.current_player_id } : prev);
			}
		},
	});

	/** DRAG & DROP LOGIC */
	const onDragStart = (event: React.DragEvent<HTMLDivElement>, cardId: string) => {
		console.log("Dragging card:", cardId);
		event.dataTransfer.setData("text/plain", cardId);
		event.dataTransfer.effectAllowed = "move";
	};

	const handleDragOverPile = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	};

	const handleDropOnPile = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const cardId = event.dataTransfer.getData("text/plain");

		const droppedCard = cards.find(card => card.id === cardId);
		if (!droppedCard || !gameState?.current_player_id) return;

		const nextPlayer = getNextPlayer(gameState.current_player_id); // Add logic to get the next player ID

		setGameState(prev => prev ? { ...prev, current_player_id: nextPlayer } : prev);

		playCard({ cardId: droppedCard.id, gameId: gameId || '', playerId: gameState.current_player_id });
	};

	const getNextPlayer = (currentPlayerId: string) => {
		const currentIndex = gameState?.players.findIndex(player => player.id === currentPlayerId);
		if (currentIndex === undefined || currentIndex === -1) return currentPlayerId;

		const nextPlayerIndex = (currentIndex + 1) % gameState?.players.length!;
		return gameState?.players[nextPlayerIndex].id;
	};

	/** LOADING GAME DATA */
	// Broadcast game update
	useEffect(() => {
		const loadInitialGame = async () => {
			if (!gameId) {
				setError('No game ID provided');
				setIsLoading(false);
				return;
			}

			if (isInitialLoadComplete.current) return;

			try {
				const response = await instance.get(`/cards/${gameId}/get`);
				if (response.status === 200) {
					isInitialLoadComplete.current = true;
					setCards(response.data.cards);
					setGameState(response.data.game_state);
				}
			} catch (error) {
				setError('Failed to load game data');
				console.error('Error loading game:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadInitialGame();
	}, [gameId]);


	const renderCard = (card: CardType | null, isHidden: boolean = false, position: string = 'bottom') => {
		const rotationClasses = {
			'left': '-rotate-90',
			'right': 'rotate-90',
			'top': 'rotate-180',
			'bottom': ''
		}[position] || '';

		if (!card) {
			return (
				<div className={`w-[60px] h-[84px] md:w-[70px] md:h-[98px] bg-white/5 rounded-lg border border-white/10 flex items-center justify-center ${rotationClasses}`} />
			);
		}

		if (isHidden) {
			return (
				<div className={`w-[60px] h-[84px] md:w-[70px] md:h-[98px] bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/20 transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-black/20 ${rotationClasses}`}>
					<div className="w-full h-full rounded-lg bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] bg-center" />
				</div>
			);
		}

		return (
			<div
				className={`relative w-[60px] h-[84px] md:w-[70px] md:h-[98px] group ${rotationClasses}`}
				draggable={!isHidden}
				onDragStart={(e) => onDragStart(e, card.id)}
			>
				<img
					src={card.image_url}
					alt={`${card.value} of ${card.suit}`}
					className="w-full h-full object-cover rounded-lg border border-white/20 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-black/20"
				/>
			</div>
		);
	};

	const renderPlayerSection = (player: Player, position: string) => {
		const playerCards = getPlayerCards(player.id);
		const isCurrentPlayer = gameState?.current_player_id === player.id && player.user_id === user.id;
		const isOwner = gameState?.lobby.owner_name === player.name;

		const positionClasses = {
			'bottom': 'max-w-[360px]',
			'top': 'max-w-[300px]',
			'left': 'max-w-[300px]',
			'right': 'max-w-[300px]'
		}[position];

		const cardLayoutClasses = {
			'bottom': 'grid grid-cols-3 gap-2',
			'top': 'flex gap-2',
			'left': 'grid gap-2',
			'right': 'grid gap-2'
		}[position];

		return (
			<div className={`relative bg-black/40 backdrop-blur-sm rounded-xl p-3 md:p-4 ${positionClasses}
        ${isCurrentPlayer ? 'ring-2 ring-white/30 shadow-lg shadow-black/30' : ''}`}>
				<div className="flex items-center gap-2 mb-3">
					<div className="flex items-center gap-2">
						<div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
							{player.avatar ? (
								<img src={player.avatar} alt={player.name} className="w-full h-full rounded-full" />
							) : (
								<span className="text-white text-sm md:text-base font-medium">{player.name[0].toUpperCase()}</span>
							)}
						</div>
						<span className="text-white text-sm md:text-base font-medium">{player.name}</span>
					</div>
					{isOwner && <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400/80" />}
					{isCurrentPlayer && (
						<span className="text-[10px] md:text-xs px-2 py-1 rounded-full bg-white/10 text-white/90 font-medium animate-pulse">
							Current Player
						</span>
					)}
				</div>

				<div className="grid place-items-center gap-4">
					<div className="relative m-2">
						<div className={cardLayoutClasses}>
							{playerCards.hidden.map(card => renderCard(card, true, position))}
						</div>
						<div className={`absolute bottom-[-12px] ${cardLayoutClasses}`}>
							{playerCards.faceUp.map(card => renderCard(card, false, position))}
						</div>
					</div>

					{position === 'bottom' && (
						<div className="w-full">
							<h3 className="text-white/70 text-xs md:text-sm font-medium mb-3">Your Hand</h3>
							<div className={cardLayoutClasses}>
								{playerCards.hand.map(card => (
									<div key={card.id} className="transform hover:-translate-y-2 transition-all duration-200 cursor-pointer">
										{renderCard(card, false, position)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		);
	};

	const getPlayerCards = (playerId: string) => ({
		hidden: cards.filter(card => card.player_id === playerId && card.status === 'hidden'),
		faceUp: cards.filter(card => card.player_id === playerId && card.status === 'faceup'),
		hand: cards.filter(card => card.player_id === playerId && card.status === 'hand')
	});

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="animate-spin w-10 h-10 border-3 border-white border-t-transparent rounded-full mx-auto" />
					<p className="text-white/80 text-sm md:text-base font-medium">Loading game...</p>
				</div>
			</div>
		);
	}

	if (error || !gameState) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
				<div className="bg-white/10 backdrop-blur-sm text-white/80 px-6 py-4 rounded-lg shadow-xl">
					<p className="text-sm md:text-base">{error || 'Game state not available'}</p>
				</div>
			</div>
		);
	}

	const deckCards = cards.filter(card => card.location_type === 'deck');
	const playPileCards = cards.filter(card => card.location_type === 'play_pile');

	const orderedPlayers = [...gameState.players];
	const playerCount = orderedPlayers.length;

	const currentPlayerIndex = orderedPlayers.findIndex(p => p.id === gameState.current_player_id);

	if (currentPlayerIndex > 0) {
		const currentPlayer = orderedPlayers.splice(currentPlayerIndex, 1)[0];
		orderedPlayers.unshift(currentPlayer);
	}

	const getPlayerPositions = () => {
		switch (playerCount) {
			case 2:
				return [
					{ player: orderedPlayers[0], position: 'bottom' },
					{ player: orderedPlayers[1], position: 'top' }
				];
			case 3:
				return [
					{ player: orderedPlayers[0], position: 'bottom' },
					{ player: orderedPlayers[1], position: 'left' },
					{ player: orderedPlayers[2], position: 'right' }
				];
			case 4:
				return [
					{ player: orderedPlayers[0], position: 'bottom' },
					{ player: orderedPlayers[1], position: 'left' },
					{ player: orderedPlayers[2], position: 'top' },
					{ player: orderedPlayers[3], position: 'right' }
				];
			default:
				return [{ player: orderedPlayers[0], position: 'bottom' }];
		}
	};

	const renderDeckSection = () => (
		<div className="text-center">
			<h3 className="text-white/70 text-xs md:text-sm font-medium mb-2">Deck</h3>
			<div className="relative">
				{renderCard(deckCards[deckCards.length - 1], true)}
				{deckCards.length > 0 && (
					<>
						<span className="absolute -top-1 -right-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
							{deckCards.length}
						</span>
						<Button
							disabled={gameState?.current_player_id !== user?.id}
							className="mt-2 bg-white/10 hover:bg-white/20 text-white text-xs"
						>
							Draw Card
						</Button>
					</>
				)}
			</div>
		</div>
	);

	const playerPositions = getPlayerPositions();

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
			<div className="min-h-screen">
				<div className="max-w-7xl mx-auto h-screen p-3 md:p-4 flex flex-col">
					<div className="relative mb-4">
						<div className="absolute right-0 top-0 flex items-center gap-2">
							<div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs md:text-sm
                ${connectionStatus === WebSocket.OPEN
									? 'bg-white/10 text-white/90'
									: 'bg-white/5 text-white/60'}`}>
								<Signal className="w-3.5 h-3.5" />
								<span>{connectionStatus === WebSocket.OPEN ? 'Connected' : 'Connecting...'}</span>
							</div>
							<div className="bg-white/10 text-white/90 px-2.5 py-1 rounded-full text-xs md:text-sm flex items-center gap-1.5">
								<Users className="w-3.5 h-3.5" />
								<span>{playerCount} Players</span>
							</div>
						</div>
					</div>

					<div className="flex-1 relative">
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
							<div className="flex gap-8 md:gap-12 pointer-events-auto">
								{renderDeckSection()}

								<div className="text-center">
									<h3 className="text-white/70 text-xs md:text-sm font-medium mb-2">Play Pile</h3>
									<div
										className="relative"
										ref={playPileRef}
										onDrop={handleDropOnPile}
										onDragOver={handleDragOverPile}
									>
										{renderCard(playPileCards[playPileCards.length - 1])}
										{playPileCards.length > 0 && (
											<span className="absolute -top-1 -right-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
												{playPileCards.length}
											</span>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="absolute inset-0">
							<div className="h-full grid grid-rows-3 grid-cols-3 gap-4">
								{playerPositions.map(({ player, position }) => {
									const gridPositionClasses = {
										'bottom': 'col-start-2 col-span-1 row-start-3 self-end',
										'top': 'col-start-2 col-span-1 row-start-1',
										'left': 'col-start-1 col-span-1 row-start-2 flex items-center',
										'right': 'col-start-3 col-span-1 row-start-2 flex items-center justify-end'
									}[position];

									return (
										<div key={player.id} className={gridPositionClasses}>
											<div className={position === 'bottom' || position === 'top' ? 'flex justify-center' : 'w-full'}>
												{renderPlayerSection(player, position)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

