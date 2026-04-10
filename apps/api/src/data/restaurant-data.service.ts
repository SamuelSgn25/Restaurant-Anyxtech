import { Injectable, NotFoundException } from '@nestjs/common';
import {
  MenuItemRecord,
  OrderRecord,
  OrderStatus,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  ReservationRecord,
  ReservationStatus,
  StaffUser
} from '../common/types';

@Injectable()
export class RestaurantDataService {
  private readonly users: StaffUser[] = [
    {
      id: 'usr-super-admin',
      name: 'Direction Generale',
      email: 'superadmin@cactus.bj',
      password: 'SuperAdmin123!',
      role: 'super_admin'
    },
    {
      id: 'usr-admin',
      name: 'Gerant Restaurant',
      email: 'admin@cactus.bj',
      password: 'Admin123!',
      role: 'admin'
    },
    {
      id: 'usr-server',
      name: 'Serveur Principal',
      email: 'server@cactus.bj',
      password: 'Server123!',
      role: 'server'
    },
    {
      id: 'usr-chef',
      name: 'Chef de Cuisine',
      email: 'chef@cactus.bj',
      password: 'Chef123!',
      role: 'chef'
    }
  ];

  private readonly menuItems: MenuItemRecord[] = [
    {
      id: 'menu-1',
      category: 'Entrees',
      name: 'Tartare de daurade au gingembre',
      description: 'Agrumes, herbes fraiches et huile pimentee douce.',
      price: 9500,
      available: true,
      tags: ['poisson', 'signature']
    },
    {
      id: 'menu-2',
      category: 'Entrees',
      name: 'Accras de crevettes du golfe',
      description: 'Sauce verte au basilic africain.',
      price: 7500,
      available: true,
      tags: ['fruits de mer']
    },
    {
      id: 'menu-3',
      category: 'Plats',
      name: 'Poulet bicyclette facon yassa',
      description: 'Riz coco, oignons confits et citron vert.',
      price: 11000,
      available: true,
      tags: ['volaille', 'benin']
    },
    {
      id: 'menu-4',
      category: 'Plats',
      name: 'Filet de boeuf, jus au poivre de Penja',
      description: 'Puree lisse et legumes rotis.',
      price: 15000,
      available: true,
      tags: ['boeuf', 'premium']
    },
    {
      id: 'menu-5',
      category: 'Desserts',
      name: 'Ananas roti, creme legere vanille',
      description: 'Tuile croustillante et caramel epice.',
      price: 5500,
      available: true,
      tags: ['dessert']
    }
  ];

  private reservations: ReservationRecord[] = [
    {
      id: 'res-101',
      guestName: 'Marie Houessou',
      email: 'marie@example.com',
      phone: '+22961000001',
      guests: 4,
      date: '2026-04-10T19:30:00.000Z',
      notes: 'Anniversaire discret',
      status: 'confirmed',
      source: 'website'
    },
    {
      id: 'res-102',
      guestName: 'David Alavo',
      email: 'david@example.com',
      phone: '+22961000002',
      guests: 2,
      date: '2026-04-10T20:15:00.000Z',
      status: 'pending',
      source: 'staff'
    }
  ];

  private orders: OrderRecord[] = [
    {
      id: 'ord-301',
      tableLabel: 'Table 04',
      customerName: 'Mme Houessou',
      createdAt: '2026-04-09T18:05:00.000Z',
      serverId: 'usr-server',
      status: 'sent_to_kitchen',
      items: [
        {
          menuItemId: 'menu-3',
          name: 'Poulet bicyclette facon yassa',
          quantity: 2,
          unitPrice: 11000
        },
        {
          menuItemId: 'menu-5',
          name: 'Ananas roti, creme legere vanille',
          quantity: 1,
          unitPrice: 5500
        }
      ],
      notes: 'Servir doucement, table anniversaire'
    },
    {
      id: 'ord-302',
      tableLabel: 'Table 07',
      customerName: 'M. Moreau',
      createdAt: '2026-04-09T18:20:00.000Z',
      serverId: 'usr-server',
      status: 'ready',
      items: [
        {
          menuItemId: 'menu-1',
          name: 'Tartare de daurade au gingembre',
          quantity: 1,
          unitPrice: 9500
        }
      ]
    }
  ];

  private payments: PaymentRecord[] = [
    {
      id: 'pay-501',
      orderId: 'ord-302',
      amount: 9500,
      method: 'card',
      status: 'paid',
      processedBy: 'usr-admin',
      createdAt: '2026-04-09T18:45:00.000Z'
    }
  ];

  getUsers() {
    return this.users;
  }

  getPublicUsers() {
    return this.users.map(({ password, ...user }) => user);
  }

  getMenuItems() {
    return this.menuItems;
  }

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

  updateMenuItemAvailability(id: string, available: boolean) {
    const item = this.menuItems.find((entry) => entry.id === id);

    if (!item) {
      throw new NotFoundException('Plat introuvable');
    }

    item.available = available;
    return item;
  }

  getReservations() {
    return this.reservations;
  }

  createReservation(payload: Omit<ReservationRecord, 'id' | 'status' | 'source'> & { source: 'website' | 'staff' }) {
    const reservation: ReservationRecord = {
      id: `res-${Date.now()}`,
      status: 'pending',
      ...payload
    };

    this.reservations = [reservation, ...this.reservations];
    return reservation;
  }

  updateReservationStatus(id: string, status: ReservationStatus) {
    const reservation = this.reservations.find((entry) => entry.id === id);

    if (!reservation) {
      throw new NotFoundException('Reservation introuvable');
    }

    reservation.status = status;
    return reservation;
  }

  getOrders() {
    return this.orders.map((order) => ({
      ...order,
      total: this.computeOrderTotal(order)
    }));
  }

  createOrder(payload: Omit<OrderRecord, 'id' | 'createdAt' | 'status'>) {
    const order: OrderRecord = {
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'draft',
      ...payload
    };

    this.orders = [order, ...this.orders];
    return {
      ...order,
      total: this.computeOrderTotal(order)
    };
  }

  updateOrderStatus(id: string, status: OrderStatus) {
    const order = this.orders.find((entry) => entry.id === id);

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    order.status = status;
    return {
      ...order,
      total: this.computeOrderTotal(order)
    };
  }

  getKitchenTickets() {
    return this.getOrders().filter((order) =>
      ['sent_to_kitchen', 'in_preparation', 'ready'].includes(order.status)
    );
  }

  getPayments() {
    return this.payments;
  }

  createPayment(payload: Omit<PaymentRecord, 'id' | 'createdAt' | 'status'> & { status?: PaymentStatus }) {
    const payment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: payload.status ?? 'paid',
      ...payload
    };

    this.payments = [payment, ...this.payments];
    return payment;
  }

  getDashboardSummary() {
    const orders = this.getOrders();
    const revenue = this.payments
      .filter((payment) => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      staffCount: this.users.length,
      reservationCount: this.reservations.length,
      pendingReservations: this.reservations.filter((item) => item.status === 'pending').length,
      activeKitchenTickets: this.getKitchenTickets().length,
      openOrders: orders.filter((item) => item.status !== 'closed').length,
      revenue,
      averageTicket:
        orders.length === 0
          ? 0
          : Math.round(orders.reduce((sum, order) => sum + order.total, 0) / orders.length)
    };
  }

  private computeOrderTotal(order: OrderRecord) {
    return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }
}
