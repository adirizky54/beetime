# AGENTS.md

## Project Overview

**Bee Time** is a full-stack time tracking application for freelancers and agencies. It is organised as a **Turborepo monorepo** using **Bun** as the package manager and runtime.

```
beetime/
├── apps/
│   ├── api/        # @beetime/api   — REST API (Hono + Bun + Drizzle ORM + PostgreSQL)
│   └── web/        # @beetime/web   — Frontend SPA (React + TanStack Router/Query + Vite)
└── packages/
    ├── email/      # @beetime/email  — Transactional email templates and mailer (React Email + Resend)
    ├── env/        # @beetime/env    — Shared environment variable validation (Valibot, no build step)
    ├── schema/     # @beetime/schema — Shared Valibot schemas + TypeScript types (no build step)
    └── ui/         # @beetime/ui    — Shared React component library (Shadcn + Tailwind CSS v4, no build step)
```

Key domains: projects, clients, tasks, members, organizations, timesheets. Authentication is handled by **Better Auth** with the organization plugin and role-based access control (RBAC). Transactional email (verification, notifications) is handled by **Resend** via the `@beetime/email` package.

---

## Setup

**Prerequisites:** Bun ≥ 1.3.13, Node.js ≥ 22.18, a running PostgreSQL instance, and a [Resend](https://resend.com) account for transactional email.

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
| `API_ORIGIN` | Yes | Root URL where your application server is hosted (e.g. `http://localhost:8080`) |
| `PORT` | No | API server port; defaults to `8080` |
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgresql://postgres:postgres@localhost:5432/postgres`) |
| `BETTER_AUTH_SECRET` | Yes | Secret key — **must be at least 32 characters** |
| `RESEND_API_KEY` | Yes | API key from your Resend dashboard |
| `RESEND_EMAIL_FROM` | Yes | Verified sender address for outgoing emails (e.g. `noreply@yourdomain.com`) |

Env vars are parsed and validated at startup via Valibot in `packages/env/src/api.ts`. The process exits immediately if a required variable is missing or invalid. The validated `env` object and `Env` type are imported as:

```ts
import { env, type Env } from "@beetime/env/api"
```

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

To run a single app or package:

```sh
# API only
bun run dev --filter @beetime/api

# Web only
bun run dev --filter @beetime/web

# Email template preview (React Email dev server)
bun run dev --filter @beetime/email
# Opens at http://localhost:3001 — no Resend account needed for local preview
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

`build` has an upstream dependency (`^build`), so packages are built before apps automatically.

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
bun run check:types --filter @beetime/env
bun run check:types --filter @beetime/email
```

All packages run `tsc --noEmit`. Fix all type errors before committing. Notable strictness flags active across packages:

- `strict: true` — in all packages
- `noUnusedLocals`, `noUnusedParameters` — in `apps/web`, `packages/schema`, and `packages/env`
- `noUncheckedIndexedAccess` — in `packages/schema` (strictest)
- `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports` — in `apps/web` and `packages/env`
- `verbatimModuleSyntax: true` — in `apps/api`, `packages/schema`, and `packages/env` (use `import type` for type-only imports)
- `jsx: react-jsx` — in `packages/email` and `packages/ui`

---

## Linting and Formatting

Both linting and formatting are configured and enforced across all packages.

- **Linter:** [oxlint](https://oxc.rs/docs/guide/usage/linter) — root config at `.oxlintrc.json`, with plugins: `eslint`, `typescript`, `import`, `promise`, `unicorn`, `oxc`
- **Formatter:** [oxfmt](https://github.com/nicolo-ribaudo/oxfmt) — config at `.oxfmtrc.json`

```sh
# Check everything (format + lint + types)
bun check

# Check individually
bun check:format   # formatting only
bun check:lint     # linting only
bun check:types    # TypeScript only

# Auto-fix everything
bun fix

# Auto-fix individually
bun fix:format     # formatting
bun fix:lint       # lint auto-fixes
```

Style conventions (not enforced by tooling, follow by observation):

- 2-space indentation, LF line endings, UTF-8 (enforced by `.editorconfig`)
- Double quotes for strings in the web app (matches TanStack Router codegen: `quoteStyle: "double"`, `semicolons: true`)
- `import type` for type-only imports (required by `verbatimModuleSyntax`)
- No trailing commas in function parameters (observe the existing style per file)

---

## Testing

**No tests exist yet.** There are no test files and no test runner is configured. The `coverage/` directory is listed in `.gitignore`, suggesting tests are planned. Do not add test-related configuration without discussing it first.

---

## Code Conventions

### General

- **Package manager:** always use `bun` — never `npm` or `pnpm`
- **Adding a dependency:** `bun add <package> --cwd apps/api` (or `--cwd apps/web`, `--cwd packages/email`, etc.)
- **Internal package references:** use `workspace:*` in `package.json` (e.g. `"@beetime/schema": "workspace:*"`)
- **Workspace package names:** `@beetime/api`, `@beetime/web`, `@beetime/schema`, `@beetime/ui`, `@beetime/env`, `@beetime/email`

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

### Shared Environment (`packages/env`)

- Consumed as TypeScript source directly — no build step, no compilation required
- Exports a single subpath: `@beetime/env/api` → `src/api.ts`
- Parses and validates `process.env` with Valibot at import time — **do not import this in browser code**
- Usage:

```ts
import { env, type Env } from "@beetime/env/api"
// env.DATABASE_URL, env.RESEND_API_KEY, etc.
```

- To add a new env var: add it to the `EnvSchema` in `packages/env/src/api.ts`, then update `apps/api/.env.example`
- Uses `verbatimModuleSyntax: true` — use `import type` for type-only imports

### Shared Email (`packages/email`)

- Consumed as TypeScript source directly — no build step
- Import path: `@beetime/email` → `index.ts`
- Email templates are React components in `packages/email/templates/`
- Shared layout primitives live in `packages/email/components/`
- Depends on `@beetime/env` for Resend credentials at send time

**Adding a new email template:**

1. Create a React component in `packages/email/templates/<name>.tsx`
2. Add a send function in `packages/email/mailer.ts` that renders the template and calls `sendEmail`
3. Export the new send function from `packages/email/index.ts`
4. Preview the template locally:

```sh
bun run dev --filter @beetime/email
# Opens React Email dev server at http://localhost:3001
```

**Send function pattern:**

```ts
export async function sendWelcomeEmail(
  env: Pick<Env, "RESEND_API_KEY" | "RESEND_EMAIL_FROM">,
  options: { user: { email: string; name?: string } },
) {
  const component = WelcomeEmail({ name: options.user.name })
  const html = await render(component)
  const text = toPlainText(html)
  return sendEmail(env, { to: options.user.email, subject: "Welcome!", html, text })
}
```

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

1. `bun check` passes with zero errors across all packages (covers format, lint, and types)
2. No `routeTree.gen.ts` manual edits — this file is auto-generated by the Vite plugin on `bun dev`
3. New DB schema changes come with a generated migration: `bun db:generate`
4. New env vars are added to `packages/env/src/api.ts` **and** `apps/api/.env.example`
5. New shared types and validation schemas go in `packages/schema`, not duplicated in `apps/`
6. New email templates and send functions go in `packages/email`, not inline in `apps/api`
7. New reusable UI components go in `packages/ui/src/components/`, not in `apps/web/src/components/ui/`
8. `import type` is used for type-only imports in all files (required by `verbatimModuleSyntax`)

---

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (`adirizky54/beetime`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
