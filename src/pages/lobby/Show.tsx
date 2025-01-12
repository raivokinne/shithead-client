import { Link, useParams } from 'react-router-dom';
import { Loader, Users, Clock } from 'lucide-react';
import { useLobby } from '@/hooks/use-lobby';
import { LobbyDetails } from '@/components/lobby/LobbyDetails';
import { ParticipantList } from '@/components/lobby/ParticipantList';
import { Button } from '@/components/ui/button';
import { StartGameButton } from '@/components/lobby/game-controls/StartGameButton';
import { useMemo } from 'react';
import { LobbyShowHeader } from '@/components/lobby/LobbyShowHeader';
import { useProtectedRoute } from '@/hooks/use-protected-route';
import { InviteDialog } from '@/components/lobby/invite/InviteDialog';
import LobbyControls from '@/components/lobby/game-controls/LobbyControls';
import { formatDistanceToNow } from 'date-fns';

export default function Show() {
	const { id } = useParams();
	const { lobby, loading } = useLobby(id);
	const { isLoading: authLoading } = useProtectedRoute();

	const isOwner = useMemo(() => {
		if (!lobby?.current_user.id) return false;
		return lobby?.owner.id === lobby?.current_user.id;
	}, [lobby]);

	const currentParticipant = useMemo(() =>
		lobby?.participants.find(p => p.id === lobby?.current_user.id),
		[lobby]
	);

	const playersReady = useMemo(() =>
		lobby?.participants.filter(p => p.is_ready).length ?? 0,
		[lobby]
	);

	if (authLoading || loading) {
		return (
			<div className="flex h-[80vh] items-center justify-center">
				<Loader className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!lobby) {
		return (
			<div className="flex h-[80vh] flex-col items-center justify-center gap-4">
				<Users className="h-16 w-16 text-muted-foreground/50" />
				<h2 className="text-2xl font-semibold text-muted-foreground">
					Lobby not found
				</h2>
				<p className="text-sm text-muted-foreground">
					The lobby you're looking for doesn't exist or has expired
				</p>
				<Button variant="outline" className="mt-4">
					<Link to="/lobbies">
						Return to Lobby List
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
			<div className="container max-w-4xl mx-auto p-6 space-y-8">
				<LobbyShowHeader id={id} name={lobby.name} isOwner={isOwner} />

				<div className="grid gap-6 md:grid-cols-[2fr,1fr]">
					<div className="space-y-6">
						<LobbyDetails lobby={lobby} />

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<h2 className="text-lg font-semibold">Participants</h2>
									<p className="text-sm text-muted-foreground">
										{lobby.current_players} out of {lobby.max_players} players
									</p>
								</div>
								<InviteDialog
									lobbyId={id!}
									maxPlayers={lobby.max_players}
									currentPlayers={lobby.current_players}
								/>
							</div>
							<ParticipantList
								participants={lobby.participants}
								owner={lobby.owner}
							/>
						</div>
					</div>

					<div className="space-y-6">
						<div className="rounded-lg border bg-card p-6">
							<h3 className="font-semibold mb-4">Game Controls</h3>
							<div className="space-y-4">
								{isOwner && currentParticipant?.is_ready ? (
									<StartGameButton
										disabled={playersReady !== lobby.current_players}
										gameId={lobby?.current_game?.id}
										playersReady={playersReady}
										totalPlayers={lobby.current_players}
									/>
								) : (
									<LobbyControls
										lobbyId={id!}
										gameId={lobby?.current_game?.id}
									/>
								)}
							</div>
						</div>

						<div className="rounded-lg border bg-card p-6">
							<h3 className="font-semibold mb-4">Lobby Info</h3>
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">Created {formatDistanceToNow(lobby.created_at)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

