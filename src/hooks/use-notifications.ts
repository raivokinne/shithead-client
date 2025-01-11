import { useState, useEffect, useCallback } from 'react';
import { instance } from '@/lib/axios';
import { toast } from '@/hooks/use-toast';
import { Notification } from '@/types';

export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [unreadCount, setUnreadCount] = useState(0);

	const fetchNotifications = useCallback(async () => {
		try {
			const response = await instance.get('/notifications');
			setNotifications(response.data);
			setUnreadCount(response.data.filter((notification: Notification) => !notification.read).length);
		} catch (error) {
			console.error('Failed to fetch notifications:', error);
			toast({
				title: 'Error',
				description: 'Failed to load notifications',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	}, []);

	const accept = useCallback(async (lobbyId: string) => {
		try {
			const response = await instance.post('/lobbies/invitation/accept', {
				lobby_id: lobbyId
			});

			if (response.data.success) {
				toast({
					title: 'Success',
					description: 'Successfully joined lobby',
				});
				return true;
			}
			return false;
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.response?.data?.error || 'Failed to accept invitation',
				variant: 'destructive',
			});
			return false;
		}
	}, []);

	const markAsRead = useCallback(async (notificationId: string) => {
		try {
			await instance.put(`/notifications/${notificationId}/read`);
			setNotifications(prev =>
				prev.map(n =>
					n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
				)
			);
			setUnreadCount(prev => Math.max(0, prev - 1));
		} catch (error) {
			console.error('Failed to mark notification as read:', error);
		}
	}, []);

	const markAllAsRead = useCallback(async () => {
		try {
			await instance.put('/notifications/read-all');
			setNotifications(prev =>
				prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
			);
			setUnreadCount(0);
			toast({
				title: 'Success',
				description: 'All notifications marked as read',
			});
		} catch (error) {
			console.error('Failed to mark all notifications as read:', error);
			toast({
				title: 'Error',
				description: 'Failed to mark notifications as read',
				variant: 'destructive',
			});
		}
	}, []);

	useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	return {
		notifications,
		loading,
		unreadCount,
		markAsRead,
		markAllAsRead,
		accept
	};
}

