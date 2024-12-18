import { Button } from '@/components/ui/button';
import { RefreshCcw, Plus } from 'lucide-react';
import { LobbySearch } from './LobbySearch';

interface LobbyHeaderProps {
  onRefresh?: () => void;
  onCreateNew?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function LobbyHeader({
  onRefresh,
  onCreateNew,
  searchQuery,
  onSearchChange
}: LobbyHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Game Lobbies</h1>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Lobby
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <LobbySearch
          value={searchQuery}
          onChange={onSearchChange}
        />
        <div className="text-sm text-muted-foreground">
          Search by name, ID, or status
        </div>
      </div>
    </div>
  );
}
