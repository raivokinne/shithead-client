import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useGameWebSocket } from '@/hooks/use-websocket';
import { instance } from '@/lib/axios';
import { Users, Crown, Signal } from 'lucide-react';

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
	const cardRef = useRef<HTMLDivElement | null>(null);
	const playePileRef = useRef<HTMLDivElement | null>(null);

	const onDragCard = () => {
		if (cardRef.current && playePileRef.current) {
			playePileRef.current.replaceChildren(cardRef.current);
		}
	};

	const onDragStart = (event: React.DragEvent<HTMLDivElement>, cardId: string) => {
		event.dataTransfer.setData("text/plain", cardId);
	};

	const onDropOnPile = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const cardId = event.dataTransfer.getData("text/plain");
		if (!cardId) return;
		setCards(prevCards => prevCards.map(card =>
			card.id === cardId ? { ...card, location_type: 'play_pile' } : card
		));
	};

	const onDragOverPile = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	const { connectionStatus } = useGameWebSocket({
		gameId: gameId || '',
		onGameUpdate: (update) => {
			console.log('Game updated:', update);
			setGameState(prevState => ({
				...prevState,
				...update
			}));
		},
	});

	useEffect(() => {
		const loadInitialGame = async () => {
			if (!gameId) {
				setError('No game ID provided');
				setIsLoading(false);
				return;
			}

			if (isInitialLoadComplete.current) return;

			try {
				const abortController = new AbortController();
				const response = await instance.get(`/cards/${gameId}/get`, {
					signal: abortController.signal
				});

				if (response.status === 200) {
					isInitialLoadComplete.current = true;
					setCards(response.data.cards);
					setGameState(response.data.game_state);
				}

				return () => {
					abortController.abort();
				};
			} catch (error) {
				setError('Failed to load game data');
				console.error('Error loading game:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadInitialGame();
	}, [gameId]);

	const renderCard = (card: CardType | null, isHidden: boolean = false) => {
		if (!card) {
			return (
				<div className="w-[60px] h-[84px] md:w-[70px] md:h-[98px] bg-white/5 rounded-lg border border-white/10 flex items-center justify-center" />
			);
		}

		if (isHidden) {
			return (
				<div className="w-[60px] h-[84px] md:w-[70px] md:h-[98px] bg-gradient-to-br from-white/10 to-white/5 rounded-lg border border-white/20 transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-black/20">
					<div className="w-full h-full rounded-lg bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] bg-center" />
				</div>
			);
		}

		return (
			<div
				className="relative w-[60px] h-[84px] md:w-[70px] md:h-[98px] group"
				draggable={!isHidden}
				onDragStart={(event) => onDragStart(event, card.id)}
				onDrag={onDragCard}
			>
				<img
					src={card.image_url}
					alt={`${card.value} of ${card.suit}`}
					className="w-full h-full object-cover rounded-lg border border-white/20 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-black/20"
				/>
			</div>
		);
	};

	const getPlayerCards = (playerId: string) => ({
		hidden: cards.filter(card => card.player_id === playerId && card.status === 'hidden'),
		faceUp: cards.filter(card => card.player_id === playerId && card.status === 'faceup'),
		hand: cards.filter(card => card.player_id === playerId && card.status === 'hand')
	});

	const getPlayerPosition = (_index: number, totalPlayers: number, currentPlayerId: string, playerId: string) => {
		if (playerId === currentPlayerId) return 'bottom';

		if (totalPlayers === 3) {
			const otherPlayerIndex = gameState?.players
				.filter(p => p.id !== currentPlayerId)
				.findIndex(p => p.id === playerId) ?? 0;
			return otherPlayerIndex === 0 ? 'top-left' : 'top-right';
		}

		if (totalPlayers === 4) {
			const otherPlayerIndex = gameState?.players
				.filter(p => p.id !== currentPlayerId)
				.findIndex(p => p.id === playerId) ?? 0;
			return otherPlayerIndex === 0 ? 'left' : otherPlayerIndex === 1 ? 'top' : 'right';
		}

		return 'top';
	};

	const renderPlayerSection = (player: Player, position: string) => {
		const playerCards = getPlayerCards(player.id);
		const isCurrentPlayer = gameState?.current_player_id === player.id;
		const isOwner = gameState?.lobby.owner_name === player.name;

		return (
			<div className={`relative bg-black/40 backdrop-blur-sm rounded-xl p-3 md:p-4 max-w-[360px] mx-auto
				${isCurrentPlayer ? 'ring-2 ring-white/30 shadow-lg shadow-black/30' : position}`}>
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
							Current Turn
						</span>
					)}
				</div>

				<div className="grid place-items-center gap-4">
					<div className="relative m-2">
						<div className="flex gap-2 pb-1">
							{playerCards.hidden.map(card => renderCard(card, true))}
						</div>
						<div className="flex absolute bottom-[-12px] gap-2 pb-1">
							{playerCards.faceUp.map(card => renderCard(card))}
						</div>
					</div>

					{isCurrentPlayer && (
						<div className="w-full">
							<h3 className="text-white/70 text-xs md:text-sm font-medium mb-3">Your Hand</h3>
							<div className="flex gap-2 pb-1 justify-center">
								{playerCards.hand.map(card => (
									<div key={card.id} className="transform hover:-translate-y-2 transition-all duration-200 cursor-pointer">
										{renderCard(card)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		);
	};

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

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
			<div className="min-h-screen">
				<div className="max-w-6xl mx-auto h-screen p-3 md:p-4 flex flex-col">
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
								<span>{gameState.players.length} Players</span>
							</div>
						</div>
					</div>

					<div className="flex-1 grid grid-cols-3 gap-4 relative">
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="flex gap-8 md:gap-12 pointer-events-auto">
								<div className="text-center">
									<h3 className="text-white/70 text-xs md:text-sm font-medium mb-2">Deck</h3>
									<div className="relative">
										{renderCard(deckCards[deckCards.length - 1], true)}
										{deckCards.length > 0 && (
											<span className="absolute -top-1 -right-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
												{deckCards.length}
											</span>
										)}
									</div>
								</div>

								<div className="text-center">
									<h3 className="text-white/70 text-xs md:text-sm font-medium mb-2">Play Pile</h3>
									<div
										className="relative"
										ref={playePileRef}
										onDrop={onDropOnPile}
										onDragOver={onDragOverPile}
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

						{gameState.players.map((player, index) => {
							const position = getPlayerPosition(
								index,
								gameState.players.length,
								gameState.current_player_id || '',
								player.id
							);

							const positionStyles = {
								'bottom': 'col-start-1 col-span-3 self-end',
								'top': 'col-start-1 col-span-3 self-start',
								'left': 'col-start-1 self-center',
								'right': 'col-start-3 self-center',
								'top-left': 'col-start-1 self-start',
								'top-right': 'col-start-3 self-start'
							}[position];

							return (
								<div key={player.id} className={positionStyles}>
									{renderPlayerSection(player, position)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
