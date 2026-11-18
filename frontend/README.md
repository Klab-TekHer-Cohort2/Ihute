# IHUTE – Ijwi ry'Umuhinzi (Frontend)

> One Farmer's Report. A Community Protected.

Frontend for IHUTE: farmer interface, agricultural officer dashboard and administrator dashboard.

## Stack

- **React 19 + TypeScript**, built with **Vite**
- **Tailwind CSS v4** (design tokens in `src/index.css`)
- **React Router**: routes and role-based guards
- **TanStack Query + Axios**: calls to the FastAPI backend
- **Zustand**: auth/session state
- **i18next**: Kinyarwanda first (`rw`), English fallback (`en`)
- **Leaflet / react-leaflet**: disease cluster maps
- **lucide-react**: icons

## Getting started

```bash
npm install
cp .env.example .env   # optional
npm run dev            # http://localhost:5173
```

During development, `/api/*` requests are proxied to `http://localhost:8000` (FastAPI).

| Script            | What it does               |
| ----------------- | -------------------------- |
| `npm run dev`     | Start the dev server       |
| `npm run build`   | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Lint with oxlint           |

## Project structure

```
src/
  app/           router, providers, route guards
  components/
    layout/      AppShell (farmer bottom tabs / dashboard sidebar)
    ui/          reusable UI primitives (Button, …)
  i18n/          i18next setup + locales/rw.json, en.json
  lib/           api client, helpers
  pages/
    auth/        login
    farmer/      farmer screens
    officer/     officer dashboard screens
    admin/       admin screens
  stores/        Zustand stores
  types/         shared domain types (reports, clusters, alerts)
```

## Routes

| Path | Role | Screen |
| --- | --- | --- |
| `/login`, `/register` | public | Sign in / create account |
| `/farmer` | farmer | Home: quick actions, crops, my reports, nearby alert |
| `/farmer/report` | farmer | Report a problem (crop, photo, description); `?crop=maize` preselects |
| `/farmer/assistant` | farmer | Assistant chat (voice input where the browser supports it) |
| `/farmer/alerts` | farmer | Approved alerts |
| `/officer` | officer | District overview: stats, map, review queue |
| `/officer/reports`, `/officer/reports/:id` | officer | Reports by status, report review and decision |
| `/officer/alerts`, `/officer/alerts/new`, `/officer/alerts/:id` | officer | Alert list, compose / approve alert |
| `/officer/map` | officer | Reports by sector on the map |
| `/admin`, `/admin/users` | admin | System overview, user directory |

## Demo mode

The backend is not connected yet. Screens read and write demo data held in the browser
(`src/stores/demo.ts`, seeded from `src/lib/demo-data.ts`), so the whole flow works:
a farmer's report appears in the officer queue, the officer verifies it and approves an alert,
and the farmer then sees the alert. Use the demo buttons on the sign-in page to switch roles;
the admin page has a "Reset demo data" button. Places to plug in the API are marked `TODO`.
