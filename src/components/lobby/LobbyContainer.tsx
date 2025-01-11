import { Lobby } from '@/types';
import { LobbyGrid } from './LobbyGrid';
import { LobbyHeader } from './LobbyHeader';
import { useLobbySearch } from '@/hooks/use-lobby-search';

interface LobbyContainerProps {
	lobbies: Lobby[];
	onJoinLobby: (lobbyId: number, password: string, inviteCode?: string, privacyLevel?: string) => Promise<void>;
	onRefresh: () => void;
	onCreateNew: () => void;
}

export function LobbyContainer({
	lobbies,
	onJoinLobby,
	onRefresh,
	onCreateNew
}: LobbyContainerProps) {
	const { searchQuery, setSearchQuery, filteredLobbies } = useLobbySearch(lobbies);

	return (
		<div className="space-y-6">
			<LobbyHeader
				onRefresh={onRefresh}
				onCreateNew={onCreateNew}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>
			<LobbyGrid
				lobbies={filteredLobbies}
				onJoinLobby={onJoinLobby}
			/>
		</div>
	);
}
