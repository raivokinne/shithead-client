import { Button } from '@/components/ui/button';
import { Settings, Undo } from 'lucide-react';
import { useState } from 'react';
import { LobbySettingsDialog } from './settings/LobbySettingsDialog';
import { useLobby } from '@/hooks/use-lobby';

interface LobbyHeaderProps {
  id: string | undefined;
  name: string;
  isOwner: boolean;
}

export function LobbyShowHeader({ id, name, isOwner }: LobbyHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { leaveLobby } = useLobby(id);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-start justify-between gap-4 w-full">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            <p className="text-muted-foreground mt-1">Game Lobby #{id}</p>
          </div>
          <Button onClick={leaveLobby} variant="destructive">
            <Undo className="mr-2" /> Leave Lobby
          </Button>
        </div>
        {isOwner && (
          <>
            <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <LobbySettingsDialog open={showSettings} onOpenChange={setShowSettings} />
          </>
        )}
      </div>
    </div>
  );
}
