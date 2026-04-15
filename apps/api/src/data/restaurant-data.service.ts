import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';
import {
  MenuItemRecord,
  NotificationRecord,
  OrderRecord,
  OrderStatus,
  PaymentRecord,
  PaymentStatus,
  ReservationRecord,
  ReservationStatus,
  RestaurantTableRecord,
  StaffUser,
  TableStatus,
  UserRole
} from '../common/types';

@Injectable()
export class RestaurantDataService {
  private readonly users: StaffUser[] = [
    { id: 'usr-super-admin-1', name: 'Direction Generale A', email: 'superadmin@cactus.bj', password: 'SuperAdmin123!', role: 'super_admin', active: true },
    { id: 'usr-super-admin-2', name: 'Direction Generale B', email: 'superadmin2@cactus.bj', password: 'SuperAdmin456!', role: 'super_admin', active: true },
    { id: 'usr-admin-1', name: 'Gerant Restaurant Matin', email: 'admin@cactus.bj', password: 'Admin123!', role: 'admin', active: true },
    { id: 'usr-admin-2', name: 'Gerante Restaurant Soir', email: 'admin2@cactus.bj', password: 'Admin456!', role: 'admin', active: true },
    { id: 'usr-server-1', name: 'Serveur Principal', email: 'server@cactus.bj', password: 'Server123!', role: 'server', active: true },
    { id: 'usr-server-2', name: 'Serveuse Terrasse', email: 'server2@cactus.bj', password: 'Server456!', role: 'server', active: true },
    { id: 'usr-chef-1', name: 'Chef de Cuisine', email: 'chef@cactus.bj', password: 'Chef123!', role: 'chef', active: true },
    { id: 'usr-cashier-1', name: 'Caissiere Principale', email: 'cashier@cactus.bj', password: 'Cashier123!', role: 'cashier', active: true }
  ];

  private readonly menuItems: MenuItemRecord[] = [
    { id: 'menu-1', category: 'Entrees', name: 'Tartare de daurade au gingembre', description: 'Agrumes, herbes fraiches et huile pimentee douce.', price: 9500, available: true, tags: ['poisson', 'signature'], createdBy: 'usr-chef-1' },
    { id: 'menu-2', category: 'Entrees', name: 'Accras de crevettes du golfe', description: 'Sauce verte au basilic africain.', price: 7500, available: true, tags: ['fruits de mer'], createdBy: 'usr-chef-1' },
    { id: 'menu-3', category: 'Plats', name: 'Poulet bicyclette facon yassa', description: 'Riz coco, oignons confits et citron vert.', price: 11000, available: true, tags: ['volaille', 'benin'], createdBy: 'usr-chef-1' },
    { id: 'menu-4', category: 'Plats', name: 'Filet de boeuf, jus au poivre de Penja', description: 'Puree lisse et legumes rotis.', price: 15000, available: true, tags: ['boeuf', 'premium'], createdBy: 'usr-admin-1' },
    { id: 'menu-5', category: 'Desserts', name: 'Ananas roti, creme legere vanille', description: 'Tuile croustillante et caramel epice.', price: 5500, available: true, tags: ['dessert'], createdBy: 'usr-chef-1' }
  ];

