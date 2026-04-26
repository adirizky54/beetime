# AGENTS.md

## Project Overview

**Bee Time** is a full-stack time tracking application for freelancers and agencies. It is organised as a **Turborepo monorepo** using **Bun** as the package manager and runtime.

```
beetime/
├── apps/
│   ├── api/        # @beetime/api  — REST API (Hono + Bun + Drizzle ORM + PostgreSQL)
│   └── web/        # @beetime/web  — Frontend SPA (React + TanStack Router/Query + Vite)
└── packages/
    ├── schema/     # @beetime/schema — shared Valibot schemas + TypeScript types (no build step)
    └── ui/         # @beetime/ui    — shared React component library (Shadcn + Tailwind CSS v4, no build step)
```

Key domains: projects, clients, tasks, members, organizations, timesheets. Authentication is handled by **Better Auth** with the organization plugin and role-based access control (RBAC).

---

## Setup

**Prerequisites:** Bun ≥ 1.3.13, Node.js ≥ 22.18, a running PostgreSQL instance.

```sh
# Install all workspace dependencies from the repo root
bun install

# Copy and fill in environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### API environment variables (`apps/api/.env`)

| Variable | Required | Notes |
|---|---|---|
| `APP_NAME` | No | Application name; defaults to `"Beetime API"` |
| `APP_ORIGIN` | Yes | Trusted frontend origin for CORS and Better Auth (e.g. `http://localhost:3000`) |
| `PORT` | No | API server port; defaults to `8080` |
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgresql://postgres:postgres@localhost:5432/postgres`) |
| `BETTER_AUTH_SECRET` | Yes | Secret key — **must be at least 32 characters** |

Env vars are parsed and validated at startup in `apps/api/src/env.ts` via Valibot. The process exits immediately if a required variable is missing or invalid.

### Web environment variables (`apps/web/.env`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL — **must include a trailing slash** (e.g. `http://localhost:8080/`) |

This is exposed to the browser as `import.meta.env.VITE_API_BASE_URL`.

---

## Development Workflow

```sh
# Start all dev servers in parallel (API + Web) from repo root
bun dev
```

- API: `http://localhost:8080` (hot-reload via `bun --hot`)
- Web: `http://localhost:3000` (Vite HMR)

To run a single app:

```sh
# API only
bun run dev --filter @beetime/api

# Web only
bun run dev --filter @beetime/web
```

---

## Database Workflow

All database commands delegate to `@beetime/api` via Turborepo's `-F` flag. Run them from the repo root.

```sh
bun db:generate   # Generate a new migration file from schema changes
bun db:migrate    # Apply all pending migrations
bun db:push       # Push schema directly to the DB — skips migration files (dev only)
bun db:studio     # Open Drizzle Studio (browser-based DB GUI) at http://localhost:4983
```

- Migration files live in `apps/api/src/database/migrations/`
- Schema source: `apps/api/src/database/schema/index.ts` (re-exports all domain schema files)
- Drizzle config: `apps/api/drizzle.config.ts`
- Migrations table: `drizzle_migrations` in schema `public`
- Column casing: `snake_case` in the database, `camelCase` in TypeScript (Drizzle handles the mapping)

> **Prefer `db:generate` + `db:migrate` over `db:push`** for any change that should be reproducible. `db:push` is intended for quick prototyping only.

---

## Build

```sh
# Build all apps and packages from repo root
bun build
```

Build outputs:
- `apps/api` → `dist/`
- `apps/web` → `.output/` (via Nitro/Vinxi) and `.vinxi/`

`build` has upstream dependency (`^build`), so packages are built before apps automatically.

---

## Type-Checking

```sh
# Type-check all packages in parallel
bun check:types

# Type-check a single package
bun run check:types --filter @beetime/api
bun run check:types --filter @beetime/web
bun run check:types --filter @beetime/schema
bun run check:types --filter @beetime/ui
```

All packages run `tsc --noEmit`. Fix all type errors before committing. Notable strictness flags active across packages:

- `strict: true` — in all packages
- `noUnusedLocals`, `noUnusedParameters` — in `apps/web` and `packages/schema`
- `noUncheckedIndexedAccess` — in `packages/schema` (strictest)
- `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports` — in `apps/web`
- `verbatimModuleSyntax: true` — in `apps/api` and `packages/schema` (use `import type` for type-only imports)

