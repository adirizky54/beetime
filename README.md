<div align="center">

<img src="apps/web/public/logo192.png" alt="Bee Time" height="96" />

# Bee Time

A modern open-source time tracking application for freelancers and agencies.

[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Bun](https://img.shields.io/badge/Bun-1.3.13-fbf0df?style=flat-square&logo=bun)](https://bun.sh)
[![Node.js](https://img.shields.io/badge/Node.js->=22.18-3c873a?style=flat-square)](https://nodejs.org)

[Features](#features) • [Project Structure](#project-structure) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Scripts](#available-scripts)

</div>

Bee Time is a full-stack, monorepo-based time tracking application. It provides project management, client tracking, task management, and time reporting — all built on a modern, end-to-end type-safe stack.

## Features

- **Desktop timer app** — Dedicated Electron app with a live timer bar, org/project tree picker, and per-task timer start/stop
- **Project management** — Create projects with public/private visibility, assign members, and link clients
- **Client management** — Manage client contacts and archive inactive clients
- **Task tracking** — Organize tasks per project and mark them done or undone
- **Timesheets** — Dedicated time tracking view for logging work hours
- **Dashboard** — Overview with stat cards and date-range filtering
- **Multi-organization** — Users can belong to multiple organizations with isolated data
- **Authentication** — Email/password sign-up, login, and password reset via [Better Auth](https://www.better-auth.com)
- **Transactional email** — Email verification and notifications powered by [Resend](https://resend.com) and [React Email](https://react.email)
- **Role-based access control** — Organization-level roles: `owner`, `admin`, and `member`
- **Settings** — Configurable date, time, and interval formats per organization

## Project Structure

This is a [Turborepo](https://turborepo.com) monorepo managed with [Bun](https://bun.sh) workspaces:

```
beetime/
├── apps/
│   ├── api/        # REST API — Hono + Bun + Drizzle ORM
│   ├── desktop/    # Desktop app — Electron via electron-vite, React 19, TanStack Router/Query
│   └── web/        # Frontend SPA — React, TanStack Router/Query, Vite
└── packages/
    ├── schema/     # Shared Valibot validation schemas and TypeScript types
    └── ui/         # Shared React component library (Shadcn UI + Tailwind CSS v4)
```

The desktop app uses an **electron-vite** three-process architecture:
- `src/main/` — Electron main process (window management, IPC)
- `src/preload/` — Preload script (contextBridge API exposure)
- `src/renderer/` — React app with hash-based TanStack Router, TanStack Query, and Tailwind CSS v4

The `@beetime/schema` package is shared across the stack, providing a single source of truth for validation and TypeScript types.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime & package manager | [Bun](https://bun.sh) |
| Monorepo orchestration | [Turborepo](https://turborepo.com) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| API framework | [Hono](https://hono.dev) |
| Authentication | [Better Auth](https://www.better-auth.com) |
| Database ORM | [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL |
| Desktop framework | [Electron](https://www.electronjs.org) via [electron-vite](https://electron-vite.org) |
| Desktop router | [TanStack Router](https://tanstack.com/router) (hash history) |
| Frontend framework | [React](https://react.dev) + [TanStack Start](https://tanstack.com/start) (web) / React (desktop) |
| Routing | [TanStack Router](https://tanstack.com/router) (file-based) |
| Data fetching | [TanStack Query](https://tanstack.com/query) |
| UI components | [Shadcn UI](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| Validation | [Valibot](https://valibot.dev) |
| Forms | [React Hook Form](https://react-hook-form.com) |
| Transactional email | [React Email](https://react.email) + [Resend](https://resend.com) |
| Linting & formatting | [oxlint](https://oxc.rs/docs/guide/usage/linter) + [oxfmt](https://github.com/nicolo-ribaudo/oxfmt) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.13
- [Node.js](https://nodejs.org) >= 22.18
- A running [PostgreSQL](https://www.postgresql.org) instance
- A [Resend](https://resend.com) account for transactional email

### Installation

1. Clone the repository and install dependencies:

   ```sh
   git clone <repo-url>
   cd beetime
   bun install
   ```

2. Set up environment variables for each app:

   ```sh
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   **`apps/api/.env`**

   | Variable | Description | Default |
   |---|---|---|
   | `APP_NAME` | Application name | `Beetime API` |
   | `API_ORIGIN` | Root URL where your application server is hosted | `http://localhost:8080` |
   | `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/postgres` |
   | `BETTER_AUTH_SECRET` | Secret key for Better Auth (min. 32 chars) | — |
   | `RESEND_API_KEY` | API key from your [Resend](https://resend.com) dashboard | — |
   | `RESEND_EMAIL_FROM` | Sender address for outgoing emails (must be a verified domain) | — |

   **`apps/web/.env`**

   | Variable | Description | Default |
   |---|---|---|
   | `VITE_API_BASE_URL` | Backend API base URL (must include trailing slash) | `http://localhost:8080/` |

3. Apply database migrations:

   ```sh
   bun db:migrate
   ```

4. Start the development servers:

   ```sh
   bun dev
   ```

   - API: `http://localhost:8080`
   - Web: `http://localhost:3000`
   - Desktop: Launches an Electron window (hot-reload via `electron-vite dev`)

> [!NOTE]
> The desktop app does not require any `.env` file. There are no desktop-specific environment variables.

> [!NOTE]
> On first sign-up, a personal organization is automatically created for the new user.

> [!TIP]
> Use `bun db:studio` to open Drizzle Studio, a browser-based database GUI, for inspecting and editing your data during development.

## Available Scripts

All scripts are run from the monorepo root with `bun <script>`.

| Script | Description |
|---|---|
| `dev` | Start all dev servers in parallel |
| `build` | Build all apps and packages |
| `check` | Run all checks (lint, format, types) |
| `check:lint` | Run linting only |
| `check:format` | Run formatting check only |
| `check:types` | Run TypeScript type-check only |
| `fix` | Run all auto-fixers (lint + format) |
| `fix:lint` | Auto-fix lint issues |
| `fix:format` | Auto-fix formatting issues |
| `clean` | Remove all build artifacts and `node_modules` |
| `db:generate` | Generate Drizzle ORM migration files from schema |
| `db:migrate` | Apply pending database migrations |
| `db:push` | Push schema directly to the database (skips migration files) |
| `db:studio` | Open Drizzle Studio — a browser-based database GUI |

> [!WARNING]
> `db:push` modifies the database schema directly without creating a migration file. Use it only during early development; prefer `db:generate` + `db:migrate` in all other cases.
