export type UserRole = 'super_admin' | 'admin' | 'server' | 'chef';
export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
export type OrderStatus =
  | 'draft'
  | 'sent_to_kitchen'
  | 'in_preparation'
  | 'ready'
  | 'served'
  | 'closed';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface DashboardSummary {
  staffCount: number;
  reservationCount: number;
  pendingReservations: number;
  activeKitchenTickets: number;
  openOrders: number;
  revenue: number;
  averageTicket: number;
}

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  tags: string[];
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface Reservation {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  notes?: string;
  status: ReservationStatus;
  source: 'website' | 'staff';
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  tableLabel: string;
  customerName: string;
  createdAt: string;
  serverId: string;
  status: OrderStatus;
  items: OrderItem[];
  notes?: string;
  total: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'paid' | 'refunded';
  processedBy: string;
  createdAt: string;
}
