import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../lib/api';
import {
  AuthUser,
  CreateMenuItemPayload,
  CreateStaffPayload,
  CreateTablePayload,
  DashboardSummary,
  MenuCategory,
  NotificationItem,
  Order,
  Payment,
  Reservation,
  RestaurantTable,
  TableStatus,
  UserRole
} from '../types/management';
import { useAuth } from './AuthContext';
import { AccountMenu, UtilityView } from '../components/management/AccountMenu';
import { FloorPlanBoard } from '../components/management/FloorPlanBoard';
import { FloorPlanConfig } from '../components/management/FloorPlanConfig';
import { ServiceReservations } from '../components/management/ServiceReservations';
import { TeamManagement } from '../components/management/TeamManagement';
import { KitchenMenu } from '../components/management/KitchenMenu';
import { NotificationCenter } from '../components/management/NotificationCenter';
import { StatusBadge } from '../components/management/StatusBadge';
import { ToastItem, ToastStack } from '../components/management/ToastStack';
import { 
  FileText, User, Settings as SettingsIcon, LogOut, Package, 
  Users, Plus, LayoutGrid, CheckCircle2, TrendingUp, 
  DollarSign, Calendar, Clock, ChevronRight, Menu as MenuIcon, X, Utensils 
} from 'lucide-react';

type ViewKey = 'overview' | 'tables' | 'service' | 'kitchen' | 'cashier' | 'team';
type Flash = { type: 'success' | 'error'; text: string } | null;

