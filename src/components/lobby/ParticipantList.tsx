import { Participant } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Users, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ParticipantListProps {
	participants: Participant[];
	owner: { id: number; name: string };
}

export function ParticipantList({
	participants,
	owner
}: ParticipantListProps) {
	if (participants.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl bg-muted/5">
				<Users className="w-12 h-12 mb-3 text-muted-foreground opacity-50" />
				<p className="font-medium text-muted-foreground">Waiting for Players...</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{participants.map((participant) => (
				<div
					key={participant.id}
					className={cn(
						"flex items-center justify-between p-4 rounded-lg transition-all duration-300",
						participant.id === owner.id
							? "bg-primary/10 border border-primary/20 shadow-sm"
							: "hover:bg-muted/50"
					)}
				>
					<div className="flex items-center gap-4">
						<Avatar className="h-10 w-10 ring-2 ring-background">
							<AvatarImage src={`https://ui-avatars.com/api/?name=${participant.name}`} />
							<AvatarFallback>{participant.name[0]}</AvatarFallback>
						</Avatar>

						<div>
							<div className="flex items-center gap-2">
								<span className="font-semibold">{participant.name}</span>
								{participant.id === owner.id && (
									<Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
								)}
							</div>
						</div>
					</div>

					<Badge
						variant={participant.is_ready ? "default" : "secondary"}
						className={cn(
							"transition-all duration-300",
							participant.is_ready && "bg-green-500/20 text-green-700"
						)}
					>
						{participant.is_ready ? "Ready" : "Not Ready"}
					</Badge>
				</div>
			))}
		</div>
	);
}
