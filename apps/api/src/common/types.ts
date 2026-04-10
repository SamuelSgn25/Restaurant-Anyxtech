export type UserRole = 'super_admin' | 'admin' | 'server' | 'chef';

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
export type OrderStatus =
  | 'draft'
  | 'sent_to_kitchen'
  | 'in_preparation'
  | 'ready'
  | 'served'
  | 'closed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money';

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
  password: string;
  role: UserRole;
}

export interface MenuItemRecord {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  tags: string[];
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
}

export interface OrderLineRecord {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderRecord {
  id: string;
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
