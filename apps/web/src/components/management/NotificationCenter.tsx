import { Bell, X, Check, Info, AlertTriangle, CreditCard, Utensils, Zap, Sparkles, Clock, Trash2, Archive } from 'lucide-react';
import { NotificationItem } from '../../types/management';

function NotificationIcon({ type }: { type: NotificationItem['type'] }) {
  switch (type) {
    case 'reservation': return <div className="rounded-full bg-orange-500/20 p-3 text-orange-500 ring-1 ring-orange-500/30"><Info size={18} /></div>;
    case 'order': return <div className="rounded-full bg-rose-500/20 p-3 text-rose-500 ring-1 ring-rose-500/30"><Utensils size={18} /></div>;
    case 'payment': return <div className="rounded-full bg-emerald-500/20 p-3 text-emerald-500 ring-1 ring-emerald-500/30"><CreditCard size={18} /></div>;
    case 'table': return <div className="rounded-full bg-blue-500/20 p-3 text-blue-500 ring-1 ring-blue-500/30"><Zap size={18} /></div>;
    case 'staff': return <div className="rounded-full bg-purple-500/20 p-3 text-purple-500 ring-1 ring-purple-500/30"><AlertTriangle size={18} /></div>;
    default: return <div className="rounded-full bg-forest/20 p-3 text-forest ring-1 ring-forest/30"><Bell size={18} /></div>;
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
  const sortedNotifs = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="group relative rounded-full border border-white/15 bg-white/10 p-3 text-white backdrop-blur-xl transition hover:bg-white/20 hover:scale-110 active:scale-95 shadow-lg"
      >
        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-[0_0_16px_rgba(244,63,94,0.6)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[45]" onClick={onToggle} />
          <div className="absolute right-0 z-50 mt-4 w-96 origin-top-right rounded-[2.5rem] bg-white shadow-2xl shadow-forest/20 border border-white animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-forest to-forest/90 text-white px-8 py-6 rounded-t-[2.5rem] flex items-center justify-between border-b border-white/10">
               <div>
                 <h3 className="font-display text-xl tracking-wide">📬 Notifications</h3>
                 <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mt-1">
                    {unreadCount > 0 ? `${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}` : 'Tous lus'}
                 </p>
               </div>
               <button 
                 onClick={onToggle} 
                 className="p-2 rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all"
               >
                 <X size={20} />
               </button>
            </div>
            
            {/* Content */}
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {sortedNotifs.length === 0 ? (
                <div className="py-24 px-6 text-center">
                  <Sparkles size={48} className="mx-auto text-forest/5 mb-4" />
                  <p className="text-sm font-display italic text-forest/30">Aucune notification pour le moment.</p>
                  <p className="text-xs text-forest/20 mt-2">Votre établissement est calme.</p>
                </div>
              ) : (
                <div className="divide-y divide-forest/5">
                  {sortedNotifs.map((notif, idx) => (
                    <div
                      key={notif.id}
                      className={[
                        'group relative flex gap-4 px-6 py-5 transition-all duration-200 hover:bg-forest/2',
                        notif.read ? 'opacity-50' : 'bg-gold/5 hover:bg-gold/8'
                      ].join(' ')}
                    >
                      <div className="shrink-0 mt-1">
                        <NotificationIcon type={notif.type} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-black text-forest leading-tight mr-2">{notif.title}</p>
                          {!notif.read && <div className="h-3 w-3 rounded-full bg-gold shadow-md shrink-0 mt-1" />}
                        </div>
                        <p className="mt-1.5 text-xs text-forest/50 line-clamp-2 leading-relaxed font-medium">{notif.message}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-[9px] font-bold text-forest/30 uppercase tracking-widest flex items-center gap-1.5">
                             <Clock size={10} />
                             {formatNotificationTime(new Date(notif.createdAt))}
                          </p>
                        </div>
                      </div>
                      
                      {!notif.read && (
                        <button
                          onClick={() => onRead(notif.id)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-emerald-500 hover:text-white"
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

            {/* Footer */}
            {sortedNotifs.length > 0 && (
               <div className="sticky bottom-0 px-6 py-4 border-t border-forest/5 bg-grad from-white/50 to-white flex gap-2 justify-end">
                  <button className="p-2 rounded-lg text-forest/40 hover:text-forest hover:bg-forest/5 transition-all text-sm font-bold flex items-center gap-2">
                    <Archive size={14} />
                    <span className="hidden sm:inline">Archiver</span>
                  </button>
                  <button className="p-2 rounded-lg text-rose-400/60 hover:text-rose-600 hover:bg-rose-500/5 transition-all text-sm font-bold flex items-center gap-2">
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Effacer</span>
                  </button>
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}j ago`;
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