  private tables: RestaurantTableRecord[] = [
    { id: 'tbl-1', label: 'Table 01', zone: 'Salle principale', seats: 2, status: 'available', shape: 'round', posX: 8, posY: 10, width: 14, height: 14 },
    { id: 'tbl-2', label: 'Table 02', zone: 'Salle principale', seats: 4, status: 'reserved', shape: 'square', posX: 34, posY: 14, width: 15, height: 15, activeReservationId: 'res-101' },
    { id: 'tbl-3', label: 'Table 03', zone: 'Salle principale', seats: 4, status: 'available', shape: 'square', posX: 62, posY: 22, width: 15, height: 15 },
    { id: 'tbl-4', label: 'Table 04', zone: 'Terrasse', seats: 6, status: 'occupied', shape: 'round', posX: 18, posY: 18, width: 18, height: 18, activeOrderId: 'ord-301' },
    { id: 'tbl-5', label: 'Table 05', zone: 'Terrasse', seats: 4, status: 'cleaning', shape: 'round', posX: 55, posY: 20, width: 15, height: 15 },
    { id: 'tbl-6', label: 'Table 06', zone: 'Terrasse', seats: 2, status: 'available', shape: 'round', posX: 78, posY: 52, width: 13, height: 13 },
    { id: 'tbl-7', label: 'Table 07', zone: 'Salon prive', seats: 6, status: 'occupied', shape: 'booth', posX: 18, posY: 18, width: 24, height: 18, activeOrderId: 'ord-302' },
    { id: 'tbl-8', label: 'Table 08', zone: 'Salon prive', seats: 10, status: 'available', shape: 'booth', posX: 56, posY: 50, width: 28, height: 18 }
  ];

  private reservations: ReservationRecord[] = [
    { id: 'res-101', guestName: 'Marie Houessou', email: 'marie@example.com', phone: '+22961000001', guests: 4, date: '2026-04-13T19:30:00.000Z', notes: 'Anniversaire discret', status: 'confirmed', source: 'website', tableId: 'tbl-2', preferredZone: 'Salle principale' },
    { id: 'res-102', guestName: 'David Alavo', email: 'david@example.com', phone: '+22961000002', guests: 2, date: '2026-04-13T20:15:00.000Z', status: 'pending', source: 'staff', preferredZone: 'Terrasse' }
  ];

  private orders: OrderRecord[] = [
    { id: 'ord-301', tableId: 'tbl-4', tableLabel: 'Table 04', customerName: 'Mme Houessou', createdAt: '2026-04-13T18:05:00.000Z', serverId: 'usr-server-1', status: 'sent_to_kitchen', items: [{ menuItemId: 'menu-3', name: 'Poulet bicyclette facon yassa', quantity: 2, unitPrice: 11000 }, { menuItemId: 'menu-5', name: 'Ananas roti, creme legere vanille', quantity: 1, unitPrice: 5500 }], notes: 'Servir doucement, table anniversaire' },
    { id: 'ord-302', tableId: 'tbl-7', tableLabel: 'Table 07', customerName: 'M. Moreau', createdAt: '2026-04-13T18:20:00.000Z', serverId: 'usr-server-2', status: 'ready', items: [{ menuItemId: 'menu-1', name: 'Tartare de daurade au gingembre', quantity: 1, unitPrice: 9500 }] }
  ];

  private payments: PaymentRecord[] = [
    { id: 'pay-501', orderId: 'ord-302', amount: 9500, method: 'card', status: 'paid', processedBy: 'usr-cashier-1', createdAt: '2026-04-13T18:45:00.000Z' }
  ];

  private notifications: NotificationRecord[] = [
    { id: 'notif-1', type: 'reservation', title: 'Nouvelle reservation web', message: 'Marie Houessou a reserve 4 couverts.', createdAt: '2026-04-13T17:10:00.000Z', read: false },
    { id: 'notif-2', type: 'order', title: 'Commande envoyee en cuisine', message: 'La Table 04 attend la preparation.', createdAt: '2026-04-13T18:06:00.000Z', read: false },
    { id: 'notif-3', type: 'payment', title: 'Paiement recu', message: 'La commande ord-302 a ete encaissee.', createdAt: '2026-04-13T18:45:00.000Z', read: true }
  ];

  constructor(
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway
  ) {}

  getUsers() { return this.users; }
  getPublicUsers() { return this.users.map(({ password, ...user }) => user); }

