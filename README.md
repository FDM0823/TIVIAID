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

### Demo accounts

Investor/demo access can be configured without hardcoding credentials in the
repository. Set these environment variables in the deployed environment:

```bash
DEMO_ACCOUNTS_ENABLED=true
DEMO_PATIENT_EMAIL=patient-demo@example.com
DEMO_PATIENT_PASSWORD=replace-with-strong-password
DEMO_DOCTOR_EMAIL=doctor-demo@example.com
DEMO_DOCTOR_PASSWORD=replace-with-strong-password
DEMO_LAB_EMAIL=lab-demo@example.com
DEMO_LAB_PASSWORD=replace-with-strong-password
```

When a configured demo email signs in, TivAid only accepts the matching current
environment password and upserts the patient, doctor, or laboratory clinic-admin
account in the database. Rotating an environment password immediately blocks the
previous demo password for that email.

## Security

The API layer includes shared JSON helpers for security headers, JSON content
type checks, request size limits, validation errors, and no-store responses.
Sensitive clinical free-text fields are encrypted before persistence using
AES-256-GCM with `SENSITIVE_DATA_KEY` when set, or a development fallback key.

## Patient module

Authenticated patients can manage their medical profile at `/patient`.

- `GET /api/patient/profile`
- `PUT /api/patient/profile`
- `POST /api/patient/qr/emergency`
- Public emergency profile: `/emergency/[publicCode]`

Emergency QR codes store only a hashed secret token server-side and expose a
limited read-only emergency summary, blood type, allergies, active conditions,
active medications, and emergency contacts.

## Doctor module

Authenticated doctors can use `/doctor` to simulate scanning a patient QR code
by entering its public code or emergency URL, review limited patient context, and
create encounter notes that are added to the patient's medical history.

- `POST /api/doctor/scan`
- `POST /api/doctor/patients/[patientId]/notes`

## Appointments and prescriptions

Patients and doctors can view and manage appointments at `/appointments`.
Doctors can issue QR-verifiable digital prescriptions from the doctor dashboard.

- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/[appointmentId]/status`
- `POST /api/prescriptions`
- `GET /api/prescriptions/[prescriptionId]/pdf`
- Public prescription verification: `/prescriptions/verify/[publicCode]`

## Prisma

The Prisma schema targets Prisma 7+ configuration conventions. Set
`DATABASE_URL` before running migration or database commands; schema validation
can run without a live database connection.
