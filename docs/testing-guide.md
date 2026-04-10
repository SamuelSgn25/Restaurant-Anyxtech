# Guide de test complet

Ce document decrit une procedure simple pour verifier le projet du point de vue technique et fonctionnel.

## 1. Pre-requis

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Deux terminaux

## 2. Installation

Depuis la racine du projet:

```bash
npm install
```

## 3. Lancement rapide sans PostgreSQL

Le backend fonctionne deja avec des donnees seed en memoire.

Terminal 1:

```bash
npm run dev:api
```

Terminal 2:

```bash
npm run dev:web
```

Ensuite ouvrir:

- Site public: `http://localhost:5173`
- Login dashboard: `http://localhost:5173/login`
- API: `http://localhost:3001/api`

## 4. Comptes de demonstration

- Super admin: `superadmin@cactus.bj` / `SuperAdmin123!`
- Super admin 2: `superadmin2@cactus.bj` / `SuperAdmin456!`
- Admin: `admin@cactus.bj` / `Admin123!`
- Admin 2: `admin2@cactus.bj` / `Admin456!`
- Serveur: `server@cactus.bj` / `Server123!`
- Serveur 2: `server2@cactus.bj` / `Server456!`
- Chef: `chef@cactus.bj` / `Chef123!`
- Caissier: `cashier@cactus.bj` / `Cashier123!`

## 5. Scenarios fonctionnels a tester

### Direction / super admin

1. Se connecter avec un compte `super_admin`
2. Verifier les KPIs globaux du dashboard
3. Aller dans `Tables` et changer le statut d'une table
4. Aller dans `Equipe` et verifier la repartition par role
5. Aller dans `Caisse` et verifier les encaissements

### Gerant / admin

1. Se connecter avec `admin@cactus.bj`
2. Creer une reservation avec table assignee
3. Creer une commande pour une table
4. Basculer la commande vers `sent_to_kitchen`
5. Verifier que la table passe en statut occupe selon le flux

### Serveur

1. Se connecter avec `server@cactus.bj`
2. Consulter les tables disponibles
3. Creer une reservation ou une commande
4. Marquer une commande `served` puis `closed`
5. Verifier que la table passe ensuite en `cleaning`

### Chef de cuisine

1. Se connecter avec `chef@cactus.bj`
2. Ouvrir l'onglet `Cuisine`
3. Faire evoluer un ticket de `sent_to_kitchen` vers `in_preparation` puis `ready`

### Caissier

1. Se connecter avec `cashier@cactus.bj`
2. Ouvrir l'onglet `Caisse`
3. Encaisser une commande ouverte
4. Verifier la ligne dans l'historique des paiements

## 6. Tests techniques

```bash
npm test
npm run lint
npm run build
```

## 7. Activer PostgreSQL

### 7.1 Creer la base

Le script SQL de base est dans `db/init.sql`.

Exemple:

```bash
psql -U postgres -f db/init.sql
```

### 7.2 Variables d'environnement

```bash
ENABLE_DB=true
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=hotel_cactus_restaurant
```

### 7.3 Remarque importante

Dans l'etat actuel, le code applicatif reste encore base sur un store en memoire pour la logique metier principale. Le script PostgreSQL fournit le schema de reference attendu pour la prochaine etape de branchement TypeORM complet.

## 8. API manuelle avec curl

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cactus.bj","password":"Admin123!"}'
```

### Lister les tables

```bash
curl http://localhost:3001/api/tables \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Changer le statut d'une table

```bash
curl -X PATCH http://localhost:3001/api/tables/tbl-1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{"status":"occupied"}'
```
