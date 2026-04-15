# AnyxTech Restaurant Management - Le Cactus 🌵

This is a complete full-stack restaurant management platform built with React, NestJS, and PostgreSQL. It focuses on premium user experience, complete control over the restaurant flow (tables, booking, POS, kitchen, caching), and a modern dynamic public showcase.

## Workspace Architecture
The application is a monorepo consisting of:
- **`apps/web`**: Frontend built in React + Vite + TailwindCSS.
- **`apps/api`**: Backend API built in NestJS + Prisma/TypeORM connected to postgres.
- **`db`**: Database configuration containing SQL initial schemas (e.g. `init.sql`).

## Core Functionalities

### 1. Front-Office (Public Facing Website)
A stunning glassmorphic UI representing the hotel/restaurant.
- **Dynamic Menu ('La Carte')**: Showcases meals instantly fetched from the backend.
- **Booking ('Réservation')**: Allows end-users to book seats seamlessly. A streamlined hero CTA helps boost conversions.

### 2. Back-Office (Management Dashboard)
Available entirely under the `/management` route, it provides role-based functionality:

- **Dashboard / Metrics**: Instant summary of revenues and active tables.
- **Team Management (`Equipe`)**: HR logic to add/remove and modify permissions for staff (Waiters, Chefs, Cashiers, Admins). Simplistic layout prioritizing performance.
- **Plan de Salle (`Floor Plan`)**: Interactive drag-and-drop table grid where owners can redesign tables spatially. Waiters can assign reservations, drag orders to tables, and immediately instantiate ticket orders for seated users.
- **Service & Reservations**: Streamlines table assigning. An action logic enforces status changes (Pending -> Confirmed -> Seated -> Completed -> Cleaned).
- **Cuisine & Menu (`Kitchen`)**: Chefs view incoming orders via the `En préparation` and `Prêt` queue. Live updating helps kitchen output remain hot and timely.
- **Caisse & Facturation (`Cashier`)**: Close out tickets, process payments via Cash, Card or Mobile Money, and seamlessly print/download PDF invoices designed securely for accounting purposes.

## Security & Workflow
- Role-Based Access Control (RBAC): Every function is properly scoped to an Auth user (`super_admin`, `admin`, `cashier`, etc.).
- Continuous Integration (`.github/workflows/ci.yml`): The CI/CD checks the entire TypeScript schema, unit tests, linters, and conducts a Docker composite build for smooth deployment safely blocking bad pushes from entering production.

## Getting Started
To spin up:
```bash
npm install # Setup all repo deps
npm run build # Run monorepo compiler
```
Wait for tests to pass or spin `docker compose build` for container deployment automatically verified by GitHub actions.
