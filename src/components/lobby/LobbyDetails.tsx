import { Lobby as LobbyDetailsType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { LobbyStatus } from './LobbyStatus';
import { Users, Timer, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LobbyDetailsProps {
  lobby: LobbyDetailsType;
}

export function LobbyDetails({ lobby }: LobbyDetailsProps) {
  const playerPercentage = (lobby.current_players / lobby.max_players) * 100;

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">Game Status</h3>
              <div className="flex items-center gap-2">
                <LobbyStatus status={lobby.status} />
              </div>
            </div>
            <Trophy className="h-8 w-8 text-primary/20" />
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
              <Progress value={playerPercentage} className="h-2" />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span>Estimated Time</span>
              </div>
              <span className="text-sm font-medium">~2 mins</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
