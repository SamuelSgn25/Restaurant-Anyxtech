import { Bell, X, Check, Info, AlertTriangle, CreditCard, Utensils, Zap, Sparkles, Clock } from 'lucide-react';
import { NotificationItem } from '../../types/management';

function NotificationIcon({ type }: { type: NotificationItem['type'] }) {
  switch (type) {
    case 'reservation': return <div className="rounded-full bg-orange-500/10 p-2 text-orange-500 ring-1 ring-orange-500/20"><Info size={16} /></div>;
    case 'order': return <div className="rounded-full bg-rose-500/10 p-2 text-rose-500 ring-1 ring-rose-500/20"><Utensils size={16} /></div>;
    case 'payment': return <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-500 ring-1 ring-emerald-500/20"><CreditCard size={16} /></div>;
    case 'table': return <div className="rounded-full bg-blue-500/10 p-2 text-blue-500 ring-1 ring-blue-500/20"><Zap size={16} /></div>;
    default: return <div className="rounded-full bg-forest/10 p-2 text-forest ring-1 ring-forest/20"><Bell size={16} /></div>;
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
        className="group relative rounded-full border border-white/15 bg-white/10 p-3 text-white backdrop-blur-xl transition hover:bg-white/20 hover:scale-110 active:scale-95 shadow-lg"
      >
        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-clay text-[10px] font-black shadow-[0_0_10px_rgba(216,162,94,0.5)]">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[45]" onClick={onToggle} />
          <div className="absolute right-0 z-50 mt-4 w-80 sm:w-[400px] origin-top-right rounded-[2.5rem] bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_32px_64px_-16px_rgba(15,29,24,0.4)] animate-in fade-in zoom-in-95 duration-300">
            
            <div className="p-8 pb-4 flex items-center justify-between border-b border-white/10">
               <div>
                 <h3 className="font-display text-2xl text-white tracking-wide">Notifications</h3>
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">{unreadCount} messages non lus</p>
               </div>
               <button onClick={onToggle} className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <div className="max-h-[500px] overflow-auto custom-scrollbar p-2">
              {notifications.length === 0 ? (
                <div className="py-20 text-center">
                  <Sparkles size={40} className="mx-auto text-white/10 mb-4" />
                  <p className="text-sm font-display italic text-white/30">Votre établissement est calme pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={[
                        'group relative flex gap-5 rounded-[2rem] p-6 transition-all duration-300',
                        notif.read ? 'opacity-40 grayscale-[0.5]' : 'bg-white/5 hover:bg-white/10 ring-1 ring-white/5'
                      ].join(' ')}
                    >
                      <NotificationIcon type={notif.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-black text-white leading-tight">{notif.title}</p>
                          {!notif.read && <div className="h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_rgba(255,215,135,0.8)] shrink-0 mt-1" />}
                        </div>
                        <p className="mt-1 text-xs text-white/50 line-clamp-2 leading-relaxed font-medium">{notif.message}</p>
                        <p className="mt-3 text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                           <Clock size={10} />
                           {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2h-digit', minute: '2h-digit' })}
                        </p>
                      </div>
                      
                      {!notif.read && (
                        <button
                          onClick={() => onRead(notif.id)}
                          className="absolute right-4 bottom-4 h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-emerald-500 hover:text-white"
                          title="Marquer comme lu"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
               <div className="p-6 text-center border-t border-white/10">
                  <button className="text-[10px] font-black text-gold/60 hover:text-gold uppercase tracking-[0.3em] transition-all">
                    Vider toutes les notifications
                  </button>
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
