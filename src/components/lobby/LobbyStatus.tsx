import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LobbyStatusProps {
  status: string;
}

export function LobbyStatus({ status }: LobbyStatusProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "capitalize font-medium",
        status === 'waiting' && "bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/20",
        status === 'in_progress' && "bg-green-500/15 text-green-500 hover:bg-green-500/20",
        status === 'completed' && "bg-blue-500/15 text-blue-500 hover:bg-blue-500/20"
      )}
    >
      {status.replace('_', ' ')}
    </Badge>
  );
}
