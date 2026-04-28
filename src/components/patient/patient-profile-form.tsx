"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { PatientProfileView } from "@/lib/patient/data";

type PatientProfileFormProps = {
  profile: PatientProfileView;
};

export function PatientProfileForm({ profile }: PatientProfileFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
      sex: String(formData.get("sex") ?? ""),
      bloodType: String(formData.get("bloodType") ?? ""),
      heightCm: String(formData.get("heightCm") ?? ""),
      weightKg: String(formData.get("weightKg") ?? ""),
      primaryLanguage: String(formData.get("primaryLanguage") ?? ""),
      emergencySummary: String(formData.get("emergencySummary") ?? ""),
      organDonor: formData.get("organDonor") === "on",
      emergencyContactName: String(formData.get("emergencyContactName") ?? ""),
      emergencyContactRelationship: String(
        formData.get("emergencyContactRelationship") ?? "",
      ),
      emergencyContactPhone: String(formData.get("emergencyContactPhone") ?? ""),
      emergencyContactEmail: String(formData.get("emergencyContactEmail") ?? ""),
    };

    const response = await fetch("/api/patient/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Unable to save profile.");
      setIsSubmitting(false);
      return;
    }

    setMessage("Patient profile saved.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" required defaultValue={profile.firstName} />
        <Field label="Last name" name="lastName" required defaultValue={profile.lastName} />
        <Field
          label="Date of birth"
          name="dateOfBirth"
          type="date"
          defaultValue={profile.dateOfBirth ?? ""}
        />
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Sex
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            defaultValue={profile.sex ?? "UNKNOWN"}
            name="sex"
          >
            <option value="UNKNOWN">Unknown</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="INTERSEX">Intersex</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Blood type
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            defaultValue={profile.bloodType}
            name="bloodType"
          >
            <option value="UNKNOWN">Unknown</option>
            <option value="A_POSITIVE">A+</option>
            <option value="A_NEGATIVE">A-</option>
            <option value="B_POSITIVE">B+</option>
            <option value="B_NEGATIVE">B-</option>
            <option value="AB_POSITIVE">AB+</option>
            <option value="AB_NEGATIVE">AB-</option>
            <option value="O_POSITIVE">O+</option>
            <option value="O_NEGATIVE">O-</option>
          </select>
        </label>
        <Field label="Height (cm)" name="heightCm" type="number" defaultValue={profile.heightCm} />
        <Field label="Weight (kg)" name="weightKg" type="number" defaultValue={profile.weightKg} />
        <Field
          label="Primary language"
          name="primaryLanguage"
          defaultValue={profile.primaryLanguage ?? ""}
        />
      </div>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Emergency medical summary
        <textarea
          className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          defaultValue={profile.emergencySummary ?? ""}
          name="emergencySummary"
          placeholder="Critical allergies, active conditions, implanted devices, current medications, or emergency instructions."
        />
      </label>

      <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
        <input defaultChecked={profile.organDonor} name="organDonor" type="checkbox" />
        Organ donor
      </label>

      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
        <p className="font-semibold text-slate-950 dark:text-white">Primary emergency contact</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Name"
            name="emergencyContactName"
            defaultValue={profile.emergencyContact?.name ?? ""}
          />
          <Field
            label="Relationship"
            name="emergencyContactRelationship"
            defaultValue={profile.emergencyContact?.relationship ?? ""}
          />
          <Field
            label="Phone"
            name="emergencyContactPhone"
            defaultValue={profile.emergencyContact?.phone ?? ""}
          />
          <Field
            label="Email"
            name="emergencyContactEmail"
            type="email"
            defaultValue={profile.emergencyContact?.email ?? ""}
          />
        </div>
      </div>

      {message ? (
        <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-100">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <button
        className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Saving..." : "Save patient profile"}
      </button>
    </form>
  );
}

type FieldProps = {
  defaultValue?: string | number | null;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
};

function Field({ defaultValue, label, name, required, type = "text" }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      <input
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        defaultValue={defaultValue ?? ""}
        name={name}
        required={required}
        step={type === "number" ? "0.01" : undefined}
        type={type}
      />
    </label>
  );
}
