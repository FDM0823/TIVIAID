import { AppointmentStatus, UserRole } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { decryptNullable, encryptNullable } from "@/lib/security/encryption";
import type {
  CreateAppointmentInput,
  UpdateAppointmentStatusInput,
} from "@/lib/appointments/validation";

export async function requireAppointmentUser(next = "/appointments") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${next}`);
  }

  if (user.role !== UserRole.PATIENT && user.role !== UserRole.DOCTOR) {
    notFound();
  }

  return user;
}

export async function getAppointmentDashboardData() {
  const user = await requireAppointmentUser();

  const patient =
    user.role === UserRole.PATIENT
      ? await prisma.patient.findUnique({ where: { userId: user.id } })
      : null;
  const doctor =
    user.role === UserRole.DOCTOR
      ? await prisma.doctor.findUnique({ where: { userId: user.id } })
      : null;

  const appointments = await prisma.appointment.findMany({
    where:
      user.role === UserRole.PATIENT
        ? { patientId: patient?.id }
        : { doctorId: doctor?.id },
    include: {
      patient: { include: { user: { include: { profile: true } } } },
      doctor: { include: { user: { include: { profile: true } } } },
    },
    orderBy: { startsAt: "asc" },
    take: 30,
  });

  const availableDoctors = await prisma.doctor.findMany({
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return {
    user,
    patient,
    doctor,
    appointments: appointments.map(toAppointmentView),
    availableDoctors: availableDoctors.map((item) => ({
      id: item.id,
      name: formatPersonName(item.user.profile, "Doctor"),
      specialty: item.specialty,
      verificationStatus: item.verificationStatus,
    })),
  };
}

export const getAppointmentsPageData = getAppointmentDashboardData;

export async function createAppointment(input: CreateAppointmentInput) {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.PATIENT) {
    return { error: "Patient account required.", status: 403 as const };
  }

  const patient = await prisma.patient.findUnique({ where: { userId: user.id } });

  if (!patient) {
    return { error: "Patient profile not found.", status: 404 as const };
  }

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(startsAt.getTime() + 30 * 60_000);

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: input.doctorId,
      reason: encryptNullable(input.reason),
      notes: encryptNullable(input.notes),
      startsAt,
      endsAt,
      status: AppointmentStatus.REQUESTED,
    },
    include: {
      patient: { include: { user: { include: { profile: true } } } },
      doctor: { include: { user: { include: { profile: true } } } },
    },
  });

  return { appointment: toAppointmentView(appointment), status: 201 as const };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  input: UpdateAppointmentStatusInput,
) {
  const user = await getCurrentUser();

  if (!user || (user.role !== UserRole.PATIENT && user.role !== UserRole.DOCTOR)) {
    return { error: "Authentication required.", status: 403 as const };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true, doctor: true },
  });

  if (!appointment) {
    return { error: "Appointment not found.", status: 404 as const };
  }

  const patient =
    user.role === UserRole.PATIENT
      ? await prisma.patient.findUnique({ where: { userId: user.id } })
      : null;
  const doctor =
    user.role === UserRole.DOCTOR
      ? await prisma.doctor.findUnique({ where: { userId: user.id } })
      : null;

  const canUpdate =
    appointment.patientId === patient?.id || appointment.doctorId === doctor?.id;

  if (!canUpdate) {
    return { error: "Appointment not found.", status: 404 as const };
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: input.status,
      cancelledAt: input.status === AppointmentStatus.CANCELLED ? new Date() : null,
      cancellationReason:
        input.status === AppointmentStatus.CANCELLED ? encryptNullable(input.cancellationReason) : null,
    },
    include: {
      patient: { include: { user: { include: { profile: true } } } },
      doctor: { include: { user: { include: { profile: true } } } },
    },
  });

  return { appointment: toAppointmentView(updated), status: 200 as const };
}

type AppointmentWithPeople = Awaited<
  ReturnType<typeof prisma.appointment.findMany>
>[number] & {
  patient: { user: { profile: { firstName: string; lastName: string } | null } };
  doctor: {
    specialty: string;
    user: { profile: { firstName: string; lastName: string } | null };
  };
};

function toAppointmentView(appointment: AppointmentWithPeople) {
  return {
    id: appointment.id,
    status: appointment.status,
    reason: decryptNullable(appointment.reason),
    notes: decryptNullable(appointment.notes),
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    patientName: formatPersonName(appointment.patient.user.profile, "Patient"),
    doctorName: formatPersonName(appointment.doctor.user.profile, "Doctor"),
    doctorSpecialty: appointment.doctor.specialty,
  };
}

function formatPersonName(
  profile: { firstName: string; lastName: string } | null | undefined,
  fallback: string,
) {
  return profile ? `${profile.firstName} ${profile.lastName}` : fallback;
}
