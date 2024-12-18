import { Button } from '@/components/ui/button';
import { Settings, Undo, Undo2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const [isLeavePrevented, setIsLeavePrevented] = useState(true);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isLeavePrevented) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (isLeavePrevented) {
        event.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isLeavePrevented]);

  useEffect(() => {
    if (isOwner) {
      setIsLeavePrevented(true);
    } else {
      setIsLeavePrevented(false);
    }
  }, [isOwner]);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-start justify-between gap-4 w-full">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            <p className="text-muted-foreground mt-1">Game Lobby #{id}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.history.back()} className="w-full">
                <Undo className="mr-2" />
            </Button>
            <Button onClick={leaveLobby} className="w-full" variant="destructive">
              <Undo2 className="mr-2" /> Leave Lobby
            </Button>
          </div>
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
