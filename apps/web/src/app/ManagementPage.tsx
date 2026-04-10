import { FormEvent, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { StatusBadge } from '../components/management/StatusBadge';
import { api } from '../lib/api';
import {
  DashboardSummary,
  MenuCategory,
  Order,
  Payment,
  Reservation,
  UserRole,
  AuthUser
} from '../types/management';
import { useAuth } from './AuthContext';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super admin',
  admin: 'Administrateur',
  server: 'Serveur',
  chef: 'Chef de cuisine'
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(amount);
}

export function ManagementPage() {
  const { token, user, logout, loading } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kitchenTickets, setKitchenTickets] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [staff, setStaff] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [reservationForm, setReservationForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    guests: 2,
    date: '2026-04-10T19:30',
    notes: ''
  });
  const [orderForm, setOrderForm] = useState({
    tableLabel: 'Table 01',
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

    void loadData();
  }, [token, user]);

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
      const baseCalls = await Promise.all([
        api.dashboard(token),
        api.menu(),
        user.role === 'chef' ? Promise.resolve([] as Reservation[]) : api.reservations(token),
        api.orders(token)
      ]);

      setSummary(baseCalls[0]);
      setMenu(baseCalls[1]);
      setReservations(baseCalls[2]);
      setOrders(baseCalls[3]);

      if (user.role === 'chef' || user.role === 'admin' || user.role === 'super_admin') {
        setKitchenTickets(await api.kitchen(token));
      } else {
        setKitchenTickets([]);
      }

      if (user.role === 'admin' || user.role === 'super_admin') {
        const [paymentData, staffData] = await Promise.all([api.payments(token), api.staff(token)]);
        setPayments(paymentData);
        setStaff(staffData);
      } else {
        setPayments([]);
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
      date: new Date(reservationForm.date).toISOString()
    });
    setReservationForm({
      guestName: '',
      email: '',
      phone: '',
      guests: 2,
      date: '2026-04-10T19:30',
      notes: ''
    });
    await loadData();
  }

  async function handleCreateOrder(event: FormEvent) {
    event.preventDefault();
    if (!token || !user) {
      return;
    }

    const item = menu.flatMap((category) => category.items).find((entry) => entry.id === orderForm.menuItemId);
    if (!item) {
      setError('Selectionnez un plat pour la commande.');
      return;
    }

    await api.createOrder(
      {
        tableLabel: orderForm.tableLabel,
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
      tableLabel: 'Table 01',
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

  return (
    <main className="section-shell space-y-8 py-10 lg:py-14">
      <section className="surface-card grid gap-6 bg-forest p-8 text-white lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow !text-gold/80">Back office restaurant</p>
          <h1 className="mt-3 font-display text-5xl leading-tight">Pilotage complet du restaurant de l'Hotel Cactus</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/75">
            Reservations, service en salle, production cuisine et paiements sont connectes dans une meme interface.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white/10 p-5 text-sm">
          <p className="font-semibold">{user?.name}</p>
          <p className="mt-1 text-white/70">{user ? roleLabels[user.role] : ''}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-semibold text-forest"
          >
            Se deconnecter
          </button>
        </div>
      </section>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Reservations', value: summary?.reservationCount ?? 0 },
          { label: 'Attente confirmation', value: summary?.pendingReservations ?? 0 },
          { label: 'Commandes ouvertes', value: summary?.openOrders ?? 0 },
          { label: 'CA encaisse', value: formatCurrency(summary?.revenue ?? 0) }
        ].map((card) => (
          <article key={card.label} className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">{card.label}</p>
            <p className="mt-4 font-display text-4xl text-forest">{card.value}</p>
          </article>
        ))}
      </section>

      {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'server') && (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form className="surface-card p-6" onSubmit={handleCreateReservation}>
            <p className="eyebrow">Reservations</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Nouvelle reservation</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input value={reservationForm.guestName} onChange={(event) => setReservationForm({ ...reservationForm, guestName: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" placeholder="Nom du client" required />
              <input value={reservationForm.phone} onChange={(event) => setReservationForm({ ...reservationForm, phone: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" placeholder="Telephone" required />
              <input value={reservationForm.email} onChange={(event) => setReservationForm({ ...reservationForm, email: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" placeholder="Email" type="email" required />
              <input value={reservationForm.guests} onChange={(event) => setReservationForm({ ...reservationForm, guests: Number(event.target.value) })} className="rounded-2xl border border-forest/15 px-4 py-3" type="number" min="1" max="20" required />
              <input value={reservationForm.date} onChange={(event) => setReservationForm({ ...reservationForm, date: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3 sm:col-span-2" type="datetime-local" required />
              <textarea value={reservationForm.notes} onChange={(event) => setReservationForm({ ...reservationForm, notes: event.target.value })} className="min-h-28 rounded-2xl border border-forest/15 px-4 py-3 sm:col-span-2" placeholder="Notes" />
            </div>
            <button type="submit" className="mt-4 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white">Enregistrer la reservation</button>
          </form>

          <div className="surface-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Suivi</p>
                <h2 className="mt-2 font-display text-3xl text-forest">Reservations en cours</h2>
              </div>
              <button type="button" onClick={() => void loadData()} className="rounded-full border border-forest/15 px-4 py-2 text-sm font-semibold text-forest">
                {busy ? 'Chargement...' : 'Actualiser'}
              </button>
            </div>
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
            </div>
          </div>
        </section>
      )}

      {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'server') && (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form className="surface-card p-6" onSubmit={handleCreateOrder}>
            <p className="eyebrow">Salle</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Saisir une commande client</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input value={orderForm.tableLabel} onChange={(event) => setOrderForm({ ...orderForm, tableLabel: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" placeholder="Table" required />
              <input value={orderForm.customerName} onChange={(event) => setOrderForm({ ...orderForm, customerName: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3" placeholder="Nom du client" required />
              <select value={orderForm.menuItemId} onChange={(event) => setOrderForm({ ...orderForm, menuItemId: event.target.value })} className="rounded-2xl border border-forest/15 px-4 py-3 sm:col-span-2" required>
                <option value="">Choisir un plat</option>
                {menu.flatMap((category) => category.items).filter((item) => item.available).map((item) => (
                  <option key={item.id} value={item.id}>{item.name} � {formatCurrency(item.price)}</option>
                ))}
              </select>
              <input value={orderForm.quantity} onChange={(event) => setOrderForm({ ...orderForm, quantity: Number(event.target.value) })} className="rounded-2xl border border-forest/15 px-4 py-3" type="number" min="1" required />
              <textarea value={orderForm.notes} onChange={(event) => setOrderForm({ ...orderForm, notes: event.target.value })} className="min-h-28 rounded-2xl border border-forest/15 px-4 py-3 sm:col-span-2" placeholder="Instructions de service ou cuisine" />
            </div>
            <button type="submit" className="mt-4 rounded-full bg-clay px-5 py-3 text-sm font-semibold text-white">Creer la commande</button>
          </form>

          <div className="surface-card p-6">
            <p className="eyebrow">Commandes</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Suivi en salle</h2>
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-[1.5rem] border border-forest/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-forest">{order.tableLabel} � {order.customerName}</p>
                      <p className="text-sm text-ink/60">{formatCurrency(order.total)} � {new Date(order.createdAt).toLocaleTimeString('fr-FR')}</p>
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

      {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'chef') && (
        <section className="surface-card p-6">
          <p className="eyebrow">Cuisine</p>
          <h2 className="mt-2 font-display text-3xl text-forest">File de production</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {kitchenTickets.map((ticket) => (
              <article key={ticket.id} className="rounded-[1.5rem] border border-forest/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-forest">{ticket.tableLabel} � {ticket.customerName}</p>
                  <StatusBadge value={ticket.status} />
                </div>
                <ul className="mt-3 space-y-2 text-sm text-ink/70">
                  {ticket.items.map((item) => (
                    <li key={`${ticket.id}-${item.menuItemId}`}>{item.quantity} x {item.name}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['in_preparation', 'ready'].map((status) => (
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

      {(user?.role === 'super_admin' || user?.role === 'admin') && (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-card p-6">
            <p className="eyebrow">Carte</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Disponibilite du menu</h2>
            <div className="mt-5 space-y-5">
              {menu.map((category) => (
                <div key={category.category}>
                  <h3 className="font-display text-2xl text-forest">{category.category}</h3>
                  <div className="mt-3 space-y-3">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-forest/10 p-4">
                        <div>
                          <p className="font-semibold text-forest">{item.name}</p>
                          <p className="text-sm text-ink/60">{formatCurrency(item.price)}</p>
                        </div>
                        <button type="button" onClick={() => token && api.updateMenuAvailability(item.id, !item.available, token).then(loadData)} className={`rounded-full px-4 py-2 text-xs font-semibold ${item.available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                          {item.available ? 'Disponible' : 'Indisponible'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <form className="surface-card p-6" onSubmit={handleCreatePayment}>
              <p className="eyebrow">Caisse</p>
              <h2 className="mt-2 font-display text-3xl text-forest">Encaisser une commande</h2>
              <div className="mt-5 space-y-4">
                <select value={paymentForm.orderId} onChange={(event) => setPaymentForm({ ...paymentForm, orderId: event.target.value })} className="w-full rounded-2xl border border-forest/15 px-4 py-3" required>
                  <option value="">Selectionner une commande</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>{order.tableLabel} � {formatCurrency(order.total)}</option>
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
              <p className="eyebrow">Equipe</p>
              <h2 className="mt-2 font-display text-3xl text-forest">Acces et postes</h2>
              <div className="mt-5 space-y-3">
                {staff.map((member) => (
                  <div key={member.id} className="rounded-[1.25rem] border border-forest/10 p-4">
                    <p className="font-semibold text-forest">{member.name}</p>
                    <p className="text-sm text-ink/60">{member.email} � {roleLabels[member.role]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card p-6">
              <p className="eyebrow">Paiements</p>
              <h2 className="mt-2 font-display text-3xl text-forest">Historique caisse</h2>
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
          </div>
        </section>
      )}
    </main>
  );
}