  getUserById(id: string) {
    const user = this.users.find((entry) => entry.id === id);
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  updateUser(id: string, payload: Partial<StaffUser>) {
    const user = this.getUserById(id);
    if (payload.name) user.name = payload.name;
    if (payload.email) user.email = payload.email;
    if (payload.role) user.role = payload.role;
    this.pushNotification('staff', 'Profil modifie', `${user.name} a mis a jour son profil.`);
    const { password, ...safeUser } = user;
    return safeUser;
  }

  updateUserPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = this.getUserById(userId);
    if (user.password !== currentPassword) throw new BadRequestException('Mot de passe actuel invalide');
    user.password = newPassword;
    this.pushNotification('staff', 'Mot de passe modifie', `${user.name} a mis a jour ses acces.`);
    const { password, ...safeUser } = user;
    return safeUser;
  }

  updateUserProfile(userId: string, payload: { name?: string; phone?: string; address?: string }) {
    const user = this.getUserById(userId);
    if (payload.name) user.name = payload.name;
    if (payload.phone) user.phone = payload.phone;
    if (payload.address) user.address = payload.address;
    this.pushNotification('staff', 'Profil modifie', `${user.name} a mis a jour son profil.`);
    const { password, ...safeUser } = user;
    return safeUser;
  }

  createStaff(createdBy: { id: string; role: UserRole }, payload: Omit<StaffUser, 'id' | 'active'>) {
    if (this.users.some((entry) => entry.email === payload.email)) throw new BadRequestException('Cet email est deja utilise');
    const allowedRoles: Record<UserRole, UserRole[]> = {
      super_admin: ['super_admin', 'admin', 'server', 'chef', 'cashier'],
      admin: ['server', 'chef', 'cashier'],
      server: [],
      chef: [],
      cashier: []
    };
    if (!allowedRoles[createdBy.role].includes(payload.role)) throw new BadRequestException('Vous ne pouvez pas creer ce role');
    const user: StaffUser = { id: `usr-${payload.role}-${Date.now()}`, active: true, ...payload };
    this.users.unshift(user);
    this.pushNotification('staff', 'Nouveau compte staff', `${payload.name} a ete ajoute avec le role ${payload.role}.`);
    const { password, ...safeUser } = user;
    return safeUser;
  }

  getRoleBreakdown() {
    return this.users.reduce<Record<UserRole, number>>((acc, user) => {
      acc[user.role] += 1;
      return acc;
    }, { super_admin: 0, admin: 0, server: 0, chef: 0, cashier: 0 });
  }

  getMenuItems() { return this.menuItems; }
  getMenuCategories() {
    return this.menuItems.reduce<Array<{ category: string; items: MenuItemRecord[] }>>((acc, item) => {
      const existing = acc.find((entry) => entry.category === item.category);
      if (existing) {
        existing.items.push(item);
        return acc;
      }
      acc.push({ category: item.category, items: [item] });
      return acc;
    }, []);
  }

  createMenuItem(createdBy: string, payload: Omit<MenuItemRecord, 'id'>) {
    const item: MenuItemRecord = { id: `menu-${Date.now()}`, ...payload, createdBy };
    this.menuItems.unshift(item);
    this.pushNotification('menu', 'Carte mise a jour', `${item.name} a ete ajoute a la carte.`);
    return item;
  }

  updateMenuItemAvailability(id: string, available: boolean) {
    const item = this.menuItems.find((entry) => entry.id === id);
    if (!item) throw new NotFoundException('Plat introuvable');
    item.available = available;
    this.pushNotification('menu', 'Disponibilite modifiee', `${item.name} est maintenant ${available ? 'disponible' : 'indisponible'}.`);
    return item;
  }

  getTables() { return this.tables; }
  getVisibleTables() {
    return this.tables.map(({ id, label, zone, seats, status, shape, posX, posY, width, height }) => ({ id, label, zone, seats, status, shape, posX, posY, width, height }));
  }

  createTable(payload: Omit<RestaurantTableRecord, 'id' | 'activeOrderId' | 'activeReservationId'>) {
    const table: RestaurantTableRecord = { id: `tbl-${Date.now()}`, ...payload };
    this.tables.push(table);
    this.pushNotification('table', 'Nouvelle table ajoutee', `${table.label} a ete ajoutee dans ${table.zone}.`);
    return table;
  }

