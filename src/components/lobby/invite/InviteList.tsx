import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLobby } from '@/hooks/use-lobby';
import { User as UserType } from '@/types';

interface InviteListProps {
	users: UserType[];
	onRemove: (userId: string) => void;
	lobbyId: string;
}

export function InviteList({ users, onRemove, lobbyId }: InviteListProps) {
	const [inviting, setInviting] = useState<string[]>([]);
	const { toast } = useToast();
	const { inviteUserToLobby } = useLobby(lobbyId);

	const handleInvite = async () => {
		if (users.length === 0) return;

		setInviting(users.map(u => u.id));
		try {
			await Promise.all(
				users.map(user => inviteUserToLobby(lobbyId, user.id))
			);

			toast({
				title: 'Invitations Sent',
				description: `Successfully invited ${users.length} player${users.length === 1 ? '' : 's'}`,
			});

			users.forEach(user => onRemove(user.id));
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to send invitations',
				variant: 'destructive',
			});
		} finally {
			setInviting([]);
		}
	};

	if (users.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				{users.map((user) => (
					<div
						key={user.id}
						className="flex items-center justify-between p-2"
					>
						<div className="flex items-center gap-3">
							<Avatar className="h-8 w-8">
								<AvatarImage src={user.avatar || undefined} />
								<AvatarFallback>{user.name[0]}</AvatarFallback>
							</Avatar>
							<span className="text-sm font-medium">{user.name}</span>
						</div>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => onRemove(user.id)}
							disabled={inviting.includes(user.id)}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				))}
			</div>

			<Button
				className="w-full"
				onClick={handleInvite}
				disabled={inviting.length > 0}
			>
				{inviting.length > 0 ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Sending Invites...
					</>
				) : (
					<>
						<User className="mr-2 h-4 w-4" />
						Send {users.length} Invitation{users.length === 1 ? '' : 's'}
					</>
				)}
			</Button>
		</div>
	);
}
