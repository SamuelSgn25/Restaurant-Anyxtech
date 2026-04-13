import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { StatusBadge } from '../components/management/StatusBadge';
import { api } from '../lib/api';
import {
  AuthUser,
  DashboardSummary,
  MenuCategory,
  Order,
  Payment,
  Reservation,
  RestaurantTable,
  TableStatus,
  UserRole
} from '../types/management';
import { useAuth } from './AuthContext';

type ViewKey = 'overview' | 'tables' | 'service' | 'kitchen' | 'cashier' | 'team';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super admin',
  admin: 'Administrateur',
  server: 'Serveur',
  chef: 'Chef de cuisine',
  cashier: 'Caissier'
};

const tableStatuses: TableStatus[] = ['available', 'reserved', 'occupied', 'cleaning'];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(amount);
}

function viewAllowed(role: UserRole, view: ViewKey) {
  const matrix: Record<ViewKey, UserRole[]> = {
    overview: ['super_admin', 'admin', 'server', 'chef', 'cashier'],
    tables: ['super_admin', 'admin', 'server'],
    service: ['super_admin', 'admin', 'server'],
    kitchen: ['super_admin', 'admin', 'chef'],
    cashier: ['super_admin', 'admin', 'cashier'],
    team: ['super_admin', 'admin']
  };

  return matrix[view].includes(role);
}

