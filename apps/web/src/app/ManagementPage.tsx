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
const reservationStatuses: Reservation['status'][] = ['pending', 'confirmed', 'seated', 'completed', 'cancelled'];

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

  const [reservationForm, setReservationForm] = useState({ guestName: '', email: '', phone: '', guests: 2, date: '2026-04-13T19:30', notes: '', tableId: '', preferredZone: 'Salle principale' });
  const [orderForm, setOrderForm] = useState({ tableId: '', customerName: '', menuItemId: '', quantity: 1, notes: '' });
  const [paymentForm, setPaymentForm] = useState({ orderId: '', amount: 0, method: 'cash' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [staffForm, setStaffForm] = useState<CreateStaffPayload>({ name: '', email: '', role: 'server', password: '' });
  const [menuForm, setMenuForm] = useState<CreateMenuItemPayload>({ category: 'Plats', name: '', description: '', price: 0, available: true, tags: [] });
  const [tableForm, setTableForm] = useState<CreateTablePayload>({ label: 'Table 09', zone: 'Salle principale', seats: 4, shape: 'round', posX: 18, posY: 18, width: 16, height: 16, status: 'available' });

  useEffect(() => {
    if (!token || !user) return;
    if (!canView(user.role, activeView)) setActiveView('overview');
    setStaffForm((current) => ({ ...current, role: creatableRoles(currentUser.role)[0] ?? 'server' }));
    void loadData();
  }, [token, user]);

  const menuItems = useMemo(() => menu.flatMap((category) => category.items), [menu]);
  const selectedTable = useMemo(() => tables.find((table) => table.id === selectedTableId) ?? tables[0] ?? null, [selectedTableId, tables]);
  const visibleViews = useMemo(() => [{ key: 'overview', label: 'Dashboard' }, { key: 'tables', label: 'Plan de salle' }, { key: 'service', label: 'Reservations & salle' }, { key: 'kitchen', label: 'Cuisine & menu' }, { key: 'cashier', label: 'Caisse' }, { key: 'team', label: 'Equipe' }].filter((view) => user && canView(user.role, view.key as ViewKey)), [user]);
  const pendingReservations = reservations.filter((item) => item.status === 'pending' || item.status === 'confirmed');
  const activeOrders = orders.filter((item) => item.status !== 'closed');

  useEffect(() => { if (!selectedTableId && tables[0]) setSelectedTableId(tables[0].id); }, [selectedTableId, tables]);

  async function loadData() {
    if (!token || !user) return;
    try {
      const [dash, menuData, tableData, reservationData, orderData, kitchenData, paymentData, staffData, notificationData] = await Promise.all([
        api.dashboard(token),
        api.menu(),
        api.tables(token),
        canView(user.role, 'service') ? api.reservations(token) : Promise.resolve([] as Reservation[]),
        api.orders(token),
        canView(user.role, 'kitchen') ? api.kitchen(token) : Promise.resolve([] as Order[]),
        canView(user.role, 'cashier') || currentUser.role === 'super_admin' || currentUser.role === 'admin' ? api.payments(token) : Promise.resolve([] as Payment[]),
        canView(user.role, 'team') ? api.staff(token) : Promise.resolve([] as AuthUser[]),
        api.notifications(token)
      ]);
      setSummary(dash); setMenu(menuData); setTables(tableData); setReservations(reservationData); setOrders(orderData); setKitchenTickets(kitchenData); setPayments(paymentData); setStaff(staffData); setNotifications(notificationData);
    } catch (error) {
      setFlash({ type: 'error', text: error instanceof Error ? error.message : 'Chargement impossible' });
    }
  }

  async function act(task: () => Promise<void>, success: string) {
    setFlash(null);
    try { await task(); setFlash({ type: 'success', text: success }); await loadData(); }
    catch (error) { setFlash({ type: 'error', text: error instanceof Error ? error.message : 'Operation impossible' }); }
  }

  if (!user || !token) return null;
  const currentUser = user;
  const authToken = token;
  async function handleCreateReservation(event: FormEvent) {
    event.preventDefault();
    await act(async () => {
      await api.createStaffReservation({ ...reservationForm, date: new Date(reservationForm.date).toISOString(), tableId: reservationForm.tableId || undefined }, authToken);
      setReservationForm({ guestName: '', email: '', phone: '', guests: 2, date: '2026-04-13T19:30', notes: '', tableId: '', preferredZone: 'Salle principale' });
    }, 'Reservation enregistree.');
  }

  async function handleCreateOrder(event: FormEvent) {
    event.preventDefault();
    const item = menuItems.find((entry) => entry.id === orderForm.menuItemId);
    const table = tables.find((entry) => entry.id === orderForm.tableId);
    if (!item || !table) { setFlash({ type: 'error', text: 'Selectionnez une table et un plat valides.' }); return; }
    await act(async () => {
      await api.createOrder({ tableId: table.id, tableLabel: table.label, customerName: orderForm.customerName, serverId: currentUser.id, items: [{ menuItemId: item.id, name: item.name, quantity: orderForm.quantity, unitPrice: item.price }], notes: orderForm.notes || undefined }, authToken);
      setOrderForm({ tableId: '', customerName: '', menuItemId: '', quantity: 1, notes: '' });
    }, 'Commande envoyee.');
  }

  async function handleCreatePayment(event: FormEvent) {
    event.preventDefault();
    await act(async () => {
      await api.createPayment({ orderId: paymentForm.orderId, amount: Number(paymentForm.amount), method: paymentForm.method, processedBy: currentUser.id }, authToken);
      setPaymentForm({ orderId: '', amount: 0, method: 'cash' });
    }, 'Paiement enregistre.');
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    await act(async () => { await api.changePassword(passwordForm, authToken); setPasswordForm({ currentPassword: '', newPassword: '' }); await refreshUser(); }, 'Mot de passe mis a jour.');
  }

  async function handleCreateStaff(event: FormEvent) {
    event.preventDefault();
    await act(async () => { await api.createStaff(staffForm, authToken); setStaffForm({ name: '', email: '', role: creatableRoles(currentUser.role)[0] ?? 'server', password: '' }); }, 'Compte cree.');
  }

  async function handleCreateMenuItem(event: FormEvent) {
    event.preventDefault();
    await act(async () => { await api.createMenuItem({ ...menuForm, price: Number(menuForm.price), tags: menuForm.tags ?? [] }, authToken); setMenuForm({ category: 'Plats', name: '', description: '', price: 0, available: true, tags: [] }); }, 'Plat ajoute.');
  }

  async function handleCreateTable(event: FormEvent) {
    event.preventDefault();
    await act(async () => { await api.createTable(tableForm, authToken); setTableForm({ label: `Table ${String(tables.length + 1).padStart(2, '0')}`, zone: tableForm.zone, seats: 4, shape: 'round', posX: 18, posY: 18, width: 16, height: 16, status: 'available' }); }, 'Table ajoutee.');
  }

  function onUtilitySelect(nextView: UtilityView) { setUtilityView(nextView); setAccountOpen(false); }
  function onLogout() { setAccountOpen(false); logout(); }

  const StatCard = ({ label, value, hint }: { label: string; value: string | number; hint: string }) => (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 text-white">
      <p className="text-sm text-white/70">{label}</p><p className="mt-3 font-display text-3xl">{value}</p><p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold/80">{hint}</p>
    </article>
  );

  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,#0f1d18_0%,#13261f_18%,#f6eedf_18%,#f3eadb_100%)] pb-16">
      <div className="section-shell py-8 lg:py-10">
        <section className="rounded-[2.25rem] border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow !text-gold/80">Pilotage restaurant</p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">Un dashboard premium pour la salle, la cuisine, la caisse et la direction.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">Plan de salle interactif, reservations live, notifications, comptes staff, creation de menu et supervision multi-roles.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 self-start">
              <NotificationCenter notifications={notifications} open={notifOpen} onToggle={() => { setNotifOpen((value) => !value); setAccountOpen(false); }} onRead={(id) => { void act(async () => { await api.markNotificationRead(id, authToken); }, 'Notification lue.'); }} />
              <AccountMenu user={currentUser} open={accountOpen} onToggle={() => { setAccountOpen((value) => !value); setNotifOpen(false); }} onSelect={onUtilitySelect} onLogout={onLogout} />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Reservations a traiter" value={summary?.pendingReservations ?? pendingReservations.length} hint="Salle" />
            <StatCard label="Commandes ouvertes" value={summary?.openOrders ?? activeOrders.length} hint="Service + cuisine" />
            <StatCard label="Notifications" value={notifications.filter((item) => !item.read).length} hint="Actions" />
            <StatCard label="Chiffre encaisse" value={money(summary?.revenue ?? 0)} hint="Caisse" />
          </div>
        </section>

        {flash ? <div className={['mt-6 rounded-[1.5rem] border px-5 py-4 text-sm font-medium', flash.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'].join(' ')}>{flash.text}</div> : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="surface-card p-5">
              <p className="eyebrow">Navigation</p>
              <div className="mt-4 space-y-2">{visibleViews.map((view) => <button key={String(view.key)} type="button" onClick={() => { setUtilityView('dashboard'); setActiveView(view.key as ViewKey); }} className={['flex w-full rounded-[1.2rem] px-4 py-3 text-left text-sm font-semibold transition', utilityView === 'dashboard' && activeView === view.key ? 'bg-forest text-white' : 'bg-sand/70 text-forest hover:bg-sand'].join(' ')}>{view.label}</button>)}</div>
            </section>
            <section className="surface-card p-5">
              <p className="eyebrow">Compte</p>
              <h2 className="mt-3 font-display text-2xl text-forest">{currentUser.name}</h2>
              <p className="mt-1 text-sm text-ink/60">{roleLabels[currentUser.role]}</p>
              <div className="mt-5 grid gap-3">
                <button type="button" onClick={() => setUtilityView('profile')} className="rounded-[1.1rem] bg-sand px-4 py-3 text-left text-sm font-semibold text-forest">Mon profil</button>
                <button type="button" onClick={() => setUtilityView('settings')} className="rounded-[1.1rem] bg-sand px-4 py-3 text-left text-sm font-semibold text-forest">Parametres</button>
                <button type="button" onClick={() => setUtilityView('dashboard')} className="rounded-[1.1rem] bg-sand px-4 py-3 text-left text-sm font-semibold text-forest">Dashboard</button>
                <button type="button" onClick={onLogout} className="rounded-[1.1rem] bg-clay px-4 py-3 text-left text-sm font-semibold text-white">Se deconnecter</button>
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            {utilityView === 'profile' ? <div className="grid gap-6 lg:grid-cols-2"><article className="surface-card p-6"><p className="eyebrow">Mon profil</p><h2 className="mt-3 font-display text-3xl text-forest">Identite</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-[1.5rem] bg-sand/70 p-5"><p className="text-xs uppercase tracking-[0.2em] text-clay">Nom</p><p className="mt-3 text-lg font-semibold text-forest">{currentUser.name}</p></div><div className="rounded-[1.5rem] bg-sand/70 p-5"><p className="text-xs uppercase tracking-[0.2em] text-clay">Role</p><p className="mt-3 text-lg font-semibold text-forest">{roleLabels[currentUser.role]}</p></div><div className="rounded-[1.5rem] bg-sand/70 p-5 sm:col-span-2"><p className="text-xs uppercase tracking-[0.2em] text-clay">Email</p><p className="mt-3 text-lg font-semibold text-forest">{currentUser.email}</p></div></div></article><article className="surface-card p-6"><p className="eyebrow">Centre de notifications</p><h2 className="mt-3 font-display text-3xl text-forest">Dernieres alertes</h2><div className="mt-5 space-y-3">{notifications.slice(0, 4).map((item) => <article key={item.id} className="rounded-[1.2rem] border border-forest/10 bg-sand/45 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-forest">{item.title}</p><p className="mt-1 text-sm text-ink/60">{item.message}</p></div><StatusBadge value={item.read ? 'completed' : 'pending'} /></div></article>)}</div></article></div> : null}
            {utilityView === 'settings' ? <div className="grid gap-6 lg:grid-cols-2"><article className="surface-card p-6"><p className="eyebrow">Securite</p><h2 className="mt-3 font-display text-3xl text-forest">Changer mon mot de passe</h2><form className="mt-5 space-y-4" onSubmit={handleChangePassword}><input value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} type="password" required className="w-full rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Mot de passe actuel" /><input value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} type="password" minLength={8} required className="w-full rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Nouveau mot de passe" /><button type="submit" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Mettre a jour</button></form></article><article className="surface-card p-6"><p className="eyebrow">Reglages</p><h2 className="mt-3 font-display text-3xl text-forest">Rappels</h2><div className="mt-5 space-y-3 text-sm leading-7 text-ink/65"><p>Le menu compte du dashboard permet de passer vers Dashboard, Mon profil, Parametres et Se deconnecter.</p><p>Les notifications suivent les reservations, commandes, paiements, staff, menu et tables.</p></div></article></div> : null}
            {utilityView === 'dashboard' && activeView === 'overview' ? <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"><article className="surface-card p-6"><p className="eyebrow">Vue generale</p><h2 className="mt-3 font-display text-3xl text-forest">Le tempo du restaurant en un regard</h2><div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-[1.5rem] bg-sand/60 p-5"><p className="text-sm text-ink/65">Equipe active</p><p className="mt-3 font-display text-3xl text-forest">{summary?.activeStaff ?? 0}</p></div><div className="rounded-[1.5rem] bg-sand/60 p-5"><p className="text-sm text-ink/65">Ticket moyen</p><p className="mt-3 font-display text-3xl text-forest">{money(summary?.averageTicket ?? 0)}</p></div><div className="rounded-[1.5rem] bg-sand/60 p-5"><p className="text-sm text-ink/65">Tickets cuisine</p><p className="mt-3 font-display text-3xl text-forest">{summary?.activeKitchenTickets ?? 0}</p></div><div className="rounded-[1.5rem] bg-sand/60 p-5"><p className="text-sm text-ink/65">Reservations</p><p className="mt-3 font-display text-3xl text-forest">{summary?.reservationCount ?? 0}</p></div></div></article><article className="space-y-6"><section className="surface-card p-6"><p className="eyebrow">Reservations imminentes</p><div className="mt-4 space-y-3">{pendingReservations.slice(0, 5).map((reservation) => <article key={reservation.id} className="rounded-[1.2rem] border border-forest/10 bg-sand/55 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-forest">{reservation.guestName}</p><p className="mt-1 text-sm text-ink/60">{reservation.guests} couverts � {when(reservation.date)}</p></div><StatusBadge value={reservation.status} /></div></article>)}</div></section><section className="surface-card p-6"><p className="eyebrow">Commandes ouvertes</p><div className="mt-4 space-y-3">{activeOrders.slice(0, 5).map((order) => <article key={order.id} className="rounded-[1.2rem] border border-forest/10 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-forest">{order.tableLabel}</p><p className="mt-1 text-sm text-ink/60">{order.customerName} � {money(order.total)}</p></div><StatusBadge value={order.status} /></div></article>)}</div></section></article></div> : null}
            {utilityView === 'dashboard' && activeView === 'tables' ? <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><article className="surface-card p-6"><p className="eyebrow">Plan de salle interactif</p><h2 className="mt-3 font-display text-3xl text-forest">Attribuer, deplacer et visualiser chaque table</h2><p className="mt-3 text-sm leading-7 text-ink/65">Glisse une reservation ou une commande sur une table pour gerer le placement en direct.</p><div className="mt-6"><FloorPlanBoard tables={tables} reservations={pendingReservations} orders={activeOrders} selectedTableId={selectedTable?.id ?? null} onSelect={setSelectedTableId} onReservationDrop={(reservationId, tableId) => { void act(async () => { await api.assignReservationTable(reservationId, tableId, authToken); setSelectedTableId(tableId); }, 'Reservation repositionnee.'); }} onOrderDrop={(orderId, tableId) => { void act(async () => { await api.moveOrderTable(orderId, tableId, authToken); setSelectedTableId(tableId); }, 'Clients deplaces.'); }} /></div></article><div className="space-y-6"><article className="surface-card p-6"><p className="eyebrow">Table selectionnee</p><h2 className="mt-3 font-display text-3xl text-forest">{selectedTable?.label ?? 'Choisissez une table'}</h2>{selectedTable ? <><p className="mt-3 text-sm text-ink/62">{selectedTable.zone} � {selectedTable.seats} couverts � {selectedTable.shape}</p><div className="mt-4 flex flex-wrap gap-2">{tableStatuses.map((status) => <button key={status} type="button" onClick={() => { void act(async () => { await api.updateTableStatus(selectedTable.id, status, authToken); }, 'Etat de la table mis a jour.'); }} className={['rounded-full px-4 py-2 text-sm font-semibold', selectedTable.status === status ? 'bg-forest text-white' : 'bg-sand text-forest'].join(' ')}>{status.replace('_', ' ')}</button>)}</div></> : null}</article>{(currentUser.role === 'super_admin' || currentUser.role === 'admin') ? <article className="surface-card p-6"><p className="eyebrow">Configurer les tables</p><h2 className="mt-3 font-display text-3xl text-forest">Ajouter une table</h2><form className="mt-5 grid gap-4" onSubmit={handleCreateTable}><input value={tableForm.label} onChange={(event) => setTableForm({ ...tableForm, label: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Libelle" required /><div className="grid gap-4 sm:grid-cols-2"><input value={tableForm.zone} onChange={(event) => setTableForm({ ...tableForm, zone: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Zone" required /><input value={tableForm.seats} onChange={(event) => setTableForm({ ...tableForm, seats: Number(event.target.value) })} type="number" min="1" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Couverts" required /></div><div className="grid gap-4 sm:grid-cols-2"><input value={tableForm.posX} onChange={(event) => setTableForm({ ...tableForm, posX: Number(event.target.value) })} type="number" min="0" max="90" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Position X" /><input value={tableForm.posY} onChange={(event) => setTableForm({ ...tableForm, posY: Number(event.target.value) })} type="number" min="0" max="90" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Position Y" /></div><button type="submit" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Ajouter cette table</button></form></article> : null}</div></div> : null}
            {utilityView === 'dashboard' && activeView === 'service' ? <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"><div className="space-y-6"><article className="surface-card p-6"><p className="eyebrow">Reservation staff</p><h2 className="mt-3 font-display text-3xl text-forest">Saisir une reservation depuis la salle</h2><form className="mt-5 grid gap-4" onSubmit={handleCreateReservation}><div className="grid gap-4 sm:grid-cols-2"><input value={reservationForm.guestName} onChange={(event) => setReservationForm({ ...reservationForm, guestName: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Nom client" required /><input value={reservationForm.phone} onChange={(event) => setReservationForm({ ...reservationForm, phone: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Telephone" required /></div><div className="grid gap-4 sm:grid-cols-2"><input value={reservationForm.email} onChange={(event) => setReservationForm({ ...reservationForm, email: event.target.value })} type="email" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Email" required /><input value={reservationForm.guests} onChange={(event) => setReservationForm({ ...reservationForm, guests: Number(event.target.value) })} type="number" min="1" max="24" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Couverts" required /></div><div className="grid gap-4 sm:grid-cols-2"><input value={reservationForm.date} onChange={(event) => setReservationForm({ ...reservationForm, date: event.target.value })} type="datetime-local" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" required /><select value={reservationForm.tableId} onChange={(event) => setReservationForm({ ...reservationForm, tableId: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3"><option value="">Sans table assignee</option>{tables.map((table) => <option key={table.id} value={table.id}>{table.label} � {table.zone}</option>)}</select></div><input value={reservationForm.preferredZone} onChange={(event) => setReservationForm({ ...reservationForm, preferredZone: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Zone preferee" /><textarea value={reservationForm.notes} onChange={(event) => setReservationForm({ ...reservationForm, notes: event.target.value })} className="min-h-28 rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Occasion, allergies, instructions..." /><button type="submit" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Enregistrer la reservation</button></form></article><article className="surface-card p-6"><p className="eyebrow">Prise de commande</p><h2 className="mt-3 font-display text-3xl text-forest">Creer une commande client</h2><form className="mt-5 grid gap-4" onSubmit={handleCreateOrder}><div className="grid gap-4 sm:grid-cols-2"><select value={orderForm.tableId} onChange={(event) => setOrderForm({ ...orderForm, tableId: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" required><option value="">Selectionner une table</option>{tables.map((table) => <option key={table.id} value={table.id}>{table.label} � {table.zone}</option>)}</select><input value={orderForm.customerName} onChange={(event) => setOrderForm({ ...orderForm, customerName: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Nom du client" required /></div><div className="grid gap-4 sm:grid-cols-2"><select value={orderForm.menuItemId} onChange={(event) => setOrderForm({ ...orderForm, menuItemId: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" required><option value="">Selectionner un plat</option>{menuItems.filter((item) => item.available).map((item) => <option key={item.id} value={item.id}>{item.name} � {money(item.price)}</option>)}</select><input value={orderForm.quantity} onChange={(event) => setOrderForm({ ...orderForm, quantity: Number(event.target.value) })} type="number" min="1" max="20" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Quantite" required /></div><textarea value={orderForm.notes} onChange={(event) => setOrderForm({ ...orderForm, notes: event.target.value })} className="min-h-24 rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Remarques cuisine" /><button type="submit" className="rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white">Envoyer la commande</button></form></article></div><article className="surface-card p-6"><p className="eyebrow">Pilotage salle</p><h2 className="mt-3 font-display text-3xl text-forest">Reservations et tables en direct</h2><div className="mt-5 space-y-4">{reservations.map((reservation) => <article key={reservation.id} className="rounded-[1.3rem] border border-forest/10 bg-sand/55 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-forest">{reservation.guestName}</p><p className="mt-1 text-sm text-ink/60">{reservation.guests} couverts � {when(reservation.date)}</p><p className="mt-1 text-sm text-ink/60">{reservation.tableId ? tables.find((table) => table.id === reservation.tableId)?.label ?? reservation.tableId : 'Aucune table assignee'}</p></div><div className="flex flex-wrap gap-2"><StatusBadge value={reservation.status} /><select value={reservation.status} onChange={(event) => { void act(async () => { await api.updateReservationStatus(reservation.id, event.target.value, authToken); }, 'Reservation mise a jour.'); }} className="rounded-full border border-forest/10 bg-white px-3 py-2 text-sm font-semibold text-forest">{reservationStatuses.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}</select></div></div></article>)}</div></article></div> : null}
            {utilityView === 'dashboard' && activeView === 'kitchen' ? <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]"><div className="space-y-6"><article className="surface-card p-6"><p className="eyebrow">Edition carte</p><h2 className="mt-3 font-display text-3xl text-forest">Ajouter un plat depuis la cuisine</h2><form className="mt-5 grid gap-4" onSubmit={handleCreateMenuItem}><div className="grid gap-4 sm:grid-cols-2"><input value={menuForm.category} onChange={(event) => setMenuForm({ ...menuForm, category: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Categorie" required /><input value={menuForm.name} onChange={(event) => setMenuForm({ ...menuForm, name: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Nom du plat" required /></div><textarea value={menuForm.description} onChange={(event) => setMenuForm({ ...menuForm, description: event.target.value })} className="min-h-24 rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Description culinaire" required /><div className="grid gap-4 sm:grid-cols-2"><input value={menuForm.price} onChange={(event) => setMenuForm({ ...menuForm, price: Number(event.target.value) })} type="number" min="0" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Prix" required /><input value={(menuForm.tags ?? []).join(', ')} onChange={(event) => setMenuForm({ ...menuForm, tags: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Tags" /></div><button type="submit" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Publier ce plat</button></form></article><article className="surface-card p-6"><p className="eyebrow">Tickets cuisine</p><h2 className="mt-3 font-display text-3xl text-forest">File de production</h2><div className="mt-5 space-y-3">{kitchenTickets.map((ticket) => <article key={ticket.id} className="rounded-[1.2rem] border border-forest/10 bg-sand/55 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-forest">{ticket.tableLabel} � {ticket.customerName}</p><p className="mt-1 text-sm text-ink/60">{ticket.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}</p></div><div className="flex flex-wrap gap-2"><StatusBadge value={ticket.status} /><select value={ticket.status} onChange={(event) => { const next = event.target.value; void act(async () => { if (next === 'sent_to_kitchen' || next === 'in_preparation' || next === 'ready') { await api.updateKitchenStatus(ticket.id, next, authToken); } else { await api.updateOrderStatus(ticket.id, next, authToken); } }, 'Commande mise a jour.'); }} className="rounded-full border border-forest/10 bg-white px-3 py-2 text-sm font-semibold text-forest">{['sent_to_kitchen', 'in_preparation', 'ready', 'served'].map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}</select></div></div></article>)}</div></article></div><article className="surface-card p-6"><p className="eyebrow">Carte active</p><h2 className="mt-3 font-display text-3xl text-forest">Presentation professionnelle du menu</h2><div className="mt-6 space-y-6">{menu.map((category) => <section key={category.category} className="rounded-[1.5rem] border border-forest/10 bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.22em] text-clay">Categorie</p><h3 className="mt-2 font-display text-2xl text-forest">{category.category}</h3></div><div className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-forest">{category.items.length} plats</div></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{category.items.map((item) => <article key={item.id} className="rounded-[1.2rem] border border-forest/10 bg-sand/45 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-forest">{item.name}</p><p className="mt-1 text-sm text-ink/60">{item.description}</p></div><StatusBadge value={item.available ? 'available' : 'closed'} /></div><div className="mt-4 flex items-center justify-between gap-3"><p className="font-display text-2xl text-forest">{money(item.price)}</p>{(currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'chef') ? <button type="button" onClick={() => { void act(async () => { await api.updateMenuAvailability(item.id, !item.available, authToken); }, 'Disponibilite du plat mise a jour.'); }} className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">{item.available ? 'Masquer' : 'Rendre disponible'}</button> : null}</div></article>)}</div></section>)}</div></article></div> : null}
            {utilityView === 'dashboard' && activeView === 'cashier' ? <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><article className="surface-card p-6"><p className="eyebrow">Encaissement</p><h2 className="mt-3 font-display text-3xl text-forest">Enregistrer un paiement</h2><form className="mt-5 grid gap-4" onSubmit={handleCreatePayment}><select value={paymentForm.orderId} onChange={(event) => setPaymentForm({ ...paymentForm, orderId: event.target.value, amount: orders.find((order) => order.id === event.target.value)?.total ?? 0 })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" required><option value="">Choisir une commande</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.tableLabel} � {order.customerName} � {money(order.total)}</option>)}</select><div className="grid gap-4 sm:grid-cols-2"><input value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: Number(event.target.value) })} type="number" min="0" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Montant" required /><select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3"><option value="cash">Cash</option><option value="card">Carte</option><option value="mobile_money">Mobile money</option></select></div><button type="submit" className="rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white">Valider le paiement</button></form></article><article className="surface-card p-6"><p className="eyebrow">Historique caisse</p><h2 className="mt-3 font-display text-3xl text-forest">Transactions recues</h2><div className="mt-5 space-y-3">{payments.map((payment) => <article key={payment.id} className="rounded-[1.2rem] border border-forest/10 bg-sand/55 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-forest">Commande {payment.orderId}</p><p className="mt-1 text-sm text-ink/60">{money(payment.amount)} � {payment.method}</p><p className="mt-1 text-xs uppercase tracking-[0.2em] text-clay">{when(payment.createdAt)}</p></div><StatusBadge value={payment.status} /></div></article>)}</div></article></div> : null}
            {utilityView === 'dashboard' && activeView === 'team' ? <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]"><article className="surface-card p-6"><p className="eyebrow">Gestion staff</p><h2 className="mt-3 font-display text-3xl text-forest">Creer des comptes par role</h2><p className="mt-3 text-sm leading-7 text-ink/62">{currentUser.role === 'super_admin' ? 'Le super admin peut creer des super admins, administrateurs, serveurs, chefs et caissiers.' : 'L administrateur peut creer des serveurs, chefs et caissiers.'}</p><form className="mt-5 grid gap-4" onSubmit={handleCreateStaff}><input value={staffForm.name} onChange={(event) => setStaffForm({ ...staffForm, name: event.target.value })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Nom complet" required /><div className="grid gap-4 sm:grid-cols-2"><input value={staffForm.email} onChange={(event) => setStaffForm({ ...staffForm, email: event.target.value })} type="email" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Email professionnel" required /><select value={staffForm.role} onChange={(event) => setStaffForm({ ...staffForm, role: event.target.value as UserRole })} className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3">{creatableRoles(currentUser.role).map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></div><input value={staffForm.password} onChange={(event) => setStaffForm({ ...staffForm, password: event.target.value })} type="password" className="rounded-[1.2rem] border border-forest/10 bg-sand/60 px-4 py-3" placeholder="Mot de passe initial" required /><button type="submit" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Creer le compte</button></form></article><article className="surface-card p-6"><p className="eyebrow">Equipe active</p><h2 className="mt-3 font-display text-3xl text-forest">Utilisateurs et responsabilites</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{staff.map((member) => <article key={member.id} className="rounded-[1.3rem] border border-forest/10 bg-sand/55 p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-forest">{member.name}</p><p className="mt-1 text-sm text-ink/60">{member.email}</p></div><StatusBadge value={member.active ? 'available' : 'closed'} /></div><p className="mt-4 rounded-full bg-white px-3 py-2 text-sm font-semibold text-forest">{roleLabels[member.role]}</p></article>)}</div></article></div> : null}
          </section>
        </div>
      </div>
    </main>
  );
}



