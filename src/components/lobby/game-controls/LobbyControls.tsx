import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Copy, Share2 } from 'lucide-react';
import { instance } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function LobbyControls({ lobbyId, isReady = false }: { lobbyId: string; isReady: boolean }) {
	const [loading, setLoading] = useState(false);
	const [copying, setCopying] = useState(false);
	const { toast } = useToast();

	const handleReadyUp = async () => {
		setLoading(true);
		try {
			await instance.post(`/lobbies/${lobbyId}/ready`);
			toast({
				title: isReady ? '✋ No Longer Ready' : '👍 Ready to Play',
				description: isReady ? 'You can make changes before the game starts' : 'Waiting for other players',
			});
		} catch (error) {
			toast({
				title: 'Failed to Update Status',
				description: 'Please try again in a moment',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

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
				variant={isReady ? "default" : "outline"}
				className={cn(
					"w-full transition-all duration-300",
					isReady && "bg-green-500 hover:bg-green-600"
				)}
				onClick={handleReadyUp}
				disabled={loading}
			>
				{loading ? (
					<Loader2 className="mr-2 h-5 w-5 animate-spin" />
				) : (
					<Check className={cn("mr-2 h-5 w-5", isReady ? "opacity-100" : "opacity-50")} />
				)}
				{isReady ? "Ready to Play" : "Click when Ready"}
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

