# TivAid Architecture Blueprint

TivAid is a healthcare platform for patients, doctors, clinics, and emergency responders. Its core value is a secure patient medical profile that can be shared through consent flows and emergency QR access while preserving auditability and privacy.

## 1. Product Scope

### Primary actors

- **Patient**: Owns a profile, emergency QR card, medical records, medications, allergies, visits, lab files, and sharing permissions.
- **Doctor**: Reviews patient history, adds clinical notes, uploads prescriptions, requests access, and manages appointments.
- **Clinic administrator**: Manages doctors, clinic locations, schedules, and verification workflows.
- **Emergency responder**: Scans a QR code and can view a limited emergency profile without full account access.
- **System administrator**: Handles moderation, compliance, user verification, support, and platform configuration.

### Core capabilities

1. Patient onboarding and identity profile.
2. Doctor and clinic onboarding with credential verification.
3. Medical history timeline across visits, diagnoses, prescriptions, allergies, vitals, immunizations, labs, and documents.
4. QR-based patient identification and emergency medical summary.
5. Consent-based sharing between patients, doctors, and clinics.
6. Appointments, visit notes, prescriptions, and follow-up tasks.
7. Secure document upload and retrieval.
8. Notifications for appointments, access requests, prescriptions, and abnormal updates.
9. Complete audit trail for sensitive actions.

## 2. Recommended Tech Stack

### Client applications

- **Mobile app**: React Native with Expo for iOS and Android.
- **Web app**: Next.js App Router for patient, doctor, clinic admin, and system admin portals.
- **UI system**: Tailwind CSS, NativeWind for mobile, shared design tokens, Radix UI or shadcn/ui for web primitives.
- **State/data fetching**: TanStack Query for server state; Zustand for small local UI state.
- **Forms**: React Hook Form with Zod validation.
- **QR scanning**: Expo Camera on mobile; browser camera API or dedicated scanner component on web.

### Backend

- **API**: NestJS or Next.js API layer. NestJS is recommended if the backend will grow into independent services.
- **API style**: REST for operational APIs, optional GraphQL later for timeline aggregation.
- **Validation**: Zod or class-validator at request boundaries.
- **Authentication**: Auth.js, Clerk, Cognito, or a custom OAuth2/OIDC provider. Use passkeys or MFA for clinicians and admins.
- **Authorization**: Role-based access control plus resource-level consent checks.
- **Background jobs**: BullMQ with Redis for notifications, QR rotation, audit export, document processing, and reminders.
- **File storage**: S3-compatible object storage using private buckets and signed URLs.
- **Email/SMS/push**: Resend or SendGrid for email, Twilio for SMS, Firebase Cloud Messaging and APNs for push.

### Data layer

- **Primary database**: PostgreSQL.
- **ORM**: Prisma.
- **Cache/queue**: Redis.
- **Search**: PostgreSQL full-text search initially; OpenSearch or Meilisearch when advanced clinical search is required.
- **Analytics**: PostHog or warehouse exports with privacy filtering.

### Infrastructure

- **Containerization**: Docker.
- **Hosting**: Vercel for web frontend, Fly.io/Render/AWS ECS for API workers, managed PostgreSQL, managed Redis.
- **Observability**: OpenTelemetry, Sentry, structured JSON logs, uptime checks.
- **Secrets**: Cloud secrets manager, never checked into the repository.
- **CI/CD**: GitHub Actions for lint, type check, tests, Prisma validation, migrations, and deployment.

## 3. High-Level Architecture

```text
                         +----------------------+
                         |      Admin Web       |
                         +----------+-----------+
                                    |
+-------------+            +--------v---------+            +------------------+
| Mobile App  +----------->| API Gateway/App  +----------->| PostgreSQL       |
+-------------+            | Backend          |            +------------------+
                           +---+----+----+----+
+-------------+                |    |    |
| Patient Web +----------------+    |    +-----------------> S3 Object Storage
+-------------+                     |
                                    +----------------------> Redis Queue/Cache
+-------------+                     |
| Doctor Web  +---------------------+----------------------> Email/SMS/Push
+-------------+                     |
                                    +----------------------> Audit/Telemetry
+-------------+
| QR Scanner  |
+-------------+
```

### Backend modules

- **Auth module**: login, MFA, password reset, sessions, OAuth, device tracking.
- **Identity module**: user accounts, patient profiles, doctor profiles, clinic profiles, verification.
- **Medical records module**: conditions, allergies, medications, immunizations, vitals, lab results, procedures, documents.
- **QR module**: QR token generation, token rotation, scan handling, emergency profile access.
- **Consent module**: patient grants, access requests, revocation, expiration, and doctor/clinic permissions.
- **Appointment module**: doctor availability, booking, cancellation, visit lifecycle, follow-up tasks.
- **Prescription module**: prescriptions, medication instructions, refill state, attachments.
- **Notification module**: email, SMS, push, in-app notifications.
- **Audit module**: immutable logs of access, changes, scans, exports, and administrative actions.

## 4. Security and Compliance Architecture

TivAid handles sensitive healthcare data, so privacy and auditability should be first-class requirements even for the MVP.

### Access model

- Every user has an account-level role.
- Doctors and clinic administrators must be verified before accessing patient records.
- Patient records are only visible through:
  - direct patient ownership,
  - explicit consent grant,
  - appointment-linked clinical relationship,
  - emergency QR access to a restricted summary,
  - administrator break-glass access with mandatory reason logging.

### QR access model

