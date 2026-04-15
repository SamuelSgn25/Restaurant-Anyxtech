export type UserRole = 'super_admin' | 'admin' | 'server' | 'chef' | 'cashier';
export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
export type OrderStatus = 'draft' | 'sent_to_kitchen' | 'in_preparation' | 'ready' | 'served' | 'closed';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type TableShape = 'round' | 'square' | 'booth';
export type NotificationType = 'reservation' | 'order' | 'payment' | 'staff' | 'menu' | 'table';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  active: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface DashboardSummary {
  staffCount: number;
  activeStaff: number;
  reservationCount: number;
  pendingReservations: number;
  activeKitchenTickets: number;
  openOrders: number;
  revenue: number;
  averageTicket: number;
  tables: Record<TableStatus, number>;
  roleBreakdown: Record<UserRole, number>;
}

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  available: boolean; image?: string;
  tags: string[];
  createdBy?: string;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface RestaurantTable {
  id: string;
  label: string;
  zone: string;
  seats: number;
  status: TableStatus;
  shape: TableShape;
  posX: number;
  posY: number;
  width: number;
  height: number;
  activeOrderId?: string;
  activeReservationId?: string;
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
  tableId?: string;
  preferredZone?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  tableId: string;
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

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface CreateMenuItemPayload {
  category: string;
  name: string;
  description: string;
  price: number;
  available?: boolean; image?: string;
  tags?: string[];
}

export interface CreateTablePayload {
  label: string;
  zone: string;
  seats: number;
  shape: TableShape;
  posX: number;
  posY: number;
  width: number;
  height: number;
  status?: TableStatus;
}
