# AGENTS.md

## Cursor Cloud specific instructions

### Overview

TivAid is a single Next.js 16 application (not a monorepo) providing a healthcare platform with patient/doctor authentication, medical profiles, QR-based emergency access, appointments, and prescriptions.

### Services

| Service | How to start | Notes |
|---------|-------------|-------|
| PostgreSQL | `sudo pg_ctlcluster 16 main start` | Must be running before the Next.js app. Default URL: `postgresql://user:password@localhost:5432/tivaid` |
| Next.js dev server | `DATABASE_URL="postgresql://user:password@localhost:5432/tivaid" npm run dev` | Runs on port 3000. All UI + API routes served from this single process. |

### Common commands

See `package.json` scripts and `README.md` for details:

- `npm run dev` — start dev server (port 3000)
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check (`tsc --noEmit`)
- `npm run build` — production build
- `npm run prisma:validate` — validate Prisma schema (no DB needed)
- `npm run prisma:generate` — regenerate Prisma client
- `npx prisma db push` — sync schema to database (requires `DATABASE_URL`)

### Non-obvious caveats

- **Prisma 7+ config**: Uses `prisma.config.ts` (not the older `prisma/schema.prisma` datasource block) for the database URL. The config falls back to `postgresql://user:password@localhost:5432/tivaid` when `DATABASE_URL` is unset.
- **No test framework**: The repo currently has no test runner or test files. `npm run lint` and `npm run typecheck` are the primary automated checks.
- **Environment variables**: `JWT_SECRET` and `SENSITIVE_DATA_KEY` have development fallbacks so the app runs without `.env` file locally.
- **Database must exist**: Before starting the dev server, PostgreSQL must be running and the `tivaid` database must exist. Use `npx prisma db push` to sync the schema.
- **No migrations directory**: The project uses `prisma db push` for schema sync (no migration files yet).
