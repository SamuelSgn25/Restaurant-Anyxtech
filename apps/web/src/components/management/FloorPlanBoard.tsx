import { useState, useMemo, useEffect } from 'react';
import { 
  Users, Clock, User, ChevronRight, X, Plan, 
  MapPin, Maximize2, Move, Layout, CheckCircle2, 
  Trash2, Plus, Info, Sparkles 
} from 'lucide-react';
import { RestaurantTable, Reservation, Order, TableStatus } from '../../types/management';

interface FloorPlanProps {
  tables: RestaurantTable[];
  reservations: Reservation[];
  orders: Order[];
  selectedTableId: string | null;
  onSelect: (id: string) => void;
  onReservationDrop: (reservationId: string, tableId: string) => void;
  onOrderDrop: (orderId: string, tableId: string) => void;
  onStatusChange?: (tableId: string, status: TableStatus) => void;
  onUpdateTablePosition?: (tableId: string, posX: number, posY: number) => void;
}

export function FloorPlanBoard({
  tables,
  reservations,
  orders,
  selectedTableId,
  onSelect,
  onReservationDrop,
  onOrderDrop,
  onStatusChange,
  onUpdateTablePosition
}: FloorPlanProps) {
  const [activeZone, setActiveZone] = useState('Salle principale');
  const [isEditMode, setIsEditMode] = useState(false);
  const [detailsModal, setDetailsModal] = useState<string | null>(null);

  const zones = useMemo(() => Array.from(new Set(tables.map((t) => t.zone))), [tables]);
  const filteredTables = useMemo(() => tables.filter((t) => t.zone === activeZone), [tables, activeZone]);

  const getTableColor = (status: TableStatus) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-emerald-500/20';
      case 'occupied': return 'bg-rose-100 border-rose-500 text-rose-900 ring-rose-500/20';
      case 'reserved': return 'bg-orange-100 border-orange-500 text-orange-900 ring-orange-500/20';
      case 'cleaning': return 'bg-slate-100 border-slate-400 text-slate-800 ring-slate-400/20';
      default: return 'bg-sand border-forest/10';
    }
  };

  const tableShapeClass = (shape: string) => {
    switch (shape) {
      case 'round': return 'rounded-full';
      case 'square': return 'rounded-3xl';
      default: return 'rounded-2xl';
    }
  };

  const formatElapsedTime = (startIso: string) => {
    const start = new Date(startIso).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / (1000 * 60));
    return `${diff} min`;
  };

  const selectedTable = useMemo(() => tables.find((t) => t.id === detailsModal), [tables, detailsModal]);
  const activeOrder = useMemo(() => orders.find((o) => o.tableId === detailsModal), [orders, detailsModal]);
  const activeReservation = useMemo(() => reservations.find((r) => r.tableId === detailsModal), [reservations, detailsModal]);

  return (
    <div className="relative flex flex-col h-full min-h-[700px] bg-white rounded-[2.5rem] border border-forest/5 shadow-xl overflow-hidden">
      
      {/* Upper Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4 border-b border-forest/5 bg-sand/20">
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-forest/5">
          {(zones.length > 0 ? zones : ['Salle principale']).map((zone) => (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={['px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all', activeZone === zone ? 'bg-forest text-white shadow-md' : 'text-forest/40 hover:text-forest/60'].join(' ')}
            >
              {zone}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={['flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm', isEditMode ? 'bg-clay text-white' : 'bg-white text-forest border border-forest/10 hover:bg-forest/5'].join(' ')}
          >
            {isEditMode ? <CheckCircle2 size={16} /> : <Move size={16} />}
            {isEditMode ? 'Quitter Edition' : 'Editer Position'}
          </button>
        </div>
      </div>

      <div className="flex-1 lg:flex min-h-0 bg-[#fbf9f6] relative">
        
        {/* Reservation Sidebar for D&D */}
        <aside className="w-full lg:w-72 bg-sand/30 border-r border-forest/5 p-6 space-y-6 overflow-auto custom-scrollbar">
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-forest/30 mb-4">Attente & Résas</p>
              <div className="space-y-3">
                 {reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length === 0 && (
                   <div className="p-8 text-center border-2 border-dashed border-forest/5 rounded-2xl">
                      <Clock size={24} className="mx-auto text-forest/10 mb-2" />
                      <p className="text-[10px] font-bold text-forest/20 uppercase">Aucun en attente</p>
                   </div>
                 )}
                 {reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').map(r => (
                   <div 
                    key={r.id} 
                    draggable 
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', `reservation:${r.id}`)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-forest/5 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
                   >
                     <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-forest group-hover:text-clay transition-colors">{r.guestName}</p>
                          <p className="text-[10px] font-bold text-forest/40 uppercase mt-1">{r.guests} Couverts • {new Date(r.date).toLocaleTimeString([], {hour: '2h-digit', minute: '2h-digit'})}</p>
                        </div>
                        <Info size={14} className="text-forest/10 group-hover:text-forest/30" />
                     </div>
                   </div>
                 ))}
              </div>
           </div>

           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-forest/30 mb-4">Commandes Ouvertes</p>
              <div className="space-y-3">
                 {orders.filter(o => o.status !== 'closed' && !o.tableId).map(o => (
                   <div 
                    key={o.id} 
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', `order:${o.id}`)}
                    className="bg-forest/5 p-4 rounded-2xl border border-forest/5 cursor-grab hover:bg-forest/10 transition-all border-dashed"
                   >
                     <p className="text-sm font-bold text-forest">{o.customerName || 'Client'}</p>
                     <p className="text-[10px] font-black text-clay uppercase mt-1">{o.total} XOF • {o.items.length} Plats</p>
                   </div>
                 ))}
              </div>
           </div>
        </aside>

        {/* Main Floor Grid */}
        <div className="flex-1 relative p-12 overflow-hidden bg-[radial-gradient(#13261f_1px,transparent_1px)] bg-[size:40px_40px] bg-opacity-[0.02]">
           {filteredTables.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                <div className="h-32 w-32 bg-forest/5 rounded-full flex items-center justify-center mb-6">
                   <Plus size={48} className="text-forest/10" />
                </div>
                <h3 className="font-display text-2xl text-forest/40">Aucune table dans cette zone</h3>
                <p className="text-forest/30 text-sm mt-2">Passez en mode édition pour ajouter de nouvelles tables.</p>
             </div>
           )}

           {filteredTables.map(table => {
             const tOrder = orders.find(o => o.tableId === table.id && o.status !== 'closed');
             const tRes = reservations.find(r => r.tableId === table.id && (r.status === 'pending' || r.status === 'confirmed'));

             return (
               <div 
                key={table.id}
                style={{ 
                  left: `${table.posX}%`, 
                  top: `${table.posY}%`,
                  width: `${table.width * 10}px`,
                  height: `${table.height * 10}px`,
                  position: 'absolute'
                }}
                className={['transition-all duration-700 select-none p-1', isEditMode ? 'cursor-move' : ''].join(' ')}
                onDragOver={(e) => !isEditMode && e.preventDefault()}
                onDrop={(e) => {
                  if (isEditMode) return;
                  const data = e.dataTransfer.getData('text/plain');
                  if (data.startsWith('reservation:')) onReservationDrop(data.replace('reservation:', ''), table.id);
                  if (data.startsWith('order:')) onOrderDrop(data.replace('order:', ''), table.id);
                }}
               >
                 <button
                  onClick={() => setDetailsModal(table.id)}
                  className={[
                    'w-full h-full border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden',
                    tableShapeClass(table.shape),
                    getTableColor(table.status),
                    isEditMode ? 'animate-pulse scale-95 border-dashed bg-white shadow-none' : 'shadow-lg hover:scale-105 active:scale-95'
                  ].join(' ')}
                 >
                    {/* Interior patterns for status */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    
                    <p className="font-display text-2xl font-bold tracking-tight">{table.label}</p>
                    
                    <div className="flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-forest/5">
                       <Users size={12} className="opacity-40" />
                       <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{table.seats}</span>
                    </div>

                    {table.status === 'occupied' && (
                       <div className="mt-2 text-[10px] font-bold text-rose-800 bg-white/40 px-3 py-1 rounded-full animate-pulse">
                         {tOrder ? formatElapsedTime(tOrder.createdAt) : '0 min'}
                       </div>
                    )}

                    {table.status === 'reserved' && (
                       <div className="absolute bottom-4 inset-x-0 mx-auto px-2">
                          <p className="text-[10px] font-black uppercase text-center bg-white/60 p-1 rounded-lg backdrop-blur truncate">
                             {tRes?.guestName || 'Réservé'}
                          </p>
                       </div>
                    )}
                 </button>

                 {/* Corner indicator for edit mode */}
                 {isEditMode && (
                   <div className="absolute -right-2 -bottom-2 h-6 w-6 bg-clay text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <Maximize2 size={12} />
                   </div>
                 )}
               </div>
             );
           })}
        </div>
      </div>

      {/* Details Modal */}
      {detailsModal && selectedTable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f1d18]/60 p-4 backdrop-blur-md">
           <div className="w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="relative p-10 pb-4 text-center">
                 <button onClick={() => setDetailsModal(null)} className="absolute top-8 right-8 text-forest/20 hover:text-forest transition-colors">
                    <X size={24} />
                 </button>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-forest/30 mb-2">{selectedTable.zone}</p>
                 <h3 className="font-display text-5xl text-forest mb-4 underline decoration-gold/30 underline-offset-8">{selectedTable.label}</h3>
                 <div className="flex justify-center gap-2">
                    <span className={['px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest', getTableColor(selectedTable.status)].join(' ')}>
                       {selectedTable.status}
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-sand text-forest/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       <Users size={12} /> {selectedTable.seats} Couverts
                    </span>
                 </div>
              </div>

              <div className="p-10 pt-6">
                 {/* Dynamics based on status */}
                 <div className="bg-[#f8f5f0] rounded-[2.5rem] p-8 mb-8 border border-forest/5">
                    {selectedTable.status === 'occupied' ? (
                       <div className="space-y-6">
                          <div className="flex justify-between items-center text-rose-800">
                             <div className="flex items-center gap-3">
                                <Sparkles size={20} className="text-gold" />
                                <span className="font-bold text-lg">Occupation en cours</span>
                             </div>
                             <span className="text-xs font-black bg-rose-200/50 px-3 py-1 rounded-full">{formatElapsedTime(activeOrder?.createdAt || new Date().toISOString())}</span>
                          </div>
                          <div className="space-y-3">
                             {activeOrder?.items.map((item, i) => (
                               <div key={i} className="flex justify-between items-center bg-white/60 p-3 rounded-2xl">
                                  <span className="text-sm font-bold text-forest">{item.quantity}x {item.name}</span>
                                  <span className="text-xs font-black text-clay">{item.unitPrice * item.quantity} XOF</span>
                               </div>
                             ))}
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-forest/5">
                             <span className="text-sm font-black text-forest uppercase tracking-widest opacity-40">Additif total</span>
                             <span className="text-2xl font-display text-forest">{activeOrder?.total || 0} XOF</span>
                          </div>
                       </div>
                    ) : selectedTable.status === 'reserved' ? (
                       <div className="text-center space-y-4 py-4">
                          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                             <User className="text-gold" size={32} />
                          </div>
                          <div>
                             <p className="text-lg font-bold text-forest">{activeReservation?.guestName || 'Aucun nom'}</p>
                             <p className="text-sm text-forest/40">Réservé pour {new Date(activeReservation?.date || '').toLocaleTimeString([], { hour: '2h-digit', minute: '2h-digit'})}</p>
                          </div>
                       </div>
                    ) : (
                       <div className="text-center py-10 opacity-30">
                          <Layout size={40} className="mx-auto mb-4" />
                          <p className="text-lg font-display uppercase tracking-[0.2em]">Table Disponible</p>
                       </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => { onSelect(selectedTable.id); setDetailsModal(null); }}
                      className="col-span-2 py-5 rounded-2xl bg-forest text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-forest/20 hover:scale-[1.02] transition-all"
                    >
                       Ouvrir dans la Gestion Détails
                    </button>
                    <button 
                      onClick={() => { onStatusChange?.(selectedTable.id, 'available'); setDetailsModal(null); }}
                      className="py-4 rounded-2xl border border-forest/10 text-emerald-600 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-50 transition-all"
                    >
                       Rétablir Libre
                    </button>
                    <button 
                      onClick={() => { onStatusChange?.(selectedTable.id, 'cleaning'); setDetailsModal(null); }}
                      className="py-4 rounded-2xl border border-forest/10 text-rose-500 font-bold uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-all"
                    >
                       Mettre Nettoyage
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
