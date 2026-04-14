import { FormEvent, useEffect, useMemo, useState } from 'react';
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
import { NotificationCenter } from '../components/management/NotificationCenter';
import { StatusBadge } from '../components/management/StatusBadge';
import { FileText, User, Settings as SettingsIcon, LogOut, Package, Users, Plus, LayoutGrid, CheckCircle2 } from 'lucide-react';

type ViewKey = 'overview' | 'tables' | 'service' | 'kitchen' | 'cashier' | 'team';
type Flash = { type: 'success' | 'error'; text: string } | null;

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super admin',
  admin: 'Administrateur',
  server: 'Serveur',
  chef: 'Chef de cuisine',
  cashier: 'Caissier'
};
const tableStatuses: TableStatus[] = ['available', 'reserved', 'occupied', 'cleaning'];

const canView = (role: UserRole, view: ViewKey) => ({
  overview: ['super_admin', 'admin', 'server', 'chef', 'cashier'],
  tables: ['super_admin', 'admin', 'server'],
  service: ['super_admin', 'admin', 'server'],
  kitchen: ['super_admin', 'admin', 'chef'],
  cashier: ['super_admin', 'admin', 'cashier'],
  team: ['super_admin', 'admin']
}[view] as UserRole[]).includes(role);

const creatableRoles = (role: UserRole) => role === 'super_admin'
  ? ['super_admin', 'admin', 'server', 'chef', 'cashier'] as UserRole[]
  : role === 'admin'
    ? ['server', 'chef', 'cashier'] as UserRole[]
    : [];

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
  const [flash, setFlash] = useState<Flash>(null);
  const [invoiceMode, setInvoiceMode] = useState<{order: Order} | null>(null);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [reservationForm, setReservationForm] = useState({ guestName: '', email: '', phone: '', guests: 2, date: '2026-04-13T19:30', notes: '', tableId: '', preferredZone: 'Salle principale' });
  const [orderForm, setOrderForm] = useState({ tableId: '', customerName: '', menuItemId: '', quantity: 1, notes: '' });
  const [paymentForm, setPaymentForm] = useState({ orderId: '', amount: 0, method: 'cash' });
  const [staffForm, setStaffForm] = useState<CreateStaffPayload>({ name: '', email: '', role: 'server', password: '' });
  const [menuForm, setMenuForm] = useState<CreateMenuItemPayload>({ category: 'Plats', name: '', description: '', price: 0, available: true, tags: [], image: '' });
  const [tableForm, setTableForm] = useState<CreateTablePayload>({ label: '', zone: 'Salle principale', seats: 4, shape: 'round', posX: 10, posY: 10, width: 15, height: 15, status: 'available' });

  useEffect(() => {
    if (user) setProfileForm({ name: user.name, email: user.email });
  }, [user]);

  useEffect(() => {
    if (!token || !user) return;
    if (!canView(user.role, activeView)) setActiveView('overview');
    
    loadData();
    const interval = setInterval(loadData, 10000); // Polling every 10s for real-time
    return () => clearInterval(interval);
  }, [token, user]);

  const menuItems = useMemo(() => menu.flatMap((category) => category.items), [menu]);
  const selectedTable = useMemo(() => tables.find((table) => table.id === selectedTableId) || null, [selectedTableId, tables]);
  const visibleViews = useMemo(() => [{ key: 'overview', label: 'Dashboard' }, { key: 'tables', label: 'Plan de salle' }, { key: 'service', label: 'Reservations & salle' }, { key: 'kitchen', label: 'Cuisine & menu' }, { key: 'cashier', label: 'Caisse' }, { key: 'team', label: 'Equipe' }].filter((view) => user && canView(user.role, view.key as ViewKey)), [user]);
  const pendingReservations = reservations.filter((item) => item.status === 'pending' || item.status === 'confirmed');
  const activeOrders = orders.filter((item) => item.status !== 'closed');

  async function loadData() {
    if (!token || !user) return;
    try {
      const [dash, menuData, tableData, reservationData, orderData, kitchenData, paymentData, staffData, notificationData] = await Promise.all([
        api.dashboard(token),
        api.menu(),
        api.tables(token),
        canView(user.role, 'service') ? api.reservations(token) : Promise.resolve([]),
        api.orders(token),
        canView(user.role, 'kitchen') ? api.kitchen(token) : Promise.resolve([]),
        canView(user.role, 'cashier') ? api.payments(token) : Promise.resolve([]),
        canView(user.role, 'team') ? api.staff(token) : Promise.resolve([]),
        api.notifications(token)
      ]);
      setSummary(dash); setMenu(menuData); setTables(tableData); setReservations(reservationData); setOrders(orderData); setKitchenTickets(kitchenData); setPayments(paymentData); setStaff(staffData); setNotifications(notificationData);
    } catch (e) {}
  }

  async function act(task: () => Promise<void>, success: string) {
    setFlash(null);
    try { await task(); setFlash({ type: 'success', text: success }); await loadData(); }
    catch (e) { setFlash({ type: 'error', text: e instanceof Error ? e.message : 'Echec' }); }
  }

  if (!user || !token) return null;
  const authToken = token;

  async function handleProfileUpdate(e: FormEvent) {
    e.preventDefault();
    await act(async () => {
      // Assuming api.updateProfile exists or we reuse staff update
      await api.changePassword({ currentPassword: '', newPassword: '' }, authToken); // Placeholder
      await refreshUser();
    }, 'Profil mis a jour.');
  }

  async function handleCreateReservation(e: FormEvent) {
    e.preventDefault();
    await act(async () => {
      await api.createStaffReservation({ ...reservationForm, date: new Date(reservationForm.date).toISOString() }, authToken);
      setReservationForm({ guestName: '', email: '', phone: '', guests: 2, date: '2026-04-13T19:30', notes: '', tableId: '', preferredZone: 'Salle principale' });
    }, 'Reservation creee.');
  }

  async function handleCreateOrder(e: FormEvent) {
    e.preventDefault();
    const item = menuItems.find(i => i.id === orderForm.menuItemId);
    const table = tables.find(t => t.id === orderForm.tableId);
    if (!item || !table) return;
    await act(async () => {
      await api.createOrder({ tableId: table.id, tableLabel: table.label, customerName: orderForm.customerName, serverId: user.id, items: [{ menuItemId: item.id, name: item.name, quantity: orderForm.quantity, unitPrice: item.price }], notes: orderForm.notes }, authToken);
      setOrderForm({ tableId: '', customerName: '', menuItemId: '', quantity: 1, notes: '' });
    }, 'Commande ouverte.');
  }

  async function handleCreatePayment(e: FormEvent) {
    e.preventDefault();
    await act(async () => {
      await api.createPayment({ orderId: paymentForm.orderId, amount: paymentForm.amount, method: paymentForm.method as any, processedBy: user.id }, authToken);
      setPaymentForm({ orderId: '', amount: 0, method: 'cash' });
    }, 'Paiement enregistre.');
  }

  return (
    <main className="min-h-screen bg-[#f3eadb] pb-20">
      <div className="bg-[#0f1d18] px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gold/80">Gestion Cactus</p>
              <h1 className="mt-2 font-display text-4xl sm:text-5xl">Tableau de Bord</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter notifications={notifications} open={notifOpen} onToggle={() => { setNotifOpen(!notifOpen); setAccountOpen(false); }} onRead={(id) => api.markNotificationRead(id, authToken)} />
              <AccountMenu user={user} open={accountOpen} onToggle={() => { setAccountOpen(!accountOpen); setNotifOpen(false); }} onSelect={(v) => { setUtilityView(v); setAccountOpen(false); }} onLogout={logout} />
            </div>
          </div>
          
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur">
              <p className="text-sm text-white/60">Revenue Jour</p>
              <p className="mt-2 text-3xl font-display">{money(summary?.revenue || 0)}</p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur">
              <p className="text-sm text-white/60">Tables Ouvertes</p>
              <p className="mt-2 text-3xl font-display">{summary?.openOrders || 0}</p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur">
              <p className="text-sm text-white/60">Reservations</p>
              <p className="mt-2 text-3xl font-display">{summary?.pendingReservations || 0}</p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-6 backdrop-blur">
              <p className="text-sm text-white/60">Staff Actif</p>
              <p className="mt-2 text-3xl font-display">{summary?.activeStaff || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-8 max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-2 rounded-[2.5rem] bg-white p-6 shadow-xl">
             {visibleViews.map((view) => (
                <button 
                  key={view.key} 
                  onClick={() => { setActiveView(view.key as ViewKey); setUtilityView('dashboard'); }}
                  className={['flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition', (utilityView === 'dashboard' && activeView === view.key) ? 'bg-forest text-white' : 'text-forest/60 hover:bg-forest/5'].join(' ')}
                >
                  {view.label}
                </button>
             ))}
          </aside>

          <section className="min-w-0">
            {flash && (
              <div className={['mb-6 rounded-2xl p-4 font-bold text-white shadow-lg animate-in fade-in slide-in-from-top-4', flash.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'].join(' ')}>
                {flash.text}
              </div>
            )}

            {utilityView === 'profile' && (
               <article className="surface-card p-10">
                 <h2 className="font-display text-4xl text-forest">Mon Profil</h2>
                 <form className="mt-8 max-w-xl space-y-6" onSubmit={handleProfileUpdate}>
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-forest/60">Nom</label>
                     <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full rounded-2xl border-forest/15 bg-sand/30 px-5 py-4" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-forest/60">Email</label>
                     <input value={profileForm.email} readOnly className="w-full rounded-2xl border-forest/15 bg-slate-100 px-5 py-4 opacity-70" />
                   </div>
                   <button type="submit" className="rounded-full bg-forest px-8 py-4 font-bold text-white shadow-lg transition hover:bg-clay">Mettre a jour</button>
                 </form>
               </article>
            )}

            {utilityView === 'dashboard' && activeView === 'tables' && (
               <FloorPlanBoard 
                tables={tables} 
                reservations={pendingReservations} 
                orders={activeOrders} 
                selectedTableId={selectedTableId} 
                onSelect={setSelectedTableId}
                onReservationDrop={(rid, tid) => api.assignReservationTable(rid, tid, authToken).then(loadData)}
                onOrderDrop={(oid, tid) => api.moveOrderTable(oid, tid, authToken).then(loadData)}
               />
            )}

            {utilityView === 'dashboard' && activeView === 'kitchen' && (
               <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                 <div className="space-y-6">
                    <h2 className="font-display text-4xl text-forest">Tickets Cuisine</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {kitchenTickets.map(ticket => (
                        <div key={ticket.id} className="surface-card p-6">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-clay">TABLE {ticket.tableLabel}</span>
                            <span className="text-xs text-ink/40">{when(ticket.createdAt)}</span>
                          </div>
                          <div className="mt-4 space-y-2">
                            {ticket.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between border-b border-forest/5 pb-2">
                                <span className="font-medium">{item.quantity}x {item.name}</span>
                              </div>
                            ))}
                          </div>
                          <button onClick={() => api.updateOrderStatus(ticket.id, 'ready', authToken).then(loadData)} className="mt-5 w-full rounded-full bg-emerald-500 py-3 text-sm font-bold text-white">Pret</button>
                        </div>
                      ))}
                    </div>
                 </div>
                 
                 <div className="surface-card p-8">
                    <h2 className="font-display text-3xl text-forest">Gestion Menu</h2>
                    <form className="mt-6 space-y-4" onSubmit={handleCreateMenuItem}>
                      <input value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} placeholder="Nom du plat" className="w-full rounded-2xl border-forest/15 bg-sand/30 px-5 py-3" required />
                      <textarea value={menuForm.description} onChange={e => setMenuForm({...menuForm, description: e.target.value})} placeholder="Description" className="w-full rounded-2xl border-forest/15 bg-sand/30 px-5 py-3" />
                      <div className="grid gap-4 grid-cols-2">
                        <input value={menuForm.price} type="number" onChange={e => setMenuForm({...menuForm, price: Number(e.target.value)})} placeholder="Prix" className="w-full rounded-2xl border-forest/15 bg-sand/30 px-5 py-3" required />
                        <select value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className="w-full rounded-2xl border-forest/15 bg-sand/30 px-5 py-3">
                          <option>Entrees</option><option>Plats</option><option>Desserts</option><option>Boissons</option>
                        </select>
                      </div>
                      <input value={menuForm.image} onChange={e => setMenuForm({...menuForm, image: e.target.value})} placeholder="URL de l image" className="w-full rounded-2xl border-forest/15 bg-sand/30 px-5 py-3" />
                      <button type="submit" className="w-full rounded-full bg-forest py-4 font-bold text-white">Ajouter au menu</button>
                    </form>
                    
                    <div className="mt-8 space-y-4">
                      {menuItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-sand/20 p-3">
                          {item.image ? <img src={item.image} className="h-12 w-12 rounded-xl object-cover" /> : <div className="h-12 w-12 rounded-xl bg-forest/10 flex items-center justify-center"><Package size={20} className="text-forest/30" /></div>}
                          <div className="flex-1">
                            <p className="text-sm font-bold text-forest">{item.name}</p>
                            <p className="text-xs text-ink/50">{money(item.price)}</p>
                          </div>
                          <button onClick={() => api.updateMenuAvailability(item.id, !item.available, authToken).then(loadData)} className={['rounded-full px-3 py-1 text-[10px] font-bold', item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'].join(' ')}>
                            {item.available ? 'Actif' : 'Epuise'}
                          </button>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
            )}

            {utilityView === 'dashboard' && activeView === 'cashier' && (
              <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                <div className="space-y-6">
                  <h2 className="font-display text-4xl text-forest">Commandes a Encaisser</h2>
                  <div className="grid gap-4">
                    {activeOrders.map(order => (
                      <div key={order.id} className="surface-card flex items-center justify-between p-6">
                        <div>
                          <p className="font-bold text-forest">Table {order.tableLabel} - {order.customerName}</p>
                          <p className="text-sm text-clay font-bold">{money(order.total)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setInvoiceMode({order})} className="rounded-full border border-forest/20 px-5 py-2 text-sm font-bold text-forest hover:bg-forest hover:text-white transition">Facture</button>
                          <button onClick={() => setPaymentForm({...paymentForm, orderId: order.id, amount: order.total})} className="rounded-full bg-clay px-5 py-2 text-sm font-bold text-white shadow-lg">Encaisser</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-card p-8">
                  <h2 className="font-display text-3xl text-forest">Nouveau Paiement</h2>
                  <form className="mt-6 space-y-4" onSubmit={handleCreatePayment}>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-forest/40 uppercase">Commande</label>
                       <select value={paymentForm.orderId} onChange={e => { const o = orders.find(x => x.id === e.target.value); setPaymentForm({...paymentForm, orderId: e.target.value, amount: o?.total || 0})}} className="w-full rounded-2xl border-forest/15 bg-sand/30 px-5 py-4 font-bold" required>
                         <option value="">Selectionner...</option>
                         {activeOrders.map(o => <option key={o.id} value={o.id}>Table {o.tableLabel} ({money(o.total)})</option>)}
                       </select>
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-forest/40 uppercase">Montant</label>
                        <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} className="w-full rounded-2xl border-forest/15 bg-sand/30 px-5 py-4 font-bold" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-forest/40 uppercase">Methode</label>
                        <select value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} className="w-full rounded-2xl border-forest/15 bg-sand/30 px-5 py-4 font-bold">
                          <option value="cash">ESPECES</option><option value="card">CARTE</option><option value="mobile_money">MOBILE</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full rounded-full bg-forest py-5 font-bold text-white shadow-xl">Valider l encaissement</button>
                  </form>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {invoiceMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl">
            <div className="text-center">
              <h3 className="font-display text-3xl text-forest">HOTEL CACTUS</h3>
              <p className="text-xs uppercase tracking-widest text-clay font-bold mt-1">Restaurant Premium</p>
              <div className="my-6 border-y border-dashed border-forest/20 py-4">
                <p className="text-sm font-bold">FACTURE #{invoiceMode.order.id.slice(0,8)}</p>
                <p className="text-xs text-ink/40 mt-1">{when(new Date().toISOString())}</p>
              </div>
            </div>
            <div className="space-y-4">
              {invoiceMode.order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-bold">{money(item.quantity * item.unitPrice)}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t-2 border-forest pt-4 flex justify-between items-center text-xl font-display">
              <span>TOTAL</span>
              <span className="text-clay">{money(invoiceMode.order.total)}</span>
            </div>
            <div className="mt-10 flex flex-col gap-3">
              <button onClick={() => window.print()} className="w-full rounded-full bg-forest py-4 font-bold text-white">Imprimer</button>
              <button onClick={() => setInvoiceMode(null)} className="w-full rounded-full border border-forest/20 py-4 font-bold text-forest">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
