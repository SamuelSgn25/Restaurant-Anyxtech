# Restaurant Hotel Cactus

Plateforme modulaire complete pour le restaurant de l'Hotel Cactus, avec site public React + Tailwind et back office restaurant connecte a une API NestJS.

## Stack

- Frontend: React, Vite, Tailwind CSS, Vitest
- Backend: NestJS, TypeScript, validation DTO, architecture prete pour PostgreSQL
- CI: GitHub Actions
- Architecture: monorepo npm workspaces

## Ce qui est maintenant en place

### Site public

- pages vitrine du restaurant
- univers premium inspire de l'Hotel Cactus
- structure modulaire par sections reutilisables

### Back office restaurant

- login multi-roles
- dashboard interactif
- gestion des tables avec statut d'occupation
- gestion des reservations
- creation et suivi des commandes clients
- file cuisine pour le chef
- role dedie a la caisse
- gestion de disponibilite du menu
- liste des comptes staff pour les roles direction

## Roles disponibles

- `super_admin`
- `admin`
- `server`
- `chef`
- `cashier`

## Comptes de demonstration

- Super admin: `superadmin@cactus.bj` / `SuperAdmin123!`
- Super admin 2: `superadmin2@cactus.bj` / `SuperAdmin456!`
- Administrateur: `admin@cactus.bj` / `Admin123!`
- Administrateur 2: `admin2@cactus.bj` / `Admin456!`
- Serveur: `server@cactus.bj` / `Server123!`
- Serveur 2: `server2@cactus.bj` / `Server456!`
- Chef de cuisine: `chef@cactus.bj` / `Chef123!`
- Caissier: `cashier@cactus.bj` / `Cashier123!`

## Lancer le projet

```bash
npm install
npm run dev:api
npm run dev:web
```

- Frontend: `http://localhost:5173`
- Back office login: `http://localhost:5173/login`
- API: `http://localhost:3001/api`

## PostgreSQL

Un script SQL de reference est maintenant disponible dans [db/init.sql](/home/samuelsgn/Restaurant-Anyxtech/db/init.sql).

Le backend peut tourner sans PostgreSQL avec des donnees seed en memoire. Pour preparer la base de donnees:

```bash
psql -U postgres -f db/init.sql
```

Variables d'environnement pour la connexion:

```bash
ENABLE_DB=true
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=hotel_cactus_restaurant
```

## Guide de test complet

La procedure complete de verification fonctionnelle et technique est detaillee dans [testing-guide.md](/home/samuelsgn/Restaurant-Anyxtech/docs/testing-guide.md).

## Endpoints principaux

### Public

- `POST /api/auth/login`
- `GET /api/menu`
- `POST /api/reservations`

### Proteges

- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `GET /api/tables`
- `PATCH /api/tables/:id/status`
- `GET /api/reservations`
- `PATCH /api/reservations/:id/status`
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`
- `GET /api/kitchen/tickets`
- `PATCH /api/kitchen/tickets/:id/status`
- `GET /api/payments`
- `POST /api/payments`
- `GET /api/staff`
- `PATCH /api/menu/:id/availability`

## Scripts utiles

```bash
npm test
npm run lint
npm run build
```

## Notes d'architecture

- Le site public et le back office vivent dans la meme application frontend mais sur des routes separees.
- Le backend est decoupe par domaines: auth, reservations, tables, orders, kitchen, payments, dashboard, staff.
- Le schema SQL represente la cible PostgreSQL a brancher pour la prochaine iteration TypeORM complete.