  updateTable(id: string, payload: Partial<RestaurantTableRecord>) {
    const table = this.findTable(id);
    Object.assign(table, payload);
    this.pushNotification('table', 'Plan de salle modifie', `${table.label} a ete mis a jour.`);
    return table;
  }

  deleteTable(id: string) {
    const table = this.findTable(id);
    if (table.activeOrderId || table.activeReservationId) throw new BadRequestException('Impossible de supprimer une table deja affectee');
    this.tables = this.tables.filter((entry) => entry.id !== id);
    this.pushNotification('table', 'Table supprimee', `${table.label} a ete retiree du plan.`);
    return { success: true };
  }

  updateTableStatus(id: string, status: TableStatus) {
    const table = this.findTable(id);
    table.status = status;
    if (status === 'available') {
      table.activeOrderId = undefined;
      table.activeReservationId = undefined;
    }
    this.pushNotification('table', 'Etat table modifie', `${table.label} est maintenant ${status}.`);
    return table;
  }

  getReservations() { return this.reservations; }

  createReservation(payload: Omit<ReservationRecord, 'id' | 'status' | 'source'> & { source: 'website' | 'staff' }) {
    const reservation: ReservationRecord = { id: `res-${Date.now()}`, status: 'pending', ...payload };
    this.reservations = [reservation, ...this.reservations];
    if (reservation.tableId) {
      const table = this.findTable(reservation.tableId);
      table.status = 'reserved';
      table.activeReservationId = reservation.id;
    }
    this.pushNotification('reservation', 'Nouvelle reservation', `${reservation.guestName} a reserve ${reservation.guests} couverts.`);
    return reservation;
  }

  updateReservationStatus(id: string, status: ReservationStatus) {
    const reservation = this.findReservation(id);
    reservation.status = status;
    if (reservation.tableId) {
      const table = this.findTable(reservation.tableId);
      if (status === 'confirmed') { table.status = 'reserved'; table.activeReservationId = reservation.id; }
      if (status === 'seated') { table.status = 'occupied'; table.activeReservationId = reservation.id; }
      if (status === 'completed' || status === 'cancelled') { table.status = 'available'; table.activeReservationId = undefined; }
    }
    this.pushNotification('reservation', 'Reservation mise a jour', `${reservation.guestName} est maintenant ${status}.`);
    return reservation;
  }

  assignReservationToTable(id: string, tableId?: string) {
    const reservation = this.findReservation(id);
    if (reservation.tableId) {
      const previousTable = this.findTable(reservation.tableId);
      previousTable.activeReservationId = undefined;
      if (!previousTable.activeOrderId) previousTable.status = 'available';
    }
    reservation.tableId = tableId;
    if (tableId) {
      const table = this.findTable(tableId);
      table.activeReservationId = reservation.id;
      table.status = reservation.status === 'seated' ? 'occupied' : 'reserved';
    }
    this.pushNotification('table', 'Reservation repositionnee', `${reservation.guestName} a ete affecte${tableId ? 'e' : 'e sans table'} au plan de salle.`);
    return reservation;
  }

  getOrders() { return this.orders.map((order) => ({ ...order, total: this.computeOrderTotal(order) })); }

  createOrder(payload: Omit<OrderRecord, 'id' | 'createdAt' | 'status' | 'tableLabel'>) {
    const table = this.findTable(payload.tableId);
    const order: OrderRecord = { id: `ord-${Date.now()}`, createdAt: new Date().toISOString(), status: 'draft', ...payload, tableLabel: table.label };
    table.status = 'occupied';
    table.activeOrderId = order.id;
    this.orders = [order, ...this.orders];
    this.pushNotification('order', 'Nouvelle commande', `${order.tableLabel} vient de recevoir une commande.`);
    return { ...order, total: this.computeOrderTotal(order) };
  }