const money = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
const when = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export function ManagementPage() {
  const { token, user, logout, refreshUser } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kitchenTickets, setKitchenTickets] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<AuthUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeView, setActiveView] = useState<ViewKey>('overview');
  const [utilityView, setUtilityView] = useState<UtilityView>('dashboard');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [invoiceMode, setInvoiceMode] = useState<{order: Order} | null>(null);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: user?.address || '' });
  const [menuForm, setMenuForm] = useState<CreateMenuItemPayload>({ category: 'Plats', name: '', description: '', price: 0, available: true, tags: [], image: '' });
  const [paymentForm, setPaymentForm] = useState({ orderId: '', amount: 0, method: 'cash' });

  useEffect(() => {
    if (user) setProfileForm({ name: user.name, email: user.email, phone: user.phone || '', address: user.address || '' });
  }, [user]);

  useEffect(() => {
    if (!token || !user) return;
    loadData();
    const interval = setInterval(loadData, 5000); 
    return () => clearInterval(interval);
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) return;

    const socketUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api').replace(/\/api$/, '');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    const pushToast = (item: ToastItem) => {
      setToasts((current) => [item, ...current].slice(0, 4));
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== item.id));
      }, 4500);
    };

    socket.on('notification', (notification: NotificationItem) => {
      setNotifications((current) => [notification, ...current].slice(0, 20));
      pushToast({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        tone: notification.type === 'order' ? 'warning' : 'info'
      });
    });

    socket.on('order_status', (payload: { orderId: string; status: Order['status']; tableLabel: string }) => {
      const tone = payload.status === 'ready' ? 'success' : payload.status === 'in_preparation' ? 'warning' : 'info';
      const message =
        payload.status === 'ready'
          ? `${payload.tableLabel} est prete. Le serveur peut venir recuperer la commande.`
          : payload.status === 'in_preparation'
            ? `${payload.tableLabel} est en preparation en cuisine.`
            : `${payload.tableLabel} a change de statut: ${payload.status.replace(/_/g, ' ')}.`;

      pushToast({
        id: `${payload.orderId}-${payload.status}-${Date.now()}`,
        title: 'Flux service en direct',
        message,
        tone
      });
      void loadData();
    });

    socket.on('refresh_dashboard', () => {
      void loadData();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  const menuItems = useMemo(() => menu.flatMap((category) => category.items), [menu]);
  const activeOrders = useMemo(() => orders.filter((o) => o.status !== 'closed'), [orders]);
  const pendingRes = useMemo(() => reservations.filter((r) => r.status === 'pending' || r.status === 'confirmed'), [reservations]);

  const canView = (role: UserRole, view: ViewKey) => ({
    overview: true,
    tables: ['super_admin', 'admin', 'server'],
    service: ['super_admin', 'admin', 'server'],
    kitchen: ['super_admin', 'admin', 'chef'],
    cashier: ['super_admin', 'admin', 'cashier'],
    team: ['super_admin', 'admin']
  }[view] || false);

  const visibleViews = useMemo(() => [
    { key: 'overview', label: 'Dashboard', icon: LayoutGrid },
    { key: 'tables', label: 'Plan de salle', icon: Calendar },
    { key: 'service', label: 'Service & Reservations', icon: Users },
    { key: 'kitchen', label: 'Cuisine & Menu', icon: Package },
    { key: 'cashier', label: 'Caisse & Facturation', icon: DollarSign },
    { key: 'team', label: 'Equipe', icon: SettingsIcon }
  ].filter((v) => user && canView(user.role, v.key as ViewKey)), [user]);

  async function loadData() {
    if (!token || !user) return;
    try {
      const [dash, menuData, tableData, resData, ordData, kitData, payData, staffData, notifData] = await Promise.all([
        api.dashboard(token),
        api.menu(),
        api.tables(token),
        canView(user.role, 'service') ? api.reservations(token) : Promise.resolve([] as Reservation[]),
        api.orders(token),
        canView(user.role, 'kitchen') ? api.kitchen(token) : Promise.resolve([] as Order[]),
        canView(user.role, 'cashier') || user.role === 'super_admin' || user.role === 'admin'
          ? api.payments(token)
          : Promise.resolve([] as Payment[]),
        canView(user.role, 'team') ? api.staff(token) : Promise.resolve([] as AuthUser[]),
        api.notifications(token)
      ]);
      setSummary(dash); setMenu(menuData); setTables(tableData); setReservations(resData);
      setOrders(ordData); setKitchenTickets(kitData); setPayments(payData);
      setStaff(staffData); setNotifications(notifData);
    } catch (e) {}
  }

  async function act(task: () => Promise<void>, success: string) {
    setFlash(null);
    try { await task(); setFlash({ type: 'success', text: success }); await loadData(); }
    catch (e) { setFlash({ type: 'error', text: e instanceof Error ? e.message : 'Echec' }); }
  }

  if (!user || !token) return null;
  const authToken = token;

  return (
    <main className="min-h-screen bg-[#f8f5f0] text-forest font-sans selection:bg-gold/30">
      <ToastStack items={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-[#0f1d18] -z-10" />

      {/* Top Navigation Bar */}
      <header className="px-6 py-6 border-b border-white/10 bg-forest/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-white">
              <MenuIcon size={24} />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/80">Premium Management</p>
              <h1 className="text-xl font-display text-white tracking-wide">Hotel Cactus <span className="text-gold/60">•</span> {visibleViews.find(v => v.key === activeView)?.label}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Link to="/" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                Aller au site
             </Link>
             <NotificationCenter 
               notifications={notifications} 
               open={notifOpen} 
               onToggle={() => { setNotifOpen(!notifOpen); setAccountOpen(false); }} 
               onRead={(id) => api.markNotificationRead(id, authToken)} 
               onReadAll={() => {
                 notifications.filter(n => !n.read).forEach(n => api.markNotificationRead(n.id, authToken));
                 loadData();
               }}
               onNavigate={(type) => {
                 setNotifOpen(false);
                 switch(type) {
                   case 'reservation': setActiveView('service'); break;
                   case 'order': setActiveView('kitchen'); break;
                   case 'payment': setActiveView('cashier'); break;
                   case 'table': setActiveView('tables'); break;
                   case 'staff': setActiveView('team'); break;
                   default: setActiveView('overview');
                 }
               }}
             />
             <AccountMenu user={user} open={accountOpen} onToggle={() => { setAccountOpen(!accountOpen); setNotifOpen(false); }} onSelect={(v) => { setUtilityView(v); setActiveView('overview'); setAccountOpen(false); }} onLogout={logout} />
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:sticky lg:top-32 lg:flex flex-col gap-2 p-6 rounded-[2.5rem] bg-white shadow-xl shadow-forest/5 border border-forest/5">
             {visibleViews.map((view) => (
                <button 
                  key={view.key} 
                  onClick={() => { setActiveView(view.key as ViewKey); setUtilityView('dashboard'); }}
                  className={['group flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all', (utilityView === 'dashboard' && activeView === view.key) ? 'bg-forest text-white shadow-lg' : 'text-forest/40 hover:bg-forest/5 hover:text-forest'].join(' ')}
                >
                  <view.icon size={20} className={(utilityView === 'dashboard' && activeView === view.key) ? 'text-gold' : 'text-forest/20 group-hover:text-forest/40'} />
                  {view.label}
                  {(utilityView === 'dashboard' && activeView === view.key) && <ChevronRight size={16} className="ml-auto text-gold/50" />}
                </button>
             ))}
             <div className="mt-10 pt-6 border-t border-forest/5">
                <button onClick={logout} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-rose-500/60 hover:bg-rose-500/5 hover:text-rose-600 transition-all">
                  <LogOut size={20} />
                  Déconnexion
                </button>
             </div>
          </aside>

          {/* Main Content Area */}
          <div className="min-w-0 space-y-8">
            {flash && (
              <div className={['p-4 rounded-2xl font-bold text-white shadow-lg animate-in fade-in slide-in-from-top-4', flash.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'].join(' ')}>
                {flash.text}
              </div>
            )}

            {/* Dashboard Overview */}
            {activeView === 'overview' && utilityView === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: 'C.A Journalier', value: money(summary?.revenue || 0), icon: DollarSign, color: 'bg-emerald-500', hint: 'Evolution +12%' },
                    { label: 'Commandes Actives', value: summary?.openOrders || 0, icon: Utensils, color: 'bg-gold', hint: 'Salle occupée à 60%' },
                    { label: 'Réservations du jour', value: summary?.pendingReservations || 0, icon: Calendar, color: 'bg-clay', hint: '3 VIP ce soir' },
                    { label: 'Staff Présent', value: summary?.activeStaff || 0, icon: Users, color: 'bg-forest', hint: 'Equipe de garde' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-forest/5 hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start">
                        <div className={['p-3 rounded-2xl text-white shadow-lg', stat.color].join(' ')}>
                          <stat.icon size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-forest/30 uppercase tracking-widest">{stat.hint}</span>
                      </div>
                      <p className="mt-6 text-sm font-bold text-forest/40 uppercase tracking-widest">{stat.label}</p>
                      <p className="mt-1 text-4xl font-display text-forest">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid xl:grid-cols-[1fr_400px] gap-8">
                  {/* Revenue Chart - Simplified SVG */}
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-forest/5">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-2xl font-display text-forest">Performance Financière</h3>
                        <p className="text-sm text-forest/40">Suivi des encaissements des 7 derniers jours</p>
                      </div>
                      <TrendingUp className="text-emerald-500" />
                    </div>
                    
                    <div className="relative h-64 w-full flex items-end justify-between px-2 pt-8">
                       {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1].map((h, i) => (
                         <div key={i} className="relative group w-[8%]">
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-forest text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                             {money(h * 500000)}
                           </div>
                           <div 
                             className="w-full bg-forest/5 rounded-t-xl transition-all group-hover:bg-gold cursor-pointer" 
                             style={{ height: `${h * 100}%` }}
                           />
                           <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-forest/30 uppercase">Jour {i+1}</p>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-forest/5">
                    <h3 className="text-xl font-display text-forest mb-6">Activité Récente</h3>
                    <div className="space-y-6">
                      {notifications.slice(0, 5).map(notif => (
                        <div key={notif.id} className="flex gap-4">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-sand/50 flex items-center justify-center text-forest/40">
                             <Clock size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-tight">{notif.title}</p>
                            <p className="text-xs text-forest/40 mt-1 line-clamp-1">{notif.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'tables' && (
               <FloorPlanBoard 
                tables={tables} reservations={pendingRes} orders={activeOrders} 
                selectedTableId={selectedTableId} onSelect={setSelectedTableId}
                token={authToken}
                onLoadData={loadData}
                onReservationDrop={(rid, tid) => api.assignReservationTable(rid, tid, authToken).then(loadData)}
                onOrderDrop={(oid, tid) => api.moveOrderTable(oid, tid, authToken).then(loadData)}
                onStatusChange={(tid, s) => api.updateTableStatus(tid, s, authToken).then(loadData)}
               onUpdateTablePosition={(tid, posX, posY) => api.updateTable(tid, { posX, posY }, authToken).then(loadData)}
                menu={menu}
                onCreateOrder={(payload) => api.createOrder({ ...payload, serverId: user.id }, authToken).then(loadData)}
                onUpdateOrderStatus={(orderId, status) => api.updateOrderStatus(orderId, status, authToken).then(loadData)}
               />
            )}

            {/* Other views handled similarly... */}
            {activeView === 'kitchen' && (
               <KitchenMenu
                 kitchenTickets={kitchenTickets}
                 menu={menu}
                 onUpdateOrderStatus={(id, status) => api.updateOrderStatus(id, status, authToken).then(loadData)}
                 onCreateMenuItem={(data) => api.createMenuItem(data, authToken).then(loadData)}
                 onUpdateMenuItemAvailability={(id, available) => api.updateMenuItemAvailability(id, available, authToken).then(loadData)}
                 onDeleteMenuItem={(id) => api.deleteMenuItem(id, authToken).then(loadData)}
               />
            )}

            {activeView === 'service' && (
               <ServiceReservations
                 reservations={reservations}
                 tables={tables}
                 orders={orders}
                 payments={payments}
                 menu={menu}
                 onReservationStatusChange={(id, status) => api.updateReservationStatus(id, status, authToken).then(loadData)}
                 onAssignTable={(resId, tableId) => api.assignReservationTable(resId, tableId, authToken).then(loadData)}
                 onTableStatusChange={(tableId, status) => api.updateTableStatus(tableId, status, authToken).then(loadData)}
                 onCreatePayment={(orderId, amount) => api.createPayment({ orderId, amount, method: 'cash', processedBy: user.id }, authToken).then(loadData)}
                 onCreateOrder={(payload) => api.createOrder({ ...payload, serverId: user.id }, authToken).then(loadData)}
                 onUpdateOrderStatus={(id, status) => api.updateOrderStatus(id, status, authToken).then(loadData)}
               />
            )}

            {activeView === 'team' && user && (
               <TeamManagement
                 staff={staff}
                 currentUser={user}
                 onCreateStaff={(data) => api.createStaff(data, authToken).then(loadData)}
                 onUpdateStaff={(id, data) => api.updateStaff(id, data, authToken).then(loadData)}
                 onDeleteStaff={(id) => {
                   if (confirm('Êtes-vous sûr ?')) {
                     return api.deleteStaff(id, authToken).then(loadData)
                   }
                   return Promise.resolve()
                 }}
                 onResetPassword={(id, password) => api.resetPassword(id, password, authToken)}
               />
            )}

            {activeView === 'cashier' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-4xl font-display text-forest">Caisse & Facturation</h2>
                  <div className="bg-emerald-500/10 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                    Caisse Ouverte
                  </div>
                </div>
                
                <div className="grid xl:grid-cols-[1fr_400px] gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-forest/40 uppercase tracking-widest ml-4">En attente de paiement</h3>
                    <div className="grid gap-4">
                      {activeOrders.map(order => (
                        <div key={order.id} className="bg-white p-8 rounded-[2rem] border border-forest/5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                          <div>
                            <p className="text-lg font-display text-forest">Table {order.tableLabel} — {order.customerName}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-bold text-forest/40 uppercase">{when(order.createdAt)}</span>
                              <span className="h-1 w-1 rounded-full bg-forest/10" />
                              <span className="text-sm font-black text-clay">{money(order.total)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => setInvoiceMode({order})} className="px-6 py-3 rounded-full border border-forest/20 text-xs font-bold uppercase tracking-widest hover:bg-forest hover:text-white transition-all">
                               Détails / Facture
                             </button>
                             <button onClick={() => setPaymentForm({...paymentForm, orderId: order.id, amount: order.total})} className="px-6 py-3 rounded-full bg-clay text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-clay/20 hover:scale-105 active:scale-95 transition-all">
                               Encaisser
                             </button>
                          </div>
                        </div>
                      ))}
                      {activeOrders.length === 0 && (
                        <div className="p-20 text-center bg-white rounded-[2rem] border border-dashed border-forest/10">
                          <p className="text-forest/30 font-display italic">Aucune commande en attente de paiement</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] border border-forest/5 shadow-sm h-fit sticky top-32">
                    <h3 className="text-xl font-display text-forest mb-6">Enregistrer Paiement</h3>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); api.createPayment({ ...paymentForm, processedBy: user.id }, authToken).then(loadData); }}>
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-forest/40 ml-2">Commande</label>
                         <select value={paymentForm.orderId} onChange={e => { const o = orders.find(x => x.id === e.target.value); setPaymentForm({...paymentForm, orderId: e.target.value, amount: o?.total || 0})}} className="w-full bg-[#f8f5f0] border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 ring-gold outline-none" required>
                            <option value="">Sélectionner une table...</option>
                            {activeOrders.map(o => <option key={o.id} value={o.id}>Table {o.tableLabel} ({money(o.total)})</option>)}
                         </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-forest/40 ml-2">Montant</label>
                            <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} className="w-full bg-[#f8f5f0] border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 ring-gold outline-none" required />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-forest/40 ml-2">Méthode</label>
                            <select value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} className="w-full bg-[#f8f5f0] border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 ring-gold outline-none">
                              <option value="cash">ESPECES</option><option value="card">CARTE</option><option value="mobile_money">MOBILE</option>
                            </select>
                         </div>
                       </div>
                       <button type="submit" className="w-full py-5 rounded-full bg-forest text-white font-bold uppercase tracking-widest shadow-xl shadow-forest/20 mt-4 hover:bg-clay transition-all">
                          Confirmer l'encaissement
                       </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
            
            {utilityView === 'profile' && (
               <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-forest/5 max-w-4xl">
                  <div className="flex justify-between items-start mb-12 pb-8 border-b border-forest/5">
                     <div>
                        <h2 className="text-3xl font-display text-forest mb-2">Mon Profil</h2>
                        <p className="text-forest/40">Gérez vos informations personnelles et vos coordonnées.</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-forest/30">Fonction</p>
                        <p className="text-xl font-display text-forest capitalize mt-1">{user.role === 'super_admin' ? 'Direction Générale' : user.role === 'admin' ? 'Gérant' : user.role === 'server' ? 'Serveur' : user.role === 'chef' ? 'Chef de Cuisine' : 'Caissier'}</p>
                     </div>
                  </div>
                  
                  <form className="space-y-8" onSubmit={async (e) => { 
                     e.preventDefault(); 
                     const result = await api.updateProfile({ name: profileForm.name, phone: profileForm.phone, address: profileForm.address }, authToken);
                     if (result) {
                       await refreshUser();
                       setFlash({ type: 'success', text: 'Profil mis à jour avec succès' });
                     }
                  }}>
                     {/* Section Informations Identité */}
                     <fieldset className="space-y-4 pb-8 border-b border-forest/5">
                        <legend className="text-xs font-black uppercase tracking-[0.3em] text-forest/40 mb-6">📋 Identité</legend>
                        <div className="grid sm:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-forest/40 ml-2 flex items-center gap-2">
                                 <CheckCircle2 size={14} className="text-emerald-500" />
                                 Nom Complet
                              </label>
                              <input 
                                 value={profileForm.name} 
                                 onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                                 placeholder="Votre nom complet"
                                 className="w-full bg-gradient-to-r from-[#f8f5f0] to-white border border-forest/5 rounded-2xl p-4 font-bold text-sm outline-none focus:ring-2 ring-gold transition-all" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-forest/40 ml-2 flex items-center gap-2">
                                 <CheckCircle2 size={14} className="text-emerald-500" />
                                 Email Professionnel
                              </label>
                              <input 
                                 value={profileForm.email} 
                                 readOnly 
                                 className="w-full bg-[#f8f5f0]/50 border border-forest/5 rounded-2xl p-4 font-bold text-sm outline-none cursor-not-allowed text-forest/30" 
                              />
                           </div>
                        </div>
                     </fieldset>

                     {/* Section Coordonnées */}
                     <fieldset className="space-y-4 pb-8 border-b border-forest/5">
                        <legend className="text-xs font-black uppercase tracking-[0.3em] text-forest/40 mb-6">📞 Coordonnées</legend>
                        <div className="grid sm:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-forest/40 ml-2">Téléphone</label>
                              <input 
                                 type="tel"
                                 value={profileForm.phone} 
                                 onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
                                 placeholder="+229 XX XX XX XX"
                                 className="w-full bg-gradient-to-r from-[#f8f5f0] to-white border border-forest/5 rounded-2xl p-4 font-bold text-sm outline-none focus:ring-2 ring-gold transition-all" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-forest/40 ml-2">Adresse</label>
                              <input 
                                 value={profileForm.address} 
                                 onChange={e => setProfileForm({...profileForm, address: e.target.value})} 
                                 placeholder="Votre adresse complète"
                                 className="w-full bg-gradient-to-r from-[#f8f5f0] to-white border border-forest/5 rounded-2xl p-4 font-bold text-sm outline-none focus:ring-2 ring-gold transition-all" 
                              />
                           </div>
                        </div>
                     </fieldset>

                     {/* Action Buttons */}
                     <div className="flex gap-4 pt-4">
                        <button 
                           type="submit" 
                           className="flex-1 py-4 rounded-full bg-gradient-to-r from-gold to-clay text-forest font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-all"
                        >
                           ✓ Enregistrer les modifications
                        </button>
                        <button 
                           type="button"
                           onClick={() => setProfileForm({ name: user.name, email: user.email, phone: user.phone || '', address: user.address || '' })}
                           className="px-8 py-4 rounded-full border-2 border-forest/20 text-forest font-bold uppercase tracking-widest hover:bg-forest/5 transition-all"
                        >
                           Annuler
                        </button>
                     </div>
                  </form>
               </div>
            )}

            {utilityView === 'settings' && (
               <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-forest/5 max-w-4xl">
                  <h2 className="text-3xl font-display text-forest mb-2">⚙️ Paramètres</h2>
                  <p className="text-forest/40 mb-12">Configurez les préférences de votre établissement et vos permissions.</p>
                  
                  <div className="grid gap-8">
                     {/* Restaurant Settings */}
                     <div className="space-y-6 pb-8 border-b border-forest/5">
                        <h3 className="text-xl font-display text-forest flex items-center gap-2">
                           🏪 Informations Établissement
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-forest/40">Nom du Restaurant</label>
                              <input readOnly value="Hotel Cactus" className="w-full bg-[#f8f5f0]/50 border border-forest/5 rounded-2xl p-4 text-sm font-bold text-forest/40 cursor-not-allowed" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-forest/40">Lieu / Ville</label>
                              <input readOnly value="Cotonou, Bénin" className="w-full bg-[#f8f5f0]/50 border border-forest/5 rounded-2xl p-4 text-sm font-bold text-forest/40 cursor-not-allowed" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-forest/40">Zone Active</label>
                           <input placeholder="Ex: Salle à manger, Terrasse..." className="w-full bg-gradient-to-r from-[#f8f5f0] to-white border border-forest/5 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-gold" />
                        </div>
                     </div>

                     {/* Preferences */}
                     <div className="space-y-6 pb-8 border-b border-forest/5">
                        <h3 className="text-xl font-display text-forest flex items-center gap-2">
                           🔔 Notifications & Alertes
                        </h3>
                        <div className="space-y-4">
                           {[
                              { label: 'Alertes de résservation', desc: 'Recevoir une notification pour chaque nouvelle réservation' },
                              { label: 'Alertes de commande', desc: 'Notifié quand un ticket rentre en cuisine' },
                              { label: 'Alertes de paiement', desc: 'Confirmation demandes encaissement' },
                              { label: 'Alertes équipe', desc: 'Notification sur arrivée/départ du staff' }
                           ].map((item, i) => (
                              <label key={i} className="flex items-center gap-3 p-4 rounded-xl border border-forest/5 hover:bg-forest/2 cursor-pointer transition-all">
                                 <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-forest/20 text-gold accent-gold" />
                                 <span className="flex-1">
                                    <p className="font-bold text-forest text-sm">{item.label}</p>
                                    <p className="text-xs text-forest/40">{item.desc}</p>
                                 </span>
                              </label>
                           ))}
                        </div>
                     </div>

                     {/* Permissions by Role */}
                     <div className="space-y-6">
                        <h3 className="text-xl font-display text-forest flex items-center gap-2">
                           🔐 Accès et Permissions
                        </h3>
                        <div className="bg-sand/20 rounded-2xl p-6 border border-forest/5">
                           <p className="text-sm font-bold text-forest mb-4">
                              Votre profil: <span className="text-gold capitalize">{user.role === 'super_admin' ? 'Direction Générale' : user.role === 'admin' ? 'Gérant' : user.role === 'server' ? 'Serveur' : user.role === 'chef' ? 'Chef de Cuisine' : 'Caissier'}</span>
                           </p>
                           <div className="grid gap-2 text-xs text-forest/60">
                              {user.role === 'super_admin' ? (
                                 <>
                                    <p>✓ Accès complet à tous les modules</p>
                                    <p>✓ Gestion des administrateurs</p>
                                    <p>✓ Configuration système</p>
                                    <p>✓ Rapports financiers complets</p>
                                 </>
                              ) : user.role === 'admin' ? (
                                 <>
                                    <p>✓ Gestion complète du restaurant</p>
                                    <p>✓ Création/suppression d'équipes</p>
                                    <p>✓ Gestion menu et tables</p>
                                    <p>✓ Suivi des commandes</p>
                                 </>
                              ) : user.role === 'server' ? (
                                 <>
                                    <p>✓ Gestion réservations</p>
                                    <p>✓ Prise de commandes</p>
                                    <p>✓ Consultation menu</p>
                                 </>
                              ) : user.role === 'chef' ? (
                                 <>
                                    <p>✓ Accès aux tickets cuisine</p>
                                    <p>✓ Gestion des stocks</p>
                                    <p>✓ Modification menu/disponibilité</p>
                                 </>
                              ) : (
                                 <>
                                    <p>✓ Enregistrement paiements</p>
                                    <p>✓ Générations factures</p>
                                    <p>✓ Consultation commandes</p>
                                 </>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4 mt-12 pt-8 border-t border-forest/5">
                     <button className="flex-1 py-4 rounded-full bg-gradient-to-r from-gold to-clay text-forest font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-all">
                        Sauvegarder les paramètres
                     </button>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Sidebar - Mobile only */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-[#0f1d18]/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute top-0 left-0 bottom-0 w-[300px] bg-white p-8 space-y-4 animate-in slide-in-from-left duration-300">
             <div className="flex justify-between items-center mb-8">
                <h2 className="font-display text-2xl">Menu</h2>
                <button onClick={() => setSidebarOpen(false)}><X /></button>
             </div>
             {visibleViews.map((view) => (
                <button 
                  key={view.key} 
                  onClick={() => { setActiveView(view.key as ViewKey); setUtilityView('dashboard'); setSidebarOpen(false); }}
                  className={['flex w-full items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold', (activeView === view.key) ? 'bg-forest text-white' : 'text-forest/40'].join(' ')}
                >
                  <view.icon size={18} />
                  {view.label}
                </button>
             ))}
          </aside>
        </div>
      )}

      {/* Professional Invoice Modal */}
      {invoiceMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f1d18]/90 backdrop-blur-md">
           <div className="w-full max-w-[600px] bg-white rounded-[3rem] p-0 overflow-hidden shadow-2xl">
              <div className="bg-[#0f1d18] p-10 text-white text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl -mr-16 -mt-16" />
                 <p className="text-gold text-xs font-black uppercase tracking-[0.4em] mb-2">Note de Détails</p>
                 <h3 className="font-display text-4xl mb-2 tracking-wide">Hotel Cactus</h3>
                 <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Cotonou, Bénin • +229 01 02 03 04</p>
              </div>

              <div className="p-10">
                 <div className="flex justify-between items-start mb-10 pb-6 border-b border-forest/5">
                    <div>
                       <p className="text-[10px] font-black text-forest/30 uppercase tracking-widest mb-1">Client / Table</p>
                       <p className="text-xl font-display text-forest">{invoiceMode.order.customerName || 'Client de Passage'}</p>
                       <p className="text-sm font-bold text-clay">Table {invoiceMode.order.tableLabel}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-forest/30 uppercase tracking-widest mb-1">Référence</p>
                       <p className="text-sm font-bold text-forest">#{invoiceMode.order.id.slice(0, 8).toUpperCase()}</p>
                       <p className="text-[10px] font-bold text-forest/40 mt-1">{when(invoiceMode.order.createdAt)}</p>
                    </div>
                 </div>

                 <div className="space-y-4 mb-10">
                    <div className="flex justify-between text-[10px] font-black text-forest/20 uppercase tracking-[0.2em] mb-4">
                       <span className="w-12">Qté</span>
                       <span className="flex-1 px-4">Désignation</span>
                       <span className="w-24 text-right">Total</span>
                    </div>
                    {invoiceMode.order.items.map((item, idx) => (
                       <div key={idx} className="flex justify-between text-sm items-center">
                          <span className="w-12 font-black text-forest/40">{item.quantity}</span>
                          <span className="flex-1 px-4 font-bold text-forest">{item.name}</span>
                          <span className="w-24 text-right font-black text-forest">{money(item.quantity * item.unitPrice)}</span>
                       </div>
                    ))}
                 </div>

                 <div className="space-y-3 pt-6 border-t-2 border-forest/10">
                    <div className="flex justify-between text-sm">
                       <span className="text-forest/40 font-bold">Sous-total</span>
                       <span className="font-bold text-forest">{money(invoiceMode.order.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-forest/40 font-bold">Net à payer</span>
                       <span className="text-2xl font-display text-clay">{money(invoiceMode.order.total)}</span>
                    </div>
                 </div>

                 <div className="mt-12 flex gap-4">
                    <button onClick={() => { window.print(); setInvoiceMode(null); }} className="flex-1 py-5 rounded-2xl bg-forest text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-forest/20 hover:scale-[1.02] transition-all">
                       Télécharger / Imprimer la facture
                    </button>
                    <button onClick={() => setInvoiceMode(null)} className="flex-1 py-5 rounded-2xl border border-forest/10 text-forest font-bold uppercase tracking-widest text-xs hover:bg-forest/5 transition-all">
                       Fermer
                    </button>
                 </div>

                 <p className="mt-8 text-center text-[10px] font-bold text-forest/20 uppercase tracking-widest">Merci de votre visite à l'Hotel Cactus</p>
              </div>
           </div>
        </div>
      )}
    </main>
  );
}
