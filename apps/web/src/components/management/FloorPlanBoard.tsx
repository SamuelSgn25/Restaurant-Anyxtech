import { useState, useMemo, useEffect } from 'react';
import { Order, Reservation, RestaurantTable, TableStatus } from '../../types/management';
import { StatusBadge } from './StatusBadge';
import { Clock, Users, ArrowRight, Settings, Plus, LayoutGrid, Info, Map as MapIcon, ChevronRight, X, User, Tag } from 'lucide-react';

function getTableColor(status: TableStatus) {
  switch (status) {
    case 'available': return 'bg-emerald-500 border-emerald-400 text-white';
    case 'occupied': return 'bg-rose-500 border-rose-400 text-white';
    case 'reserved': return 'bg-orange-500 border-orange-400 text-white';
    case 'cleaning': return 'bg-slate-400 border-slate-300 text-white';
    default: return 'bg-slate-200 border-slate-300 text-ink';
  }
}

function tableShapeClass(shape: RestaurantTable['shape']) {
  if (shape === 'round') return 'rounded-full';
  if (shape === 'booth') return 'rounded-3xl';
  return 'rounded-2xl';
}

export function FloorPlanBoard({
  tables,
  reservations,
  orders,
  selectedTableId,
  onSelect,
  onReservationDrop,
  onOrderDrop,
  onUpdateTablePosition,
  onStatusChange
}: {
  tables: RestaurantTable[];
  reservations: Reservation[];
  orders: Order[];
  selectedTableId: string | null;
  onSelect: (tableId: string | null) => void;
  onReservationDrop: (reservationId: string, tableId: string) => void;
  onOrderDrop: (orderId: string, tableId: string) => void;
  onUpdateTablePosition?: (tableId: string, posX: number, posY: number) => void;
  onStatusChange?: (tableId: string, status: TableStatus) => void;
}) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [detailsModal, setDetailsModal] = useState<string | null>(null);
  
  const zones = useMemo(() => Array.from(new Set(tables.map((table) => table.zone))), [tables]);
  const currentZone = activeZone || (zones.length > 0 ? zones[0] : null);
  const filteredTables = tables.filter((table) => table.zone === currentZone);

  const formatElapsedTime = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = Date.now();
    const diff = Math.floor((now - start) / 60000); // in minutes
    if (diff < 60) return `${diff}m`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  const selectedTable = useMemo(() => tables.find(t => t.id === detailsModal), [detailsModal, tables]);
  const activeOrder = useMemo(() => orders.find(o => o.tableId === detailsModal), [detailsModal, orders]);
  const activeReservation = useMemo(() => reservations.find(r => r.tableId === detailsModal), [detailsModal, reservations]);

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col gap-6 lg:flex-row">
      {/* Sidebar for Zones and Stats */}
      <aside className="flex w-full flex-col gap-6 lg:w-[280px]">
        <div className="surface-card p-6">
          <p className="eyebrow mb-4">Zones du restaurant</p>
          <div className="space-y-2">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setActiveZone(zone)}
                className={[
                  'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all',
                  currentZone === zone 
                    ? 'bg-forest text-white shadow-lg' 
                    : 'bg-sand/40 text-forest hover:bg-forest/5'
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <MapIcon size={16} />
                  <span>{zone}</span>
                </div>
                <span className={['rounded-full px-2 py-0.5 text-[10px]', currentZone === zone ? 'bg-white/20' : 'bg-forest/10'].join(' ')}>
                  {tables.filter(t => t.zone === zone).length}
                </span>
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={[
              'mt-6 flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition-all',
              isEditMode 
                ? 'bg-clay text-white border-clay shadow-lg pulse-animation' 
                : 'bg-white text-forest border-forest/15 hover:border-forest/40'
            ].join(' ')}
          >
            <Settings size={18} />
            {isEditMode ? 'Quitter Edition' : 'Editer le Plan'}
          </button>
        </div>

        <div className="surface-card flex-1 p-6">
          <p className="eyebrow mb-4">Reservations a placer</p>
          <div className="space-y-3 overflow-auto max-h-[400px] pr-2 custom-scrollbar">
            {reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').map((res) => (
              <div
                key={res.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', `reservation:${res.id}`)}
                className="group flex cursor-grab items-center gap-3 rounded-2xl border border-forest/5 bg-white p-3 shadow-sm transition hover:border-clay/40 hover:shadow-md active:cursor-grabbing"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/5 text-forest font-bold group-hover:bg-clay group-hover:text-white transition-colors">
                  {res.guests}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-forest">{res.guestName}</p>
                  <p className="text-[10px] text-ink/40">{new Date(res.date).toLocaleTimeString([], {hour: '2h-digit', minute:'2h-digit'})}</p>
                </div>
                <ChevronRight size={14} className="text-forest/20 group-hover:translate-x-1 group-hover:text-clay transition-all" />
              </div>
            ))}
            {reservations.filter(r => r.status === 'confirmed' || r.status === 'pending').length === 0 && (
              <p className="py-8 text-center text-xs italic text-ink/30">Aucune reservation en attente</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Map View */}
      <div className="relative flex-1 rounded-[3rem] border-8 border-white bg-sand/20 shadow-inner overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-5" />
        
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
           <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold shadow-sm backdrop-blur">
             <div className="h-2 w-2 rounded-full bg-emerald-500" /> <span>Libre</span>
             <div className="h-2 w-2 rounded-full bg-rose-500 ml-2" /> <span>Occupee</span>
             <div className="h-2 w-2 rounded-full bg-orange-500 ml-2" /> <span>Reservee</span>
           </div>
        </div>

        <div className="relative h-full w-full p-10">
          {filteredTables.map((table) => {
            const tOrder = orders.find(o => o.tableId === table.id && o.status !== 'closed');
            const tRes = reservations.find(r => r.tableId === table.id && (r.status === 'confirmed' || r.status === 'seated'));
            
            return (
              <div
                key={table.id}
                className="absolute"
                style={{ 
                  left: `${table.posX}%`, 
                  top: `${table.posY}%`, 
                  width: `${table.width}%`, 
                  height: `${table.height}%`,
                  minWidth: '90px',
                  minHeight: '90px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setDetailsModal(table.id)}
                  draggable={isEditMode}
                  onDragStart={(e) => { if (isEditMode) e.dataTransfer.setData('tableId', table.id); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const data = e.dataTransfer.getData('text/plain');
                    if (data.startsWith('reservation:')) onReservationDrop(data.replace('reservation:', ''), table.id);
                    if (data.startsWith('order:')) onOrderDrop(data.replace('order:', ''), table.id);
                  }}
                  className={[
                    'group relative h-full w-full border-2 p-2 shadow-sm transition-all duration-500',
                    tableShapeClass(table.shape),
                    getTableColor(table.status),
                    detailsModal === table.id ? 'z-20 scale-105 ring-8 ring-white/40 shadow-2xl' : 'hover:scale-102',
                    isEditMode ? 'cursor-move border-dashed border-white/60 animate-pulse' : 'hover:shadow-lg'
                  ].join(' ')}
                >
                  <div className="flex h-full flex-col items-center justify-center pointer-events-none">
                    <p className="font-display text-xl font-bold">{table.label}</p>
                    
                    <div className="mt-1 flex items-center justify-center gap-1 opacity-80">
                      <Users size={12} />
                      <span className="text-xs font-bold">{table.seats}</span>
                    </div>

                    {table.status === 'occupied' && tOrder && (
                      <div className="mt-2 flex animate-bounce-slow items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
                        <Clock size={10} />
                        {formatElapsedTime(tOrder.createdAt)}
                      </div>
                    )}

                    {table.status === 'reserved' && tRes && (
                       <div className="mt-2 text-[10px] font-bold uppercase tracking-tight opacity-90 truncate max-w-full">
                         {tRes.guestName.split(' ')[0]}
                       </div>
                    )}
                  </div>

                  {/* Visual alert for long wait */}
                  {table.status === 'occupied' && tOrder && (
                     <div className="absolute -right-1 -top-1 block h-3 w-3 rounded-full bg-wine ring-2 ring-white animate-ping" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Modal */}
      {detailsModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/60 p-4 backdrop-blur-sm transition-all">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">{selectedTable.zone}</p>
                <h3 className="mt-1 font-display text-3xl text-forest">{selectedTable.label}</h3>
              </div>
              <button onClick={() => setDetailsModal(null)} className="rounded-full bg-sand/50 p-2 text-forest/40 hover:bg-forest/5 hover:text-forest">
                <X size={24} />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-sand/30 p-4">
                <p className="text-xs font-bold text-forest/40 uppercase">Statut</p>
                <div className="mt-2 flex items-center gap-2">
                   <div className={['h-3 w-3 rounded-full', getTableColor(selectedTable.status).split(' ')[0]].join(' ')} />
                   <span className="font-bold text-forest capitalize">{selectedTable.status}</span>
                </div>
              </div>
              <div className="rounded-3xl bg-sand/30 p-4">
                <p className="text-xs font-bold text-forest/40 uppercase">Capacite</p>
                <div className="mt-2 flex items-center gap-2 text-forest">
                   <Users size={18} />
                   <span className="font-bold">{selectedTable.seats} personnes</span>
                </div>
              </div>
            </div>

            {selectedTable.status === 'occupied' && activeOrder && (
               <div className="mt-6 rounded-3xl border border-rose-100 bg-rose-50/50 p-6">
                 <div className="flex items-center justify-between">
                   <h4 className="font-bold text-rose-800">Commande en cours</h4>
                   <span className="rounded-full bg-rose-200 px-3 py-1 text-xs font-bold text-rose-700">Depuis {formatElapsedTime(activeOrder.createdAt)}</span>
                 </div>
                 <div className="mt-4 space-y-2">
                   {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium text-forest">{item.quantity}x {item.name}</span>
                        <span className="font-bold text-rose-900">{item.unitPrice * item.quantity} XOF</span>
                      </div>
                   ))}
                 </div>
                 <div className="mt-4 border-t border-rose-200 pt-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-rose-800 uppercase">Total</span>
                    <span className="text-xl font-display text-rose-900">{activeOrder.total} XOF</span>
                 </div>
               </div>
            )}

            {selectedTable.status === 'reserved' && activeReservation && (
               <div className="mt-6 rounded-3xl border border-orange-100 bg-orange-50/50 p-6">
                 <h4 className="font-bold text-orange-800">Reservation</h4>
                 <div className="mt-4 space-y-3">
                   <div className="flex items-center gap-3">
                     <User size={18} className="text-orange-400" />
                     <span className="font-medium">{activeReservation.guestName}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <Clock size={18} className="text-orange-400" />
                     <span className="font-medium">{new Date(activeReservation.date).toLocaleTimeString()}</span>
                   </div>
                 </div>
               </div>
            )}

            <div className="mt-10 flex flex-col gap-3">
              <button 
                onClick={() => { onSelect(selectedTable.id); setDetailsModal(null); }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-4 font-bold text-white shadow-xl transition hover:bg-clay"
              >
                Ouvrir la gestion detaillee
                <ChevronRight size={18} />
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                {selectedTable.status !== 'available' && (
                  <button 
                    onClick={() => { onStatusChange?.(selectedTable.id, 'available'); setDetailsModal(null); }}
                    className="rounded-full border border-forest/15 py-4 text-sm font-bold text-forest transition hover:bg-forest/5"
                  >
                    Libérer la table
                  </button>
                )}
                {selectedTable.status === 'cleaning' && (
                  <button 
                    onClick={() => { onStatusChange?.(selectedTable.id, 'available'); setDetailsModal(null); }}
                    className="rounded-full bg-emerald-500 py-4 text-sm font-bold text-white shadow-lg"
                  >
                    Pret pour service
                  </button>
                )}
                {selectedTable.status === 'available' && (
                   <button 
                    onClick={() => { onStatusChange?.(selectedTable.id, 'cleaning'); setDetailsModal(null); }}
                    className="rounded-full border border-forest/15 py-4 text-sm font-bold text-forest"
                   >
                     Marquer Nettoyage
                   </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
