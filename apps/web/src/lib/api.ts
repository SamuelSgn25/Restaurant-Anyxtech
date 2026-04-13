import {
  AuthUser,
  DashboardSummary,
  LoginResponse,
  MenuCategory,
  Order,
  Payment,
  Reservation,
  RestaurantTable,
  TableStatus
} from '../types/management';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Erreur API');
  }

  return response.json() as Promise<T>;
}

export const api = {
  login(email: string, password: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  me(token: string) {
    return request<AuthUser>('/auth/me', undefined, token);
  },
  dashboard(token: string) {
    return request<DashboardSummary>('/dashboard/summary', undefined, token);
  },
  menu() {
    return request<MenuCategory[]>('/menu');
  },
  updateMenuAvailability(id: string, available: boolean, token: string) {
    return request(`/menu/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available })
    }, token);
  },
  tables(token: string) {
    return request<RestaurantTable[]>('/tables', undefined, token);
  },
  updateTableStatus(id: string, status: TableStatus, token: string) {
    return request<RestaurantTable>(`/tables/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, token);
  },
  reservations(token: string) {
    return request<Reservation[]>('/reservations', undefined, token);
  },
  createReservation(payload: {
    guestName: string;
    email: string;
    phone: string;
    guests: number;
    date: string;
    notes?: string;
    tableId?: string;
  }) {
    return request<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateReservationStatus(id: string, status: string, token: string) {
    return request(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, token);
  },
  orders(token: string) {
    return request<Order[]>('/orders', undefined, token);
  },
  createOrder(payload: {
    tableId: string;
    tableLabel: string;
    customerName: string;
    serverId: string;
    items: Array<{ menuItemId: string; name: string; quantity: number; unitPrice: number }>;
    notes?: string;
  }, token: string) {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);
  },
  updateOrderStatus(id: string, status: string, token: string) {
    return request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, token);
  },
  kitchen(token: string) {
    return request<Order[]>('/kitchen/tickets', undefined, token);
  },
  updateKitchenStatus(id: string, status: string, token: string) {
    return request<Order>(`/kitchen/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, token);
  },
  payments(token: string) {
    return request<Payment[]>('/payments', undefined, token);
  },
  createPayment(payload: { orderId: string; amount: number; method: string; processedBy: string }, token: string) {
    return request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);
  },
  staff(token: string) {
    return request<AuthUser[]>('/staff', undefined, token);
  }
};