- The QR code should never contain raw medical data.
- It should encode an opaque token or URL that resolves server-side.
- Emergency QR access should expose only:
  - patient display name,
  - age or date of birth depending on policy,
  - blood type,
  - allergies,
  - chronic conditions,
  - current critical medications,
  - emergency contacts,
  - optional organ donor or advance directive flags.
- QR tokens should support rotation, revocation, and scan audit logs.
- Emergency access should be read-only and time-limited by scan session.

### Data protection

- Use TLS everywhere.
- Encrypt files before storage or rely on managed bucket encryption plus application-level access controls.
- Consider field-level encryption for highly sensitive fields such as national IDs and emergency notes.
- Store only hashed QR token values in the database.
- Log access events but avoid logging protected health information in application logs.
- Add retention policies for audit logs, records, inactive accounts, and deleted documents.

## 5. Suggested Folder Structure

This structure assumes a TypeScript monorepo with web, mobile, backend, shared packages, and Prisma.

```text
tivaid/
  apps/
    api/
      src/
        main.ts
        app.module.ts
        modules/
          auth/
          users/
          patients/
          doctors/
          clinics/
          consents/
          qr/
          medical-records/
          appointments/
          prescriptions/
          notifications/
          audit/
        common/
          decorators/
          filters/
          guards/
          interceptors/
          pipes/
        config/
        jobs/
        storage/
      test/
    web/
      app/
        (auth)/
        patient/
        doctor/
        clinic-admin/
        admin/
        emergency/[token]/
      components/
      lib/
      styles/
    mobile/
      app/
        auth/
        patient/
        doctor/
        emergency-scan/
      components/
      lib/
      assets/
  packages/
    config/
      eslint/
      tsconfig/
      tailwind/
    db/
      prisma/
      src/
        client.ts
    ui/
      src/
    validators/
      src/
    types/
      src/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  docs/
    architecture.md
    api.md
    security.md
  docker/
    api.Dockerfile
    worker.Dockerfile
  .github/
    workflows/
      ci.yml
```

## 6. Application Flows

### Patient onboarding

1. User creates an account and verifies email or phone.
2. Patient profile is created with demographics and emergency contact details.
3. Patient enters allergies, conditions, medications, and blood type.
4. System generates an active QR code token.
5. Patient can print, save, or display the QR code.

### Doctor onboarding

1. Doctor creates an account.
2. Doctor submits license details and clinic affiliation.
3. Clinic admin or platform admin verifies credentials.
4. Verified doctor can request patient access or access records through appointments and consent.

### Consent-based record access

1. Doctor requests access to a patient profile.
2. Patient receives a notification with requested scope and duration.
3. Patient approves or rejects.
4. Approved access is recorded as a consent grant.
5. Every record view or modification creates an audit event.

### Emergency QR scan

1. Responder scans QR code.
2. Backend validates token status and opens an emergency scan session.
3. Responder views limited emergency profile.
4. Scan event is logged with IP, approximate user agent, location if provided, and timestamp.
5. Patient receives an alert if notification preferences allow it.

### Clinical visit

1. Appointment is booked.
2. Patient grants doctor access or confirms appointment-linked access.
3. Doctor reviews timeline and records notes.
4. Doctor adds diagnosis, prescription, lab order, or document.
5. Patient receives visit summary and follow-up tasks.

## 7. API Surface

Representative REST endpoints:

```text
POST   /auth/register
POST   /auth/login
POST   /auth/mfa/verify
GET    /me

GET    /patients/me
PATCH  /patients/me
GET    /patients/:patientId/timeline
GET    /patients/:patientId/emergency-summary

POST   /doctors/verification
GET    /doctors/:doctorId
GET    /clinics/:clinicId/doctors

POST   /consents/requests
GET    /consents/requests
POST   /consents/requests/:id/approve
POST   /consents/requests/:id/reject
DELETE /consents/grants/:id

POST   /qr/tokens
POST   /qr/tokens/:id/rotate
GET    /emergency/:token
POST   /emergency/:token/scan-session

GET    /medical-records
POST   /medical-records/conditions
POST   /medical-records/allergies
POST   /medical-records/medications
POST   /medical-records/vitals
POST   /medical-records/documents

GET    /appointments
POST   /appointments
PATCH  /appointments/:id

POST   /prescriptions
GET    /notifications
PATCH  /notifications/:id/read
GET    /audit/events
```

## 8. Implementation Phases

### MVP

- Patient and doctor accounts.
- Patient emergency profile.
- QR token generation and emergency scan page.
- Allergies, conditions, medications, emergency contacts.
- Basic consent grants.
- Doctor access to shared patient timeline.
- Audit logging for scans and record access.

### Clinical workflow expansion

- Appointments.
- Visit notes.
- Prescriptions.
- Lab results and document upload.
- Clinic administration.
- Notifications.

### Compliance and scale hardening

- MFA enforcement for clinicians and admins.
- Advanced audit export.
- Field-level encryption for selected data.
- Break-glass admin workflow.
- Data retention controls.
- Search, analytics, and reporting.

## 9. Key Engineering Risks

- **Privacy leakage through QR codes**: keep QR data opaque and server-validated.
- **Overly broad doctor access**: enforce consent scopes in every record query.
- **Medical record edit history**: preserve author, source, timestamps, and audit logs.
- **File access control**: documents should only be served through short-lived signed URLs after authorization.
- **Regulatory requirements**: HIPAA, GDPR, or local healthcare rules may affect hosting, auditing, deletion, and breach notification.
- **Identity verification**: doctor verification should be explicit before clinical access is allowed.
