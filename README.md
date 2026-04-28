# TivAid

TivAid is a proposed healthcare platform for patients and doctors, centered on
medical profiles, longitudinal health records, doctor-patient care workflows,
appointments, prescriptions, and QR-based emergency medical access.

## Project blueprint

- [Architecture, folder structure, and tech stack](docs/architecture.md)
- [Initial Prisma database schema](prisma/schema.prisma)

## Prisma

The Prisma schema targets Prisma 7+ configuration conventions. Set
`DATABASE_URL` before running migration or database commands; schema validation
can run without a live database connection.
