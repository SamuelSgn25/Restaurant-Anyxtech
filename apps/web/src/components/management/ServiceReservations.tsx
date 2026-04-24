import { useState, useMemo } from 'react';
import { 
  CheckCircle2, Clock, Users, MapPin, Phone, Mail, 
  DollarSign, Trash2, Plus, Search, Filter, ChevronRight,
  Eye, AlertCircle, Smartphone, MapPinIcon, Award, Calendar
} from 'lucide-react';
import { Reservation, RestaurantTable, Order, Payment, TableStatus } from '../../types/management';

interface ServiceReservationsProps {
  reservations: Reservation[];
  tables: RestaurantTable[];
  orders: Order[];
  payments: Payment[];
  onReservationStatusChange: (id: string, status: string) => void;
  onAssignTable: (resId: string, tableId: string) => void;
  onTableStatusChange: (tableId: string, status: TableStatus) => void;
  onCreatePayment: (orderId: string, amount: number) => void;
  menu?: any[];
  onCreateOrder?: (payload: any) => Promise<any>;
  onUpdateOrderStatus?: (id: string, status: string) => Promise<any>;
}

export function ServiceReservations({
  reservations,
  tables,
  orders,
  payments,
  onReservationStatusChange,
  onAssignTable,
  onTableStatusChange,
  onCreatePayment,
  menu,
  onCreateOrder,
  onUpdateOrderStatus
}: ServiceReservationsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const matchesSearch = r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           r.phone.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-orange-100', text: 'text-orange-700', label: '⏳ En attente' };
      case 'confirmed': return { bg: 'bg-blue-100', text: 'text-blue-700', label: '✓ Confirmée' };
      case 'seated': return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '🪑 Installée' };
      case 'completed': return { bg: 'bg-slate-100', text: 'text-slate-700', label: '✓ Terminée' };
      case 'cancelled': return { bg: 'bg-rose-100', text: 'text-rose-700', label: '✗ Annulée' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    }
  };

  const getReservationTable = (resId: string) => {
    return tables.find(t => t.activeReservationId === resId);
  };

  const getReservationOrder = (tableId: string) => {
    return orders.find(o => o.tableId === tableId && o.status !== 'closed');
  };

  const readyOrders = useMemo(
    () => orders.filter((order) => order.status === 'ready'),
    [orders]
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    if (diff < 0) return `Arrivée il y a ${Math.abs(diff)} min`;
    if (diff === 0) return 'Arrivée maintenant';
    return `Arrivée dans ${diff} min`;
  };

  const getNextStatus = (current: string) => {
    const workflow: { [key: string]: string } = {
      'pending': 'confirmed',
      'confirmed': 'seated',
      'seated': 'completed',
      'completed': 'completed'
    };
    return workflow[current] || current;
  };

  return (
    <div className="space-y-8">
      {readyOrders.length > 0 && (
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">Cuisine vers service</p>
              <h3 className="mt-2 font-display text-2xl text-emerald-900">Commandes pretes a retirer</h3>
            </div>
            <div className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white">
              {readyOrders.length} prete{readyOrders.length > 1 ? 's' : ''}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {readyOrders.map((order) => (
              <div key={order.id} className="rounded-[1.3rem] border border-emerald-200 bg-white px-4 py-3">
                <p className="font-semibold text-forest">{order.tableLabel}</p>
                <p className="mt-1 text-sm text-ink/65">{order.customerName} · {order.items.length} article{order.items.length > 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display text-forest flex items-center gap-3 mb-2">
            <Users size={32} className="text-gold" />
            Service & Réservations
          </h2>
          <p className="text-forest/40">Gérez les arrivées et le suivi des tables</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-display text-clay">{filteredReservations.length}</p>
          <p className="text-[10px] font-bold text-forest/30 uppercase tracking-widest">Réservations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left: Reservations List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40" />
              <input
                type="text"
                placeholder="Nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-forest/10 focus:ring-2 ring-gold transition-all font-bold text-sm outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 rounded-xl bg-white border border-forest/10 font-bold text-sm outline-none focus:ring-2 ring-gold transition-all"
            >
              <option value="all">Tous statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="seated">Installée</option>
              <option value="completed">Terminée</option>
            </select>
          </div>

          {/* Reservations List */}
          <div className="space-y-3">
            {filteredReservations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-[2rem] border border-forest/5">
                <AlertCircle size={40} className="mx-auto text-forest/10 mb-4" />
                <p className="text-forest/40">Aucune réservation</p>
              </div>
            ) : (
              filteredReservations.map(reservation => {
                const resTable = getReservationTable(reservation.id);
                const resOrder = resTable ? getReservationOrder(resTable.id) : null;
                const statusColor = getStatusColor(reservation.status);
                
                return (
                  <button
                    key={reservation.id}
                    onClick={() => setSelectedReservation(reservation)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedReservation?.id === reservation.id
                        ? 'border-gold bg-gold/5'
                        : 'border-forest/5 hover:border-forest/10 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-forest truncate">{reservation.guestName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusColor.bg} ${statusColor.text}`}>
                            {statusColor.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-[11px] font-bold text-forest/40 mb-3">
                          <div className="flex items-center gap-1">
                            <Users size={12} /> {reservation.guests} couverts
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(reservation.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={12} /> {reservation.preferredZone || 'N/A'}
                          </div>
                        </div>

                        {resTable && (
                          <div className={`p-2 rounded-lg text-xs font-bold flex items-center gap-2 mb-2 ${
                            resOrder ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            <MapPinIcon size={12} />
                            Table {resTable.label} {resOrder && `• ${resOrder.items.length} plats • ${resOrder.status.replace(/_/g, ' ')}`}
                          </div>
                        )}
                      </div>

                      <ChevronRight size={20} className="text-forest/30 shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Details Panel */}
        <div className="lg:col-span-1">
          {selectedReservation ? (
            <div className="bg-white rounded-[2rem] border border-forest/5 p-6 sticky top-8 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-forest/40 uppercase tracking-widest mb-3">Détails Réservation</p>
                
                {/* Guest Info */}
                <div className="space-y-4 mb-6 pb-6 border-b border-forest/5">
                  <div className="flex items-start gap-3">
                    <Users size={16} className="text-forest/40 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-forest/40 uppercase">Nom</p>
                      <p className="font-bold text-forest text-sm truncate">{selectedReservation.guestName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Smartphone size={16} className="text-forest/40 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-forest/40 uppercase">Téléphone</p>
                      <p className="font-bold text-forest text-sm">{selectedReservation.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-forest/40 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-forest/40 uppercase">Email</p>
                      <p className="font-bold text-forest text-sm truncate">{selectedReservation.email}</p>
                    </div>
                  </div>
                </div>

                {/* Status & Table */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-forest/40 uppercase mb-2">Statut</p>
                    <div className={`px-4 py-3 rounded-lg text-sm font-bold text-center ${getStatusColor(selectedReservation.status).bg} ${getStatusColor(selectedReservation.status).text}`}>
                      {getStatusColor(selectedReservation.status).label}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-forest/40 uppercase mb-2">Assigner Table</p>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onAssignTable(selectedReservation.id, e.target.value);
                          setSelectedReservation({ ...selectedReservation, tableId: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-forest/10 bg-white text-sm font-bold outline-none focus:ring-2 ring-gold"
                    >
                      <option value="">-- Choisir une table --</option>
                      {tables.filter(t => t.status === 'available' || t.activeReservationId === selectedReservation.id).map(t => (
                        <option key={t.id} value={t.id}>
                          Table {t.label} ({t.seats} couverts) - {t.zone}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedReservation.notes && (
                <div className="pb-6 border-t border-forest/5 pt-6">
                  <p className="text-[10px] font-bold text-forest/40 uppercase mb-2">Notes</p>
                  <p className="text-sm text-forest/70 italic">{selectedReservation.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-forest/5 pt-6 space-y-3">
                {selectedReservation.status !== 'completed' && selectedReservation.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      const nextStatus = getNextStatus(selectedReservation.status);
                      onReservationStatusChange(selectedReservation.id, nextStatus);
                      if (nextStatus === 'completed') {
                        // Auto-cleanup table
                        const resTable = getReservationTable(selectedReservation.id);
                        if (resTable) {
                          onTableStatusChange(resTable.id, 'cleaning');
                        }
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-gold to-clay text-forest font-bold uppercase tracking-widest text-xs shadow-lg shadow-gold/20 hover:scale-105 transition-all"
                  >
                    {selectedReservation.status === 'pending' && 'Confirmer la reservation'}
                    {selectedReservation.status === 'confirmed' && 'Confirmer la presence et installer'}
                    {selectedReservation.status === 'seated' && 'Terminer le service'}
                  </button>
                )}

                {selectedReservation.status === 'completed' && (
                  <button
                    onClick={() => onReservationStatusChange(selectedReservation.id, 'pending')}
                    className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                  >
                    ↺ Réouvrir Réservation
                  </button>
                )}

                {selectedReservation.status !== 'cancelled' && (
                  <button
                    onClick={() => onReservationStatusChange(selectedReservation.id, 'cancelled')}
                    className="w-full py-3 rounded-xl border-2 border-rose-200 text-rose-600 font-bold uppercase tracking-widest text-xs hover:bg-rose-50 transition-all"
                  >
                    ✗ Annuler Réservation
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-forest/5 p-6 text-center py-12">
              <Eye size={40} className="mx-auto text-forest/10 mb-4" />
              <p className="text-forest/40 font-bold">Sélectionnez une réservation</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Tables with Orders */}
      <div className="bg-white rounded-[2rem] border border-forest/5 p-8">
        <h3 className="font-display text-xl text-forest mb-6 flex items-center gap-3">
          <MapPin size={24} className="text-gold" />
          Tables Actives avec Commandes
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tables
            .filter(t => t.activeReservationId || t.activeOrderId || t.status === 'occupied')
            .map(table => {
              const reservation = reservations.find(r => r.id === table.activeReservationId);
              const order = orders.find(o => o.id === table.activeOrderId);
              
              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTable?.id === table.id
                      ? 'border-gold bg-gold/5'
                      : 'border-forest/5 hover:border-forest/10'
                  } bg-white`}
                >
                  <p className="font-display text-2xl text-forest mb-2">{table.label}</p>
                  <p className="text-xs font-bold text-forest/40 uppercase mb-3">{table.zone}</p>

                  {reservation && (
                    <div className="mb-3 pb-3 border-b border-forest/5 space-y-1">
                      <p className="text-xs font-bold text-forest/60">{reservation.guestName}</p>
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Users size={10} /> {reservation.guests} couverts
                      </p>
                    </div>
                  )}

                  {order && (
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700 text-[11px] font-bold">
                      <p>📋 {order.items.length} article{order.items.length > 1 ? 's' : ''}</p>
                      <p className="text-blue-600 mt-1 flex items-center gap-1">
                        <DollarSign size={10} />
                        {order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
