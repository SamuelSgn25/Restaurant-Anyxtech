export type UserRole = 'super_admin' | 'admin' | 'server' | 'chef' | 'cashier';
export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
export type OrderStatus = 'draft' | 'sent_to_kitchen' | 'in_preparation' | 'ready' | 'served' | 'closed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type TableShape = 'round' | 'square' | 'booth';
export type NotificationType = 'reservation' | 'order' | 'payment' | 'staff' | 'menu' | 'table';

export interface ModuleMetadata {
  code: string;
  enabled: boolean;
  title: string;
  description: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  password: string;
  role: UserRole;
  active: boolean;
}

export interface MenuItemRecord {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  tags: string[];
  createdBy?: string;
}

export interface ReservationRecord {
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

export interface OrderLineRecord {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderRecord {
  id: string;
  tableId: string;
  tableLabel: string;
  customerName: string;
  createdAt: string;
  serverId: string;
  status: OrderStatus;
  items: OrderLineRecord[];
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  processedBy: string;
  createdAt: string;
}

export interface RestaurantTableRecord {
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

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}
