import { NotificationItem } from '../../types/management';
import { StatusBadge } from './StatusBadge';

export function NotificationCenter({
  notifications,
  open,
  onToggle,
  onRead
}: {
  notifications: NotificationItem[];
  open: boolean;
  onToggle: () => void;
  onRead: (notificationId: string) => void;
}) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="relative rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
      >
        Notifications
        {unreadCount > 0 ? (
          <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-forest">{unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-3 w-[24rem] rounded-[1.5rem] border border-white/15 bg-ink p-4 text-white shadow-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-2xl">Centre de notifications</h3>
          </div>
          <div className="max-h-[26rem] space-y-3 overflow-auto pr-1">
            {notifications.map((notification) => (
              <article key={notification.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{notification.title}</p>
                    <p className="mt-1 text-sm text-white/70">{notification.message}</p>
                    <p className="mt-2 text-xs text-white/45">{new Date(notification.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  <StatusBadge value={notification.read ? 'completed' : 'pending'} />
                </div>
                {!notification.read ? (
                  <button type="button" onClick={() => onRead(notification.id)} className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-forest">
                    Marquer comme lu
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
