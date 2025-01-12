import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import useGameWebSocket from '@/hooks/use-websocket';

export default function LobbyControls({ lobbyId, gameId }: { lobbyId: string; gameId: string | undefined }) {
	const [copying, setCopying] = useState(false);
	const { toast } = useToast();
	const { readyUp, data } = useGameWebSocket({
		gameId,
		onGameUpdate: (update) => {
			console.log('Game update:', update);
		},
	});

	console.log(data)

	const shareOptions = [
		{
			label: 'Copy ID',
			icon: copying ? Check : Copy,
			onClick: async () => {
				setCopying(true);
				await navigator.clipboard.writeText(lobbyId);
				toast({ title: 'Copied to Clipboard' });
				setTimeout(() => setCopying(false), 1000);
			},
		},
		{
			label: 'Share Link',
			icon: Share2,
			onClick: async () => {
				const url = `${window.location.origin}/lobbies/${lobbyId}/show`;
				if (navigator.share) {
					await navigator.share({ url });
				} else {
					await navigator.clipboard.writeText(url);
					toast({ title: 'Link Copied' });
				}
			},
		},
	];

	return (
		<div className="space-y-4">
			<Button
				variant={data?.payload?.is_ready ? "default" : "outline"}
				className={cn(
					"w-full transition-all duration-300",
					data?.payload?.is_ready && "bg-green-500 hover:bg-green-600"
				)}
				onClick={() => readyUp(lobbyId)}
			>
				{data?.payload?.is_ready ? "Ready to Play" : "Click when Ready"}
			</Button>

			<div className="grid grid-cols-2 gap-3">
				{shareOptions.map(({ label, icon: Icon, onClick }) => (
					<Button
						key={label}
						variant="outline"
						onClick={onClick}
						className="w-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300"
					>
						<Icon className="mr-2 h-4 w-4" />
						{label}
					</Button>
				))}
			</div>
		</div>
	);
}

