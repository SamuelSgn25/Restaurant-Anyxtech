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

- login par roles
- tableau de bord de pilotage
- gestion des reservations
- creation et suivi des commandes clients
- file cuisine pour le chef
- gestion de disponibilite du menu
- encaissement et historique des paiements
- liste des comptes staff pour les roles direction

## Roles disponibles

- `super_admin`
- `admin`
- `server`
- `chef`

## Comptes de demonstration

- Super admin: `superadmin@cactus.bj` / `SuperAdmin123!`
- Administrateur: `admin@cactus.bj` / `Admin123!`
- Serveur: `server@cactus.bj` / `Server123!`
- Chef de cuisine: `chef@cactus.bj` / `Chef123!`

## Structure

```text
.
|-- apps
|   |-- api
|   `-- web
|-- .github/workflows
`-- README.md
```

## Lancer le projet

```bash
npm install
npm run dev:api
npm run dev:web
```

- Frontend: `http://localhost:5173`
- Back office login: `http://localhost:5173/login`
- API: `http://localhost:3001/api`

## Base de donnees

Le projet est prepare pour PostgreSQL, mais l'iteration actuelle fonctionne avec des donnees seedees en memoire pour accelerer le developpement du produit.

Pour activer la connexion TypeORM/PostgreSQL plus tard:

```bash
ENABLE_DB=true
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=hotel_cactus_restaurant
```

## Endpoints principaux

### Public

- `POST /api/auth/login`
- `GET /api/menu`
- `POST /api/reservations`

### Proteges

- `GET /api/auth/me`
- `GET /api/dashboard/summary`
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
- Le backend est decoupe par domaines: auth, reservations, orders, kitchen, payments, dashboard, staff.
- Le socle est pense pour evoluer vers une vraie persistance PostgreSQL et une integration POS type Hamster.
