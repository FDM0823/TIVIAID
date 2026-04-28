# TivAid

TivAid is a proposed healthcare platform for patients and doctors, centered on
medical profiles, longitudinal health records, doctor-patient care workflows,
appointments, prescriptions, and QR-based emergency medical access.

## Project blueprint

- [Architecture, folder structure, and tech stack](docs/architecture.md)
- [Initial Prisma database schema](prisma/schema.prisma)

## Local development

Install dependencies and start the Next.js app:

```bash
npm install
npm run dev
```

Common commands:

```bash
npm run lint
npm run typecheck
npm run build
npm run prisma:validate
```

## Authentication

TivAid includes credential-based patient and doctor authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Authentication uses an HTTP-only JWT cookie named `tivaid_session`. Set
`JWT_SECRET` in production. If it is not set locally, the app uses a development
fallback so the starter can run immediately.

## Prisma

The Prisma schema targets Prisma 7+ configuration conventions. Set
`DATABASE_URL` before running migration or database commands; schema validation
can run without a live database connection.
