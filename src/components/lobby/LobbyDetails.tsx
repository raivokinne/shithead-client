import { Lobby as LobbyDetailsType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { LobbyStatus } from './LobbyStatus';
import { Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LobbyDetailsProps {
  lobby: LobbyDetailsType;
}

export function LobbyDetails({ lobby }: LobbyDetailsProps) {
  const playerPercentage = (lobby.current_players / lobby.max_players) * 100;

  return (
    <Card>
      <CardContent>
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">Game Status</h3>
              <div className="flex items-center gap-2">
                <LobbyStatus status={lobby.status} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Players</span>
                </div>
                <span className="font-medium">
                  {lobby.current_players} / {lobby.max_players}
                </span>
              </div>
              <Progress value={playerPercentage} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