---

## Linting and Formatting

**No linting tool is currently configured.** The `check:lint` pipeline task exists as a stub but no package implements it. Do not attempt to run `bun check:lint` — it will succeed vacuously.

**No formatter is configured.** Follow the existing code style by convention:

- 2-space indentation, LF line endings, UTF-8 (enforced by `.editorconfig`)
- Double quotes for strings in the web app (matches TanStack Router codegen settings: `quoteStyle: "double"`, `semicolons: true`)
- `import type` for type-only imports (required by `verbatimModuleSyntax`)
- No trailing commas in function parameters (observe the existing style per file)

---

## Testing

**No tests exist yet.** There are no test files and no test runner is configured. The `coverage/` directory is listed in `.gitignore`, suggesting tests are planned. Do not add test-related configuration without discussing it first.

---

## Code Conventions

### General

- **Package manager:** always use `bun` — never `npm` or `pnpm`
- **Adding a dependency:** `bun add <package> --cwd apps/api` (or `--cwd apps/web`, etc.)
- **Internal package references:** use `workspace:*` in `package.json` (e.g. `"@beetime/schema": "workspace:*"`)
- **Workspace package names:** `@beetime/api`, `@beetime/web`, `@beetime/schema`, `@beetime/ui`

### API (`apps/api`)

**Import alias:** `@/*` → `src/*`. Use `@/` for all internal imports (e.g. `import { db } from "@/lib/db"`).

**Routing structure:**

- All routes are mounted under `/api/v1/`
- Organization-scoped resources use `.basePath("/:orgId")` inside the organizations router
- Each route handler should be thin: validate input → call a service function → return a response

**Middleware order for protected routes:**

```ts
authMiddleware → verifyMembership → authorize({ resource, actions }) → validator("json", Schema)
```

**Service layer (`src/services/`):**

- One file per domain: `clients.ts`, `members.ts`, `projects.ts`, `tasks.ts`
- Services are plain async functions imported with namespace import: `import * as projectService from "@/services/projects"`
- Throw `HTTPException` from `hono/http-exception` for domain errors (404, 409, 403, 400)

**API response shapes:**

```ts
// Success — single item or mutation
{ data: T | null, message: string }

// Success — paginated list
{ data: T[], meta: { page, pageSize, pageCount, total }, message: string }

// Validation error (400)
{ message: string, errors: Record<string, string[]> }

// Other errors (401, 403, 404, 500)
{ message: string }
```

**Drizzle schema conventions:**

- Tables: `pgTable("snake_case_name", { ... })`
- Primary keys: `uuid().primaryKey().defaultRandom()` for app tables; `text("id").primaryKey()` for Better Auth–managed tables
- Timestamps: `timestamp("created_at").defaultNow().notNull()` for creation; `.$onUpdate(() => new Date())` for updates
- Soft-delete/archive pattern: `archivedAt: timestamp("archived_at")` (nullable column, null = active)
- Enums: `pgEnum("enum_name", [...values])` — defined in the same schema file as the table that uses them
- Relations: declared separately with `relations(table, ({ one, many }) => ({ ... }))`
- Indexes: defined as third argument to `pgTable`

**Query building pattern:**

```ts
const conditions: SQL[] = []
if (params.search) conditions.push(ilike(clients.name, `%${params.search}%`))
const result = await db.query.clients.findMany({
  where: and(...conditions),
})
```

### Web (`apps/web`)

**Import aliases:**
- `@/*` → `src/*`
- `@beetime/ui/*` → `../../packages/ui/src/*` (also available via Vite `tsconfigPaths`)

**File-based routing (TanStack Router):**

- Routes live in `src/routes/`
- `routeTree.gen.ts` is **auto-generated** — never edit it manually. It is read-only in VS Code by project settings.
- Every route file exports a `Route` constant: `export const Route = createFileRoute("/<path>")({ ... })`
- Dynamic segments use `$` prefix: `$orgId/`, `$projectId/`
- Layout routes use `component` with an `<Outlet />` inside
- Auth guards and organization setup go in `beforeLoad`

**TanStack Query pattern (`src/queries/`):**

