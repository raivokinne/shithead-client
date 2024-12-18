import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Notification } from '@/types';
import { useNotifications } from '@/hooks/use-notifications';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  const handleClick = async () => {
    await markAsRead(notification.id);

    if (notification.data.lobby_id) {
      navigate(`/lobbies/${notification.data.lobby_id}/show`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
        "focus:outline-none focus:bg-muted/50",
        !notification.read_at && "bg-primary/5"
      )}
    >
      <div className="space-y-1">
        <p className="text-sm">{notification.data.message}</p>
        <div className="flex items-center gap-2">
          {notification.data.lobby_name && (
            <span className="text-xs font-medium text-primary">
              {notification.data.lobby_name}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </button>
  );
}
