import { Bell, CheckCheck, Clock3, CreditCard, Sparkles, TriangleAlert, UtensilsCrossed, Users, Waves } from 'lucide-react';
import { NotificationItem } from '../../types/management';

function NotificationIcon({ type }: { type: NotificationItem['type'] }) {
  const shared = 'rounded-2xl p-3 ring-1';

  switch (type) {
    case 'reservation':
      return <div className={`${shared} bg-orange-50 text-orange-600 ring-orange-200`}><Users size={18} /></div>;
    case 'order':
      return <div className={`${shared} bg-rose-50 text-rose-600 ring-rose-200`}><UtensilsCrossed size={18} /></div>;
    case 'payment':
      return <div className={`${shared} bg-emerald-50 text-emerald-600 ring-emerald-200`}><CreditCard size={18} /></div>;
    case 'table':
      return <div className={`${shared} bg-sky-50 text-sky-600 ring-sky-200`}><Waves size={18} /></div>;
    case 'staff':
      return <div className={`${shared} bg-violet-50 text-violet-600 ring-violet-200`}><TriangleAlert size={18} /></div>;
    default:
      return <div className={`${shared} bg-forest/5 text-forest ring-forest/10`}><Bell size={18} /></div>;
  }
}

export function NotificationCenter({
  notifications,
  open,
  onToggle,
  onRead,
  onReadAll,
  onNavigate
}: {
  notifications: NotificationItem[];
  open: boolean;
  onToggle: () => void;
  onRead: (id: string) => void;
  onReadAll?: () => void;
  onNavigate?: (type: string, notifId: string) => void;
}) {
  const unreadCount = notifications.filter((entry) => !entry.read).length;
  const sortedNotifs = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="group relative rounded-full border border-white/15 bg-white/10 p-3 text-white shadow-lg backdrop-blur-xl transition hover:scale-105 hover:bg-white/20"
      >
        <Bell size={20} className="transition group-hover:-rotate-6" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-black text-forest shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-[45]" onClick={onToggle} />
          <div className="absolute right-0 z-50 mt-4 w-[25rem] overflow-hidden rounded-[2.2rem] border border-white/60 bg-white shadow-2xl shadow-forest/15 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[linear-gradient(135deg,#13261f,#1d3b31)] px-6 py-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gold/80">Centre de notifications</p>
                  <h3 className="mt-2 font-display text-2xl">Alertes et activite</h3>
                  <p className="mt-2 text-sm text-white/65">
                    {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} a traiter` : 'Tout est a jour'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggle}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/75 transition hover:bg-white/15"
                >
                  Fermer
                </button>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-[1.3rem] bg-white/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Total</p>
                  <p className="mt-2 font-display text-3xl">{sortedNotifs.length}</p>
                </div>
                <div className="rounded-[1.3rem] bg-white/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Non lues</p>
                  <p className="mt-2 font-display text-3xl">{unreadCount}</p>
                </div>
                <div className="rounded-[1.3rem] bg-white/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Temps reel</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gold"><Sparkles size={14} /> Actif</p>
                </div>
              </div>
            </div>

            <div className="max-h-[30rem] overflow-y-auto bg-[#fcfaf7] custom-scrollbar">
              {sortedNotifs.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Sparkles size={40} className="mx-auto text-forest/10" />
                  <p className="mt-4 text-sm font-semibold text-forest/40">Aucune notification pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {sortedNotifs.map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => {
                        if (!notif.read) onRead(notif.id);
                        onNavigate?.(notif.type, notif.id);
                        onToggle();
                      }}
                      className={[
                        'w-full rounded-[1.5rem] border px-4 py-4 text-left transition',
                        notif.read
                          ? 'border-forest/8 bg-white text-forest/70 hover:border-forest/15'
                          : 'border-gold/40 bg-gold/10 text-forest hover:border-gold/70'
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-4">
                        <NotificationIcon type={notif.type} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-black leading-tight">{notif.title}</p>
                            {!notif.read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold" /> : null}
                          </div>
                          <p className="mt-2 text-sm leading-6 opacity-80">{notif.message}</p>
                          <p className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] opacity-45">
                            <Clock3 size={11} />
                            {formatNotificationTime(new Date(notif.createdAt))}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {sortedNotifs.length > 0 ? (
              <div className="flex items-center justify-between border-t border-forest/5 bg-white px-5 py-4">
                <button
                  type="button"
                  onClick={() => onReadAll?.()}
                  className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-ink"
                >
                  <CheckCheck size={14} />
                  Tout marquer comme lu
                </button>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-forest/35">Journal dynamique</p>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function formatNotificationTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'A l instant';
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} h`;
  if (days < 7) return `${days} j`;

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
