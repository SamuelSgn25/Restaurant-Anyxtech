# Restaurant Hotel Cactus

Plateforme complete et modulaire pour le restaurant de l'Hotel Cactus, concue avec un frontend React + Tailwind et un backend NestJS + PostgreSQL.

## Stack

- Frontend: React, Vite, Tailwind CSS, Vitest
- Backend: NestJS, TypeORM, PostgreSQL, Jest
- CI: GitHub Actions
- Architecture: monorepo npm workspaces

## Structure

```text
.
|-- apps
|   |-- api
|   `-- web
|-- .github/workflows
`-- README.md
```

## Philosophie modulaire

Le projet est construit autour de modules autonomes:

- Cote frontend, chaque section de page est un composant independant rendu via `SectionRenderer`.
- Le contenu est centralise dans `apps/web/src/content/site-content.ts`.
- Cote backend, chaque domaine est encapsule dans son module Nest: `menu`, `events`, `reservations`, `settings`.
- Cette structure permet de supprimer, remplacer ou ajouter des modules sans impact transversal important.

Le projet est pense pour evoluer vers un fonctionnement inspire des integrations POS type Hamster:

- activation ou desactivation de modules
- branchement progressif d'une vraie base PostgreSQL
- API de reservations
- synchronisation future avec caisse, CRM ou planning de salle

## Lancer le projet

```bash
npm install
npm run dev:web
npm run dev:api
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:3001/api`

## Scripts utiles

```bash
npm run build
npm test
npm run lint
```

## Endpoints backend

- `GET /api/settings/profile`
- `GET /api/menu`
- `GET /api/events`
- `POST /api/reservations`

Exemple de payload pour `POST /api/reservations`:

```json
{
  "guestName": "Jean Dupont",
  "email": "jean@example.com",
  "guests": 4,
  "notes": "Table terrasse"
}
```

## Inspiration

Le design reprend l'esprit du site de reference de l'Hotel Cactus: tonalite premium, accueil vegetal, mise en avant de l'experience et navigation claire. Les textes, la structure et les visuels ici ont ete recomposes pour une implementation propre, modulaire et maintenable.

## Remarques

- Les images utilisent des URLs externes a titre de placeholder.
- Les coordonnees peuvent etre remplacees facilement dans les fichiers de contenu.
- La configuration PostgreSQL passe par les variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