```ts
export const projectQueries = {
  all: () => ["projects"] as const,
  listKey: (orgId: string) => [...projectQueries.all(), "list", orgId] as const,
  list: (orgId: string, params: ProjectQuery) =>
    queryOptions({
      queryKey: projectQueries.listKey(orgId),
      queryFn: async ({ signal }) => api.get<PaginatedResponse<Project>>(..., { signal }),
    }),
  create: (orgId: string) =>
    mutationOptions({
      mutationKey: [...projectQueries.all(), "create", orgId],
      mutationFn: async (data: CreateProject) => api.post<Project>(...),
    }),
}
```

`QueryClient` is configured with `defaultOptions.queries.staleTime = 5 * 60 * 1000` (5 minutes).

**HTTP client (`src/lib/api.ts`):**

- `ApiClient` wraps `ky` with `baseUrl: import.meta.env.VITE_API_BASE_URL`, `prefix: "/api"`, `credentials: "include"`, 30s timeout
- Use the exported `api` singleton: `api.get<T>(path)`, `api.post<T>(path, body)`, `api.put<T>(path, body)`, `api.patch<T>(path, body)`, `api.delete<T>(path)`

**Adding new Shadcn UI components:**

```sh
# Run from apps/web — components are scaffolded into packages/ui/src/components/
bunx shadcn add <component-name>
```

Components go into `packages/ui/src/components/` and are consumed as `@beetime/ui/components/<name>`.

### Shared Schema (`packages/schema`)

- Consumed as TypeScript source directly — no build step, no compilation required
- Import in other packages: `import { ProjectSchema, type Project } from "@beetime/schema"`
- One file per domain: `client.ts`, `member.ts`, `project.ts`, `task.ts`
- Pattern per domain:

```ts
// 1. Read schema (mirrors DB shape)
export const ProjectSchema = v.object({ id: v.string(), name: v.string(), ... })

// 2. Input schemas (with validation)
export const CreateProjectSchema = v.object({ name: v.pipe(v.string(), v.minLength(1)), ... })
export const UpdateProjectSchema = v.partial(CreateProjectSchema)

// 3. Query schema (pagination + filters)
export const ProjectQuerySchema = v.object({ ...PaginationSchema.entries, search: v.optional(v.string()) })

// 4. Inferred types
export type Project = v.InferOutput<typeof ProjectSchema>
export type CreateProject = v.InferOutput<typeof CreateProjectSchema>
```

- Cross-field validation: `v.pipe(schema, v.forward(v.check(fn, "message"), ["fieldName"]))`
- `PaginationSchema` is in `src/utils.ts`; it transforms query string values to numbers

### Shared UI (`packages/ui`)

- Consumed as TypeScript source directly — no build step
- Import paths: `@beetime/ui/components/<name>`, `@beetime/ui/lib/utils`, `@beetime/ui/hooks/<name>`, `@beetime/ui/globals.css`
- The `cn()` utility (clsx + tailwind-merge) is at `@beetime/ui/lib/utils`
- Global styles and Tailwind CSS v4 design tokens: `packages/ui/src/styles/globals.css`
- Icon library: `@remixicon/react` — use `Ri*` prefixed components (e.g. `RiAddLine`, `RiUserLine`)

---

## Monorepo Navigation Tips

- Use `bun run <script> --filter <package-name>` to run a script in a specific workspace (e.g. `bun run check:types --filter @beetime/api`)
- Check `package.json` → `"name"` in each workspace to confirm the correct filter name
- Turborepo caches task outputs; use `bun run <task> --force` to bypass the cache when needed
- `bun dev` starts all persistent services together using Turbo's TUI mode

---

## Pre-commit Checklist

Before committing any change, ensure:

1. `bun check:types` passes with zero errors across all packages
2. No `routeTree.gen.ts` manual edits — this file is auto-generated by the Vite plugin on `bun dev`
3. New DB schema changes come with a generated migration: `bun db:generate`
4. New shared types and validation schemas go in `packages/schema`, not duplicated in `apps/`
5. New reusable UI components go in `packages/ui/src/components/`, not in `apps/web/src/components/ui/`
6. `import type` is used for type-only imports in all files (required by `verbatimModuleSyntax`)
