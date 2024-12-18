import { Participant } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ParticipantListProps {
  participants: Participant[];
  lobbyId: string;
}

export function ParticipantList({ participants }: ParticipantListProps) {
  const [participantsState, setParticipants] = useState(participants);

  if (participants.length !== participantsState.length) {
    setParticipants(participants);
  }

  if (participantsState.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg text-muted-foreground">
        <Users className="w-12 h-12 mb-3 opacity-50" />
        <p className="font-medium">No participants yet</p>
        <p className="text-sm">Waiting for players to join...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-lg border">
      <div className="p-4 space-y-3">
        {participantsState.map((participant, index) => (
          <div
            key={participant.id}
            className={cn(
              "flex items-center justify-between rounded-lg p-3 transition-colors",
              index === 0
                ? "bg-primary/5 border border-primary/20"
                : "hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${participant.id}`}
                />
                <AvatarFallback>{participant.name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{participant.name}</span>
                  {index === 0 && (
                    <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Joined 5 minutes ago
                </p>
              </div>
            </div>
            <Badge
              variant={participant.is_ready ? "default" : "secondary"}
              className="flex items-center gap-2 capitalize"
            >
              {participant.is_ready ? "Ready" : "Not Ready"}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