  updateOrderStatus(id: string, status: OrderStatus) {
    const order = this.findOrder(id);
    order.status = status;
    const table = this.findTable(order.tableId);
    if (status === 'closed') {
      table.status = 'cleaning';
      table.activeOrderId = undefined;
    } else {
      table.status = 'occupied';
      table.activeOrderId = order.id;
    }
    this.pushNotification('order', 'Commande mise a jour', `${order.tableLabel} est maintenant ${status}.`);
    return { ...order, total: this.computeOrderTotal(order) };
  }

  moveOrderToTable(id: string, tableId: string) {
    const order = this.findOrder(id);
    const oldTable = this.findTable(order.tableId);
    oldTable.activeOrderId = undefined;
    if (!oldTable.activeReservationId) oldTable.status = 'available';
    const newTable = this.findTable(tableId);
    order.tableId = newTable.id;
    order.tableLabel = newTable.label;
    newTable.activeOrderId = order.id;
    newTable.status = 'occupied';
    this.pushNotification('table', 'Clients deplaces', `${order.customerName} a ete deplace vers ${newTable.label}.`);
    return { ...order, total: this.computeOrderTotal(order) };
  }

  getKitchenTickets() { return this.getOrders().filter((order) => ['sent_to_kitchen', 'in_preparation', 'ready'].includes(order.status)); }
  getPayments() { return this.payments; }

  createPayment(payload: Omit<PaymentRecord, 'id' | 'createdAt' | 'status'> & { status?: PaymentStatus }) {
    const payment: PaymentRecord = { id: `pay-${Date.now()}`, createdAt: new Date().toISOString(), status: payload.status ?? 'paid', ...payload };
    this.payments = [payment, ...this.payments];
    this.pushNotification('payment', 'Paiement enregistre', `Le paiement de ${payment.amount} XOF a ete enregistre.`);
    return payment;
  }

  getNotifications() { return this.notifications; }
  markNotificationRead(id: string) {
    const notification = this.notifications.find((entry) => entry.id === id);
    if (!notification) throw new NotFoundException('Notification introuvable');
    notification.read = true;
    return notification;
  }

  getDashboardSummary() {
    const orders = this.getOrders();
    const revenue = this.payments.filter((payment) => payment.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0);
    const tableSummary = this.tables.reduce<Record<TableStatus, number>>((acc, table) => { acc[table.status] += 1; return acc; }, { available: 0, occupied: 0, reserved: 0, cleaning: 0 });
    return {
      staffCount: this.users.length,
      reservationCount: this.reservations.length,
      pendingReservations: this.reservations.filter((item) => item.status === 'pending').length,
      activeKitchenTickets: this.getKitchenTickets().length,
      openOrders: orders.filter((item) => item.status !== 'closed').length,
      revenue,
      averageTicket: orders.length === 0 ? 0 : Math.round(orders.reduce((sum, order) => sum + order.total, 0) / orders.length),
      tables: tableSummary,
      roleBreakdown: this.getRoleBreakdown(),
      activeStaff: this.users.filter((user) => user.active).length
    };
  }

  private findTable(id: string) {
    const table = this.tables.find((entry) => entry.id === id);
    if (!table) throw new NotFoundException('Table introuvable');
    return table;
  }

  private findReservation(id: string) {
    const reservation = this.reservations.find((entry) => entry.id === id);
    if (!reservation) throw new NotFoundException('Reservation introuvable');
    return reservation;
  }

  private findOrder(id: string) {
    const order = this.orders.find((entry) => entry.id === id);
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  private pushNotification(type: NotificationRecord['type'], title: string, message: string) {
    const notification = { id: `notif-${Date.now()}-${Math.round(Math.random() * 1000)}`, type, title, message, createdAt: new Date().toISOString(), read: false };
    this.notifications.unshift(notification);
    this.eventsGateway.broadcast('notification', notification);
    this.eventsGateway.broadcast('refresh_dashboard', {});
  }

  private computeOrderTotal(order: OrderRecord) { return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0); }
}
