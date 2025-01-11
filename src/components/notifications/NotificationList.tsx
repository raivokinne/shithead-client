import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/hooks/use-notifications';
import { Loader2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationList() {
	const { notifications, loading, markAllAsRead } = useNotifications();

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (notifications.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center">
				<Bell className="h-12 w-12 text-muted-foreground/50" />
				<h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
				<p className="text-sm text-muted-foreground">
					No new notifications to show
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between p-4 border-b">
				<h2 className="text-sm font-semibold">Notifications</h2>
				<Button
					variant="ghost"
					size="sm"
					onClick={markAllAsRead}
					className="text-xs"
				>
					Mark all as read
				</Button>
			</div>
			<ScrollArea className="flex-1">
				<div className="flex flex-col divide-y">
					{notifications.map((notification) => (
						<NotificationItem
							key={notification.id}
							notification={notification}
						/>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
