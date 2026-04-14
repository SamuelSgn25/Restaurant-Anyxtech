import { useState, useMemo } from 'react';
import { Order, Reservation, RestaurantTable, TableStatus } from '../../types/management';
import { StatusBadge } from './StatusBadge';
import { Clock, Users, ArrowRight, Settings, Plus, LayoutGrid, Info } from 'lucide-react';

function getTableColor(status: TableStatus) {
  switch (status) {
    case 'available': return 'bg-emerald-500 border-emerald-600 shadow-emerald-200';
    case 'occupied': return 'bg-rose-500 border-rose-600 shadow-rose-200';
    case 'reserved': return 'bg-orange-500 border-orange-600 shadow-orange-200';
    case 'cleaning': return 'bg-slate-400 border-slate-500 shadow-slate-200';
    default: return 'bg-slate-200 border-slate-300';
  }
}

function tableShapeClass(shape: RestaurantTable['shape']) {
  if (shape === 'round') return 'rounded-full';
  if (shape === 'booth') return 'rounded-3xl';
  return 'rounded-xl';
}

export function FloorPlanBoard({
  tables,
  reservations,
  orders,
  selectedTableId,
  onSelect,
  onReservationDrop,
  onOrderDrop,
  onUpdateTablePosition
}: {
  tables: RestaurantTable[];
  reservations: Reservation[];
  orders: Order[];
  selectedTableId: string | null;
  onSelect: (tableId: string) => void;
  onReservationDrop: (reservationId: string, tableId: string) => void;
  onOrderDrop: (orderId: string, tableId: string) => void;
  onUpdateTablePosition?: (tableId: string, posX: number, posY: number) => void;
}) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const zones = useMemo(() => Array.from(new Set(tables.map((table) => table.zone))), [tables]);
  
  const currentZone = activeZone || (zones.length > 0 ? zones[0] : null);
  const filteredTables = tables.filter((table) => table.zone === currentZone);

  const formatElapsedTime = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = Date.now();
    const diff = Math.floor((now - start) / 60000); // in minutes
    if (diff < 60) return `${diff} min`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={[
                'whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-bold transition-all',
                currentZone === zone 
                  ? 'bg-forest text-white shadow-lg' 
                  : 'bg-sand/60 text-forest hover:bg-forest/10'
              ].join(' ')}
            >
              {zone}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={[
              'flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-all',
              isEditMode 
                ? 'bg-clay text-white border-clay ring-4 ring-clay/20' 
                : 'bg-white text-forest border-forest/15 hover:border-forest/40'
            ].join(' ')}
          >
            <Settings size={18} />
            {isEditMode ? 'Quitter Edition' : 'Editer Plan'}
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="relative min-h-[600px] overflow-hidden rounded-[2.5rem] border-4 border-white/80 bg-[radial-gradient(circle_at_20%_35%,rgba(216,162,94,0.08),transparent_40%),linear-gradient(135deg,#fcf8f1_0%,#f5eedf_100%)] p-10 shadow-inner">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#17201d 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          {filteredTables.map((table) => {
            const activeOrder = orders.find(o => o.id === table.activeOrderId);
            const activeReservation = reservations.find(r => r.id === table.activeReservationId);

            return (
              <button
                key={table.id}
                type="button"
                onClick={() => onSelect(table.id)}
                draggable={isEditMode}
                onDragStart={(e) => {
                  if (isEditMode) e.dataTransfer.setData('tableId', table.id);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const data = e.dataTransfer.getData('text/plain');
                  if (data.startsWith('reservation:')) onReservationDrop(data.replace('reservation:', ''), table.id);
                  if (data.startsWith('order:')) onOrderDrop(data.replace('order:', ''), table.id);
                }}
                className={[
                  'absolute flex flex-col items-center justify-center border-2 p-2 text-center transition-all duration-300',
                  tableShapeClass(table.shape),
                  getTableColor(table.status),
                  selectedTableId === table.id ? 'z-20 scale-110 ring-8 ring-white/30' : 'hover:scale-105',
                  isEditMode ? 'cursor-move border-dashed opacity-80' : 'text-white'
                ].join(' ')}
                style={{ 
                  left: `${table.posX}%`, 
                  top: `${table.posY}%`, 
                  width: `${table.width}%`, 
                  height: `${table.height}%`,
                  minWidth: '80px',
                  minHeight: '80px'
                }}
              >
                <div className="pointer-events-none">
                  <p className="font-display text-xl font-bold leading-none drop-shadow-sm">{table.label}</p>
                  <div className="mt-1 flex items-center justify-center gap-1 opacity-90">
                    <Users size={12} />
                    <span className="text-xs font-bold">{table.seats}</span>
                  </div>
                  
                  {table.status === 'occupied' && activeOrder && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                      <Clock size={10} />
                      {formatElapsedTime(activeOrder.createdAt)}
                    </div>
                  )}

                  {table.status === 'reserved' && activeReservation && (
                    <div className="mt-1 max-w-[90%] truncate text-[10px] font-medium italic opacity-90">
                      {activeReservation.guestName}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-6 shadow-card">
            <p className="eyebrow !text-forest text-xs font-bold uppercase tracking-widest opacity-60">En attente</p>
            <div className="mt-4 space-y-3">
              {reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').map((res) => (
                <div
                  key={res.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', `reservation:${res.id}`)}
                  className="group relative flex cursor-grab items-center gap-3 rounded-2xl border border-forest/10 bg-sand/30 p-3 transition hover:border-clay/50 hover:bg-white hover:shadow-md active:cursor-grabbing"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest shadow-sm group-hover:bg-clay group-hover:text-white transition-colors">
                    <span className="font-bold">{res.guests}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-forest">{res.guestName}</p>
                    <p className="text-[11px] text-ink/50">{new Date(res.date).toLocaleTimeString([], {hour: '2h-digit', minute:'2h-digit'})}</p>
                  </div>
                  <ArrowRight size={14} className="text-forest/20 group-hover:translate-x-1 group-hover:text-clay transition-all" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-forest p-6 text-white shadow-card">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-gold" />
              <p className="text-sm font-bold uppercase tracking-widest text-white/60">Legende</p>
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-lg" />
                <span className="text-sm font-medium">Libre</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-rose-500 shadow-lg" />
                <span className="text-sm font-medium">Occupee</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-orange-500 shadow-lg" />
                <span className="text-sm font-medium">Reservee</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-slate-400 shadow-lg" />
                <span className="text-sm font-medium">Nettoyage</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
