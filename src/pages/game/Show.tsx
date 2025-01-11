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
	const cardRef = useRef<HTMLDivElement | null>(null)
	const playePileRef = useRef<HTMLDivElement | null>(null)

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

		setCards(prevCards => {
			return prevCards.map(card =>
				card.id === cardId ? { ...card, location_type: 'play_pile' } : card
			);
		});
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

			if (isInitialLoadComplete.current) {
				return;
			}

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
				if (error) {
					setError('Failed to load game data');
					console.error('Error loading game:', error);
				}
			} finally {
				setIsLoading(false);
			}
		};

		loadInitialGame();
	}, [gameId]);

	const renderCard = (card: CardType | null, isHidden: boolean = false) => {
		if (!card) {
			return (
				<div className="w-12 h-18 sm:w-14 sm:h-20 bg-white/5 rounded border border-white/10 flex items-center justify-center" />
			);
		}

		if (isHidden) {
			return (
				<div className="w-12 h-18 sm:w-14 sm:h-20 bg-white/10 rounded border border-white/20 transform transition-transform hover:scale-105">
					<div className="w-full h-full rounded bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMCAyOCAyOCAwIDEgMC01NiAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] bg-center" />
				</div>
			);
		}

		return (
			<div
				className="relative w-12 h-18 sm:w-14 sm:h-20 group"
				draggable={!isHidden}
				onDragStart={(event) => onDragStart(event, card.id)}
				onDrag={onDragCard}
			>
				<img
					src={card.image_url}
					alt={`${card.value} of ${card.suit}`}
					className="w-full h-full object-cover rounded border border-white/20 transition-transform group-hover:scale-105"
				/>
			</div>
		);
	};

	const getPlayerCards = (playerId: string) => {
		return {
			hidden: cards.filter(card => card.player_id === playerId && card.status === 'hidden'),
			faceUp: cards.filter(card => card.player_id === playerId && card.status === 'faceup'),
			hand: cards.filter(card => card.player_id === playerId && card.status === 'hand')
		};
	};

	const getPlayerPosition = (_index: number, totalPlayers: number, currentPlayerId: string, playerId: string) => {
		if (playerId === currentPlayerId) {
			return 'bottom';
		}

		if (totalPlayers === 2) {
			return 'top';
		}

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
			<div
				className={`relative bg-black/40 backdrop-blur-sm rounded p-2.5 max-w-[360px] mx-auto ${isCurrentPlayer ? 'ring-1 ring-white/30' : ''
					} ${position}`}
			>
				<div className="flex items-center gap-2 mb-2">
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
							{player.avatar ? (
								<img src={player.avatar} alt={player.name} className="w-6 h-6 rounded-full" />
							) : (
								<span className="text-white text-xs">{player.name[0].toUpperCase()}</span>
							)}
						</div>
						<span className="text-white text-xs">{player.name}</span>
					</div>
					{isOwner && <Crown className="w-3.5 h-3.5 text-white/70" />}
					{isCurrentPlayer && (
						<span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
							Current Turn
						</span>
					)}
				</div>

				<div className="grid place-items-center">
					<div className="relative m-2">
						<div className="flex gap-1 pb-1">
							{playerCards.hidden.map(card => renderCard(card, true))}
						</div>
						<div className="flex absolute bottom-[-10px] gap-1 pb-1">
							{playerCards.faceUp.map(card => renderCard(card))}
						</div>
					</div>

					{isCurrentPlayer && (
						<div>
							<h3 className="text-white/50 text-[10px] mb-4">Your Hand</h3>
							<div className="flex gap-1 pb-1">
								{playerCards.hand.map(card => (
									<div key={card.id} className="transform hover:-translate-y-1 transition-transform cursor-pointer">
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
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-center space-y-3">
					<div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto" />
					<p className="text-white/70 text-sm">Loading game...</p>
				</div>
			</div>
		);
	}

	if (error || !gameState) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="bg-white/5 text-white/70 px-4 py-3 rounded">
					<p>{error || 'Game state not available'}</p>
				</div>
			</div>
		);
	}

	const deckCards = cards.filter(card => card.location_type === 'deck');
	const playPileCards = cards.filter(card => card.location_type === 'play_pile');

	return (
		<div className="min-h-screen bg-black">
			<div className="min-h-screen">
				<div className="max-w-5xl mx-auto h-screen p-3 flex flex-col">
					{/* Header */}
					<div className="relative mb-3">
						<div className="absolute right-0 top-0 flex items-center gap-2">
							<div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${connectionStatus === WebSocket.OPEN
								? 'bg-white/10 text-white/70'
								: 'bg-white/5 text-white/50'
								}`}>
								<Signal className="w-3 h-3" />
								<span>{connectionStatus === WebSocket.OPEN ? 'Connected' : 'Connecting...'}</span>
							</div>
							<div className="bg-white/10 text-white/70 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
								<Users className="w-3 h-3" />
								<span>{gameState.players.length} Players</span>
							</div>
						</div>

						<div className="text-center">
							<h1 className="text-2xl font-bold text-white mb-0.5">
								Shithead
							</h1>
							<p className="text-white/50 text-sm">{gameState.lobby.name}</p>
						</div>
					</div>

					<div className="flex-1 grid grid-cols-3 gap-3 relative">
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<div className="flex gap-6 pointer-events-auto">
								<div className="text-center">
									<h3 className="text-white/50 text-[10px] mb-1">Deck</h3>
									<div className="relative">
										{renderCard(deckCards[deckCards.length - 1], true)}
										{deckCards.length > 0 && (
											<span className="absolute -top-1 -right-1 bg-white/20 text-white text-[10px] px-1 rounded-full">
												{deckCards.length}
											</span>
										)}
									</div>
								</div>

								<div className="text-center">
									<h3 className="text-white/50 text-[10px] mb-1">Play Pile</h3>
									<div
										className="relative"
										ref={playePileRef}
										onDrop={onDropOnPile}
										onDragOver={onDragOverPile}
									>
										{renderCard(playPileCards[playPileCards.length - 1])}
										{playPileCards.length > 0 && (
											<span className="absolute -top-1 -right-1 bg-white/20 text-white text-[10px] px-1 rounded-full">
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
