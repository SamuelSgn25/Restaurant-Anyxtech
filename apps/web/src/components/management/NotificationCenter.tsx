import { Bell, X, Check, Info, AlertTriangle, CreditCard, Utensils } from 'lucide-react';
import { NotificationItem } from '../../types/management';

function NotificationIcon({ type }: { type: NotificationItem['type'] }) {
  switch (type) {
    case 'reservation': return <div className="rounded-xl bg-orange-100 p-2 text-orange-600"><Info size={18} /></div>;
    case 'order': return <div className="rounded-xl bg-rose-100 p-2 text-rose-600"><Utensils size={18} /></div>;
    case 'payment': return <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600"><CreditCard size={18} /></div>;
    case 'table': return <div className="rounded-xl bg-blue-100 p-2 text-blue-600"><Info size={18} /></div>;
    default: return <div className="rounded-xl bg-slate-100 p-2 text-slate-600"><Bell size={18} /></div>;
  }
}

export function NotificationCenter({
  notifications,
  open,
  onToggle,
  onRead
}: {
  notifications: NotificationItem[];
  open: boolean;
  onToggle: () => void;
  onRead: (id: string) => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="relative rounded-full border border-white/15 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
      >
        <Bell size={20} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-clay text-[10px] font-bold shadow-lg">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-80 translate-x-0 sm:w-96 rounded-[2rem] border border-white/15 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 flex items-center justify-between border-b border-forest/5">
             <h3 className="font-display text-xl text-forest font-bold">Notifications</h3>
             <button onClick={onToggle} className="text-forest/30 hover:text-forest"><X size={18} /></button>
          </div>
          
          <div className="max-h-[480px] overflow-auto custom-scrollbar p-2">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm italic text-ink/30">Aucune notification nouvelle</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={[
                      'group relative flex gap-4 rounded-2xl p-4 transition hover:bg-forest/5',
                      notif.read ? 'opacity-60' : 'bg-forest/[0.02]'
                    ].join(' ')}
                  >
                    <NotificationIcon type={notif.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={['text-sm font-bold', notif.read ? 'text-ink/60' : 'text-forest'].join(' ')}>{notif.title}</p>
                        {!notif.read && <div className="h-2 w-2 rounded-full bg-clay shrink-0 mt-1" />}
                      </div>
                      <p className="mt-1 text-xs text-ink/60 line-clamp-2 leading-relaxed">{notif.message}</p>
                      <p className="mt-2 text-[10px] font-medium text-ink/40">
                         {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2h-digit', minute: '2h-digit' })}
                      </p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => onRead(notif.id)}
                        className="opacity-0 group-hover:opacity-100 absolute right-4 bottom-4 rounded-full bg-emerald-100 p-1.5 text-emerald-600 transition hover:bg-emerald-200"
                        title="Marquer comme lu"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {notifications.length > 0 && (
             <div className="p-3 bg-sand/20 rounded-b-[1.8rem] text-center border-t border-forest/5">
                <button className="text-xs font-bold text-forest/40 hover:text-forest transition">Voir tout l'historique</button>
             </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