export function ManagementPage() {
  const { token, user, logout, loading } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kitchenTickets, setKitchenTickets] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeView, setActiveView] = useState<ViewKey>('overview');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const [reservationForm, setReservationForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    guests: 2,
    date: '2026-04-10T19:30',
    notes: '',
    tableId: ''
  });
  const [orderForm, setOrderForm] = useState({
    tableId: '',
    customerName: '',
    menuItemId: '',
    quantity: 1,
    notes: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    orderId: '',
    amount: 0,
    method: 'cash'
  });

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    if (!viewAllowed(user.role, activeView)) {
      setActiveView('overview');
    }

    void loadData();
  }, [token, user]);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? tables[0] ?? null,
    [selectedTableId, tables]
  );

  const selectedTableOrders = useMemo(
    () => orders.filter((order) => order.tableId === selectedTable?.id),
    [orders, selectedTable]
  );

  const selectedTableReservations = useMemo(
    () => reservations.filter((reservation) => reservation.tableId === selectedTable?.id),
    [reservations, selectedTable]
  );

  const availableViews = useMemo(() => {
    if (!user) {
      return [] as Array<{ key: ViewKey; label: string }>;
    }

    const views: Array<{ key: ViewKey; label: string }> = [
      { key: 'overview', label: 'Vue globale' },
      { key: 'tables', label: 'Tables' },
      { key: 'service', label: 'Service' },
      { key: 'kitchen', label: 'Cuisine' },
      { key: 'cashier', label: 'Caisse' },
      { key: 'team', label: 'Equipe' }
    ];

    return views.filter((view) => viewAllowed(user.role, view.key));
  }, [user]);

  useEffect(() => {
    if (!selectedTableId && tables[0]) {
      setSelectedTableId(tables[0].id);
      setOrderForm((current) => ({ ...current, tableId: tables[0].id }));
      setReservationForm((current) => ({ ...current, tableId: tables[0].id }));
    }
  }, [selectedTableId, tables]);

  if (!loading && (!token || !user)) {
    return <Navigate to="/login" replace />;
  }

  async function loadData() {
    if (!token || !user) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const [dashboardData, menuData, tableData, orderData] = await Promise.all([
        api.dashboard(token),
        api.menu(),
        api.tables(token),
        api.orders(token)
      ]);

      setSummary(dashboardData);
      setMenu(menuData);
      setTables(tableData);
      setOrders(orderData);

      if (viewAllowed(user.role, 'service')) {
        setReservations(await api.reservations(token));
      } else {
        setReservations([]);
      }

      if (viewAllowed(user.role, 'kitchen')) {
        setKitchenTickets(await api.kitchen(token));
      } else {
        setKitchenTickets([]);
      }

      if (viewAllowed(user.role, 'cashier')) {
        setPayments(await api.payments(token));
      } else {
        setPayments([]);
      }

      if (viewAllowed(user.role, 'team')) {
        setStaff(await api.staff(token));
      } else {
        setStaff([]);
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Chargement impossible';
      setError(message);
      if (message.includes('Authentification') || message.includes('Token')) {
        logout();
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateReservation(event: FormEvent) {
    event.preventDefault();
    await api.createReservation({
      ...reservationForm,
      date: new Date(reservationForm.date).toISOString(),
      tableId: reservationForm.tableId || undefined
    });
    setReservationForm({
      guestName: '',
      email: '',
      phone: '',
      guests: 2,
      date: '2026-04-10T19:30',
      notes: '',
      tableId: selectedTable?.id ?? ''
    });
    await loadData();
  }

  async function handleCreateOrder(event: FormEvent) {
    event.preventDefault();
    if (!token || !user) {
      return;
    }

    const item = menu.flatMap((category) => category.items).find((entry) => entry.id === orderForm.menuItemId);
    const table = tables.find((entry) => entry.id === orderForm.tableId);
    if (!item || !table) {
      setError('Selectionnez une table et un plat pour la commande.');
      return;
    }

    await api.createOrder(
      {
        tableId: table.id,
        tableLabel: table.label,
        customerName: orderForm.customerName,
        serverId: user.id,
        items: [
          {
            menuItemId: item.id,
            name: item.name,
            quantity: orderForm.quantity,
            unitPrice: item.price
          }
        ],
        notes: orderForm.notes
      },
      token
    );

    setOrderForm({
      tableId: selectedTable?.id ?? '',
      customerName: '',
      menuItemId: '',
      quantity: 1,
      notes: ''
    });
    await loadData();
  }

  async function handleCreatePayment(event: FormEvent) {
    event.preventDefault();
    if (!token || !user) {
      return;
    }

    await api.createPayment(
      {
        orderId: paymentForm.orderId,
        amount: paymentForm.amount,
        method: paymentForm.method,
        processedBy: user.id
      },
      token
    );

    setPaymentForm({ orderId: '', amount: 0, method: 'cash' });
    await loadData();
  }

  const roleTone: Record<UserRole, string> = {
    super_admin: 'from-forest to-ink',
    admin: 'from-clay to-wine',
    server: 'from-gold to-clay',
    chef: 'from-ink to-forest',
    cashier: 'from-wine to-clay'
  };

  return (
    <main className="section-shell space-y-8 py-10 lg:py-14">
      <section className={`surface-card overflow-hidden bg-gradient-to-r ${roleTone[user?.role ?? 'admin']} p-8 text-white`}>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow !text-gold/80">Dashboard operations</p>
            <h1 className="mt-3 font-display text-5xl leading-tight">Une tour de controle pour toute l'exploitation restaurant.</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/75">
              Suivez les tables, la salle, la cuisine, la caisse et les equipes en temps reel avec des vues adaptees au role connecte.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">Connecte</p>
              <p className="mt-2 font-semibold">{user?.name}</p>
              <p className="text-sm text-white/70">{user ? roleLabels[user.role] : ''}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">Statut</p>
              <p className="mt-2 font-semibold">{busy ? 'Synchronisation...' : 'Dashboard a jour'}</p>
              <button type="button" onClick={logout} className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-forest">
                Se deconnecter
              </button>
            </div>
          </div>
        </div>
      </section>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <article className="surface-card p-5 xl:col-span-2">
          <p className="text-sm uppercase tracking-[0.2em] text-clay">CA encaisse</p>
          <p className="mt-3 font-display text-4xl text-forest">{formatCurrency(summary?.revenue ?? 0)}</p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Tables occupees</p>
          <p className="mt-3 font-display text-4xl text-forest">{summary?.tables.occupied ?? 0}</p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Reservations</p>
          <p className="mt-3 font-display text-4xl text-forest">{summary?.reservationCount ?? 0}</p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Cuisine</p>
          <p className="mt-3 font-display text-4xl text-forest">{summary?.activeKitchenTickets ?? 0}</p>
        </article>
        <article className="surface-card p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Equipe active</p>
          <p className="mt-3 font-display text-4xl text-forest">{summary?.activeStaff ?? 0}</p>
        </article>
      </section>

      <section className="surface-card p-3">
        <div className="flex flex-wrap gap-3">
          {availableViews.map((view) => (
            <button
              key={view.key}
              type="button"
              onClick={() => setActiveView(view.key)}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                activeView === view.key ? 'bg-forest text-white' : 'bg-sand text-forest hover:bg-sand/70'
              ].join(' ')}
            >
              {view.label}
            </button>
          ))}
          <button type="button" onClick={() => void loadData()} className="ml-auto rounded-full border border-forest/10 px-4 py-2 text-sm font-semibold text-forest">
            Actualiser
          </button>
        </div>
      </section>
      {activeView === 'overview' && (
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="surface-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Plan de salle</p>
                  <h2 className="mt-2 font-display text-3xl text-forest">Occupation en direct</h2>
                </div>
                <div className="flex gap-2 text-xs">
                  {tableStatuses.map((status) => (
                    <StatusBadge key={status} value={status} />
                  ))}
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => setSelectedTableId(table.id)}
                    className={[
                      'rounded-[1.5rem] border p-4 text-left transition',
                      selectedTable?.id === table.id ? 'border-clay bg-sand/60' : 'border-forest/10 bg-white'
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-forest">{table.label}</p>
                      <StatusBadge value={table.status} />
                    </div>
                    <p className="mt-2 text-sm text-ink/60">{table.zone} � {table.seats} couverts</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-card p-6">
              <p className="eyebrow">Charge equipe</p>
              <h2 className="mt-2 font-display text-3xl text-forest">Repartition des roles</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {summary && Object.entries(summary.roleBreakdown).map(([role, count]) => (
                  <div key={role} className="rounded-[1.25rem] border border-forest/10 p-4">
                    <p className="text-sm text-ink/60">{roleLabels[role as UserRole]}</p>
                    <p className="mt-2 font-display text-3xl text-forest">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="eyebrow">Zoom table</p>
            <h2 className="mt-2 font-display text-3xl text-forest">{selectedTable?.label ?? 'Selectionnez une table'}</h2>
            {selectedTable ? (
              <div className="mt-5 space-y-5">
                <div className="flex flex-wrap gap-3">
                  <StatusBadge value={selectedTable.status} />
                  <p className="text-sm text-ink/60">{selectedTable.zone} � {selectedTable.seats} couverts</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">Reservations liees</p>
                  <div className="mt-3 space-y-3">
                    {selectedTableReservations.length === 0 ? <p className="text-sm text-ink/60">Aucune reservation liee.</p> : selectedTableReservations.map((reservation) => (
                      <div key={reservation.id} className="rounded-[1.25rem] border border-forest/10 p-4">
                        <p className="font-semibold text-forest">{reservation.guestName}</p>
                        <p className="text-sm text-ink/60">{new Date(reservation.date).toLocaleString('fr-FR')}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">Commandes liees</p>
                  <div className="mt-3 space-y-3">
                    {selectedTableOrders.length === 0 ? <p className="text-sm text-ink/60">Aucune commande liee.</p> : selectedTableOrders.map((order) => (
                      <div key={order.id} className="rounded-[1.25rem] border border-forest/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-forest">{order.customerName}</p>
                          <StatusBadge value={order.status} />
                        </div>
                        <p className="mt-2 text-sm text-ink/60">{formatCurrency(order.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {activeView === 'tables' && (
        <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div className="surface-card p-6">
            <p className="eyebrow">Etat des tables</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Controle du plan de salle</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {tables.map((table) => (
                <div key={table.id} className="rounded-[1.5rem] border border-forest/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-forest">{table.label}</p>
                      <p className="text-sm text-ink/60">{table.zone} � {table.seats} couverts</p>
                    </div>
                    <StatusBadge value={table.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tableStatuses.map((status) => (
                      <button key={status} type="button" onClick={() => token && api.updateTableStatus(table.id, status, token).then(loadData)} className="rounded-full border border-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="eyebrow">Reservee ou libre</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Lecture instantanee</h2>
            <div className="mt-5 space-y-3">
              {tableStatuses.map((status) => (
                <div key={status} className="flex items-center justify-between rounded-[1.25rem] border border-forest/10 p-4">
                  <div className="flex items-center gap-3">
                    <StatusBadge value={status} />
                  </div>
                  <p className="font-semibold text-forest">{summary?.tables[status] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeView === 'service' && (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <form className="surface-card p-6" onSubmit={handleCreateReservation}>
              <p className="eyebrow">Reservation</p>
              <h2 className="mt-2 font-display text-3xl text-forest">Nouvelle reservation</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <input value={reservationForm.guestName} onChange={(event) => setReservationForm({ ...reservationForm, guestName: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" placeholder="Nom du client" required />
                <input value={reservationForm.phone} onChange={(event) => setReservationForm({ ...reservationForm, phone: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" placeholder="Telephone" required />
                <input value={reservationForm.email} onChange={(event) => setReservationForm({ ...reservationForm, email: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" placeholder="Email" type="email" required />
                <input value={reservationForm.guests} onChange={(event) => setReservationForm({ ...reservationForm, guests: Number(event.target.value) })} className="rounded-2xl border border-forest/15 px-4 py-3" type="number" min="1" max="20" required />
                <select value={reservationForm.tableId} onChange={(event) => setReservationForm({ ...reservationForm, tableId: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3">
                  <option value="">Sans table assignee</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>{table.label} � {table.zone}</option>
                  ))}
                </select>
                <input value={reservationForm.date} onChange={(event) => setReservationForm({ ...reservationForm, date: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" type="datetime-local" required />
                <textarea value={reservationForm.notes} onChange={(event) => setReservationForm({ ...reservationForm, notes: event.target.value })} className="min-h-28 rounded-2xl border border-forest/15 px-4 py-3 sm:col-span-2" placeholder="Notes" />
              </div>
              <button type="submit" className="mt-4 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white">Enregistrer</button>
            </form>

            <form className="surface-card p-6" onSubmit={handleCreateOrder}>
              <p className="eyebrow">Commande</p>
              <h2 className="mt-2 font-display text-3xl text-forest">Saisir une commande</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <select value={orderForm.tableId} onChange={(event) => setOrderForm({ ...orderForm, tableId: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" required>
                  <option value="">Choisir une table</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>{table.label} � {table.status}</option>
                  ))}
                </select>
                <input value={orderForm.customerName} onChange={(event) => setOrderForm({ ...orderForm, customerName: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" placeholder="Nom du client" required />
                <select value={orderForm.menuItemId} onChange={(event) => setOrderForm({ ...orderForm, menuItemId: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3 sm:col-span-2" required>
                  <option value="">Choisir un plat</option>
                  {menu.flatMap((category) => category.items).filter((item) => item.available).map((item) => (
                    <option key={item.id} value={item.id}>{item.name} � {formatCurrency(item.price)}</option>
                  ))}
                </select>
                <input value={orderForm.quantity} onChange={(event) => setOrderForm({ ...orderForm, quantity: Number(event.target.value) })} className="rounded-2xl border border-forest/15 px-4 py-3" type="number" min="1" required />
                <textarea value={orderForm.notes} onChange={(event) => setOrderForm({ ...orderForm, notes: event.target.value })} className="min-h-28 rounded-2xl border border-forest/15 px-4 py-3 sm:col-span-2" placeholder="Instructions" />
              </div>
              <button type="submit" className="mt-4 rounded-full bg-clay px-5 py-3 text-sm font-semibold text-white">Creer la commande</button>
            </form>
          </div>
          <div className="surface-card p-6">
            <p className="eyebrow">Flux salle</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Reservations et commandes</h2>
            <div className="mt-5 space-y-4">
              {reservations.map((reservation) => (
                <article key={reservation.id} className="rounded-[1.5rem] border border-forest/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-forest">{reservation.guestName}</p>
                      <p className="text-sm text-ink/60">{new Date(reservation.date).toLocaleString('fr-FR')} � {reservation.guests} pers.</p>
                    </div>
                    <StatusBadge value={reservation.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['confirmed', 'seated', 'completed', 'cancelled'].map((status) => (
                      <button key={status} type="button" onClick={() => token && api.updateReservationStatus(reservation.id, status, token).then(loadData)} className="rounded-full border border-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                        {status}
                      </button>
                    ))}
                  </div>
                </article>
              ))}

              {orders.map((order) => (
                <article key={order.id} className="rounded-[1.5rem] border border-forest/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-forest">{order.tableLabel} � {order.customerName}</p>
                      <p className="text-sm text-ink/60">{formatCurrency(order.total)}</p>
                    </div>
                    <StatusBadge value={order.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['sent_to_kitchen', 'served', 'closed'].map((status) => (
                      <button key={status} type="button" onClick={() => token && api.updateOrderStatus(order.id, status, token).then(loadData)} className="rounded-full border border-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                        {status}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeView === 'kitchen' && (
        <section className="surface-card p-6">
          <p className="eyebrow">Cuisine</p>
          <h2 className="mt-2 font-display text-3xl text-forest">Tickets de production</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {kitchenTickets.map((ticket) => (
              <article key={ticket.id} className="rounded-[1.5rem] border border-forest/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-forest">{ticket.tableLabel}</p>
                    <p className="text-sm text-ink/60">{ticket.customerName}</p>
                  </div>
                  <StatusBadge value={ticket.status} />
                </div>
                <ul className="mt-4 space-y-2 text-sm text-ink/70">
                  {ticket.items.map((item) => (
                    <li key={`${ticket.id}-${item.menuItemId}`}>{item.quantity} x {item.name}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['in_preparation', 'ready', 'served'].map((status) => (
                    <button key={status} type="button" onClick={() => token && api.updateKitchenStatus(ticket.id, status, token).then(loadData)} className="rounded-full border border-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeView === 'cashier' && (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form className="surface-card p-6" onSubmit={handleCreatePayment}>
            <p className="eyebrow">Caisse</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Encaisser une commande</h2>
            <div className="mt-5 space-y-4">
              <select value={paymentForm.orderId} onChange={(event) => setPaymentForm({ ...paymentForm, orderId: event.target.value })} className="w-full rounded-2xl border border-forest/15 px-4 py-3" required>
                <option value="">Selectionner une commande</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>{order.tableLabel} � {order.customerName} � {formatCurrency(order.total)}</option>
                ))}
              </select>
              <input value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: Number(event.target.value) })} className="w-full rounded-2xl border border-forest/15 px-4 py-3" type="number" min="0" placeholder="Montant" required />
              <select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })} className="w-full rounded-2xl border border-forest/15 px-4 py-3">
                <option value="cash">Cash</option>
                <option value="card">Carte</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
            <button type="submit" className="mt-4 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-forest">Valider le paiement</button>
          </form>

          <div className="surface-card p-6">
            <p className="eyebrow">Historique</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Flux caisse</h2>
            <div className="mt-5 space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-forest/10 p-4">
                  <div>
                    <p className="font-semibold text-forest">{payment.orderId}</p>
                    <p className="text-sm text-ink/60">{payment.method} � {new Date(payment.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-forest">{formatCurrency(payment.amount)}</p>
                    <StatusBadge value={payment.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {activeView === 'team' && (
        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="surface-card p-6">
            <p className="eyebrow">Equipe</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Comptes et affectations</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {staff.map((member) => (
                <article key={member.id} className="rounded-[1.5rem] border border-forest/10 p-4">
                  <p className="font-semibold text-forest">{member.name}</p>
                  <p className="mt-1 text-sm text-ink/60">{member.email}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <StatusBadge value={member.active ? 'available' : 'cleaning'} />
                    <p className="text-sm font-medium text-clay">{roleLabels[member.role]}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="eyebrow">Repartition</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Capacite par role</h2>
            <div className="mt-5 space-y-3">
              {summary && Object.entries(summary.roleBreakdown).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between rounded-[1.25rem] border border-forest/10 p-4">
                  <p className="font-semibold text-forest">{roleLabels[role as UserRole]}</p>
                  <p className="font-display text-2xl text-forest">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

