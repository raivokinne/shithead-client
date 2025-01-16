import { Lobby } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface LobbyCardProps {
	lobby: Lobby;
	onJoin: (lobbyId: number, password?: string, inviteCode?: string, privacyLevel?: string) => Promise<void>;
}

export function LobbyCard({ lobby, onJoin }: LobbyCardProps) {
	const isJoinable = lobby.status === 'waiting' && lobby.current_players < lobby.max_players && lobby.privacy_level !== 'invite_only';
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const isInLobby = lobby.participants.some(p => p.id === lobby.current_user.id);
	const isFull = lobby.current_players === lobby.max_players;

	const handleJoin = async () => {
		if (!isJoinable && !isInLobby) return;
		setIsLoading(true);
		setError('');
		try {
			const joinParams: Parameters<typeof onJoin> = [lobby.id];
			if (!isInLobby) {
				switch (lobby.privacy_level) {
					case 'password_protected':
						if (!password.trim()) {
							setError('Password is required');
							setIsLoading(false);
							return;
						}
						joinParams.push(password, '', 'password_protected');
						break;
					case 'invite_only':
						joinParams.push('invite_only', '', 'invite_only');
						break;
					default:
						joinParams.push('', '','')
				}
			}
			await onJoin(...joinParams);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to join lobby. Please try again.';
			toast({
				title: 'Join Lobby Failed',
				description: errorMessage,
				variant: 'destructive',
			});
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const timeAgo = lobby.created_at
		? formatDistanceToNow(typeof lobby.created_at === 'string' ? parseISO(lobby.created_at) : lobby.created_at)
		: '';

	return (
		<Card className="group hover:shadow-lg transition-all duration-300">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<Crown className="h-5 w-5 text-yellow-500" />
						{lobby.name}
					</span>
					<Badge variant={lobby.status === 'waiting' ? 'secondary' : 'outline'}>
						{lobby.status}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<div className="flex items-center gap-1.5">
							<Users className="h-4 w-4" />
							<span>{lobby.current_players}/{lobby.max_players}</span>
						</div>
						<div>
							{timeAgo} ago by {lobby.owner.name}
						</div>
					</div>
					{error && (
						<div className="flex items-center text-red-500 text-sm space-x-2 mb-2">
							<AlertCircle className="h-4 w-4" />
							<span>{error}</span>
						</div>
					)}
					{lobby.privacy_level === 'password_protected' && !isInLobby && !isFull && (
						<div className="space-y-2">
							<Input
								type="password"
								onChange={(e) => setPassword(e.target.value)}
								value={password}
								placeholder="Enter Password"
								disabled={isLoading}
							/>
						</div>
					)}
					<Button
						onClick={handleJoin}
						disabled={!isJoinable && !isInLobby || isLoading}
						className="w-full"
					>
						{isLoading ? 'Joining...' : isInLobby ? 'Rejoin Lobby' : isJoinable ? 'Join Game' : 'Cannot Join'}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

