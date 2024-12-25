import { useState, useEffect, useCallback } from 'react';
import { instance } from '@/lib/axios';
import { toast } from '@/hooks/use-toast';
import { Notification } from '@/types';

type AcceptRequest = {
  invite_code: string,
  lobby_id: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await instance.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.length);
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

  const accept = useCallback(async (data: AcceptRequest) => {
    try {
      const response = await instance.post('/lobbies/inivitation/accept', data)
      if (response.data.succes) {
        toast({
          title: 'Success',
          description: 'Lobby inivitation accepted',
        });
      }
      toast({
        title: 'Error',
        description: 'Wrong invite code',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept lobby',
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

