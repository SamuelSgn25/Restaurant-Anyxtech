CREATE DATABASE hotel_cactus_restaurant;
\connect hotel_cactus_restaurant;

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'server', 'chef', 'cashier');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'seated', 'completed', 'cancelled');
CREATE TYPE order_status AS ENUM ('draft', 'sent_to_kitchen', 'in_preparation', 'ready', 'served', 'closed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mobile_money');
CREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved', 'cleaning');

CREATE TABLE staff_users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE restaurant_tables (
  id VARCHAR(64) PRIMARY KEY,
  label VARCHAR(40) UNIQUE NOT NULL,
  zone VARCHAR(80) NOT NULL,
  seats INTEGER NOT NULL CHECK (seats > 0),
  status table_status NOT NULL DEFAULT 'available',
  active_order_id VARCHAR(64),
  active_reservation_id VARCHAR(64)
);

CREATE TABLE menu_items (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(80) NOT NULL,
  name VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  available BOOLEAN NOT NULL DEFAULT TRUE,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

CREATE TABLE reservations (
  id VARCHAR(64) PRIMARY KEY,
  guest_name VARCHAR(140) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 20),
  reservation_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  status reservation_status NOT NULL DEFAULT 'pending',
  source VARCHAR(20) NOT NULL,
  table_id VARCHAR(64) REFERENCES restaurant_tables(id)
);

CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  table_id VARCHAR(64) NOT NULL REFERENCES restaurant_tables(id),
  table_label VARCHAR(40) NOT NULL,
  customer_name VARCHAR(140) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  server_id VARCHAR(64) NOT NULL REFERENCES staff_users(id),
  status order_status NOT NULL DEFAULT 'draft',
  notes TEXT
);

CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id VARCHAR(64) NOT NULL REFERENCES menu_items(id),
  name VARCHAR(140) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0)
);

CREATE TABLE payments (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'paid',
  processed_by VARCHAR(64) NOT NULL REFERENCES staff_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE restaurant_tables
  ADD CONSTRAINT restaurant_tables_active_order_fk
  FOREIGN KEY (active_order_id) REFERENCES orders(id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE restaurant_tables
  ADD CONSTRAINT restaurant_tables_active_reservation_fk
  FOREIGN KEY (active_reservation_id) REFERENCES reservations(id) DEFERRABLE INITIALLY DEFERRED;

INSERT INTO staff_users (id, name, email, password_hash, role, active) VALUES
('usr-super-admin-1', 'Direction Generale A', 'superadmin@cactus.bj', 'replace-with-hash', 'super_admin', TRUE),
('usr-super-admin-2', 'Direction Generale B', 'superadmin2@cactus.bj', 'replace-with-hash', 'super_admin', TRUE),
('usr-admin-1', 'Gerant Restaurant Matin', 'admin@cactus.bj', 'replace-with-hash', 'admin', TRUE),
('usr-admin-2', 'Gerante Restaurant Soir', 'admin2@cactus.bj', 'replace-with-hash', 'admin', TRUE),
('usr-server-1', 'Serveur Principal', 'server@cactus.bj', 'replace-with-hash', 'server', TRUE),
('usr-server-2', 'Serveuse Terrasse', 'server2@cactus.bj', 'replace-with-hash', 'server', TRUE),
('usr-chef-1', 'Chef de Cuisine', 'chef@cactus.bj', 'replace-with-hash', 'chef', TRUE),
('usr-cashier-1', 'Caissiere Principale', 'cashier@cactus.bj', 'replace-with-hash', 'cashier', TRUE);

INSERT INTO restaurant_tables (id, label, zone, seats, status) VALUES
('tbl-1', 'Table 01', 'Salle principale', 2, 'available'),
('tbl-2', 'Table 02', 'Salle principale', 4, 'reserved'),
('tbl-3', 'Table 03', 'Terrasse', 4, 'available'),
('tbl-4', 'Table 04', 'Terrasse', 6, 'occupied'),
('tbl-5', 'Table 05', 'Salon prive', 8, 'cleaning'),
('tbl-6', 'Table 06', 'Salle principale', 2, 'available'),
('tbl-7', 'Table 07', 'Terrasse', 4, 'occupied'),
('tbl-8', 'Table 08', 'Salon prive', 10, 'available');

INSERT INTO menu_items (id, category, name, description, price, available, tags) VALUES
('menu-1', 'Entrees', 'Tartare de daurade au gingembre', 'Agrumes, herbes fraiches et huile pimentee douce.', 9500, TRUE, ARRAY['poisson', 'signature']),
('menu-2', 'Entrees', 'Accras de crevettes du golfe', 'Sauce verte au basilic africain.', 7500, TRUE, ARRAY['fruits de mer']),
('menu-3', 'Plats', 'Poulet bicyclette facon yassa', 'Riz coco, oignons confits et citron vert.', 11000, TRUE, ARRAY['volaille', 'benin']),
('menu-4', 'Plats', 'Filet de boeuf, jus au poivre de Penja', 'Puree lisse et legumes rotis.', 15000, TRUE, ARRAY['boeuf', 'premium']),
('menu-5', 'Desserts', 'Ananas roti, creme legere vanille', 'Tuile croustillante et caramel epice.', 5500, TRUE, ARRAY['dessert']);
