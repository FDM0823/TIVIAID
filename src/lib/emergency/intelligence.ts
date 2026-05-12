export type EmergencyContactSignal = {
  name: string;
  phone?: string | null;
  relationship?: string | null;
};

export type EmergencyReadinessInput = {
  bloodType?: string | null;
  dateOfBirth?: string | null;
  emergencyContact?: EmergencyContactSignal | null;
  emergencySummary?: string | null;
  hasEmergencyQr?: boolean;
  heightCm?: string | number | null;
  primaryLanguage?: string | null;
  weightKg?: string | number | null;
};

export type EmergencyReadinessResult = {
  completedItems: string[];
  level: "ready" | "needs-work" | "critical";
  missingItems: string[];
  score: number;
};

export type ClinicalSignalInput = {
  allergies: Array<{
    reaction?: string | null;
    severity?: string | null;
    substance: string;
  }>;
  bloodType?: string | null;
  conditions: Array<{
    name: string;
    notes?: string | null;
    status?: string | null;
  }>;
  dateOfBirth?: string | null;
  emergencyContacts: EmergencyContactSignal[];
  emergencySummary?: string | null;
  medications: Array<{
    dosage?: string | null;
    frequency?: string | null;
    name: string;
  }>;
  name: string;
  sex?: string | null;
};

export type ClinicalSignal = {
  detail: string;
  label: string;
  level: "critical" | "warning" | "stable";
};

export type ClinicalSignalResult = {
  handoffSummary: string;
  riskLevel: "critical" | "watch" | "stable";
  signals: ClinicalSignal[];
  topPriorities: string[];
};

type ReadinessRule = {
  complete: boolean;
  done: string;
  missing: string;
  weight: number;
};

export function buildEmergencyReadiness(
  input: EmergencyReadinessInput,
): EmergencyReadinessResult {
  const rules: ReadinessRule[] = [
    {
      complete: Boolean(input.hasEmergencyQr),
      done: "Emergency QR is active",
      missing: "Generate the emergency QR",
      weight: 20,
    },
    {
      complete: Boolean(input.bloodType && input.bloodType !== "UNKNOWN"),
      done: `Blood type set to ${formatBloodType(input.bloodType)}`,
      missing: "Add blood type",
      weight: 15,
    },
    {
      complete: Boolean(input.emergencySummary?.trim()),
      done: "Emergency summary is ready",
      missing: "Write a short emergency medical summary",
      weight: 20,
    },
    {
      complete: Boolean(input.emergencyContact?.name && input.emergencyContact.phone),
      done: "Emergency contact is reachable",
      missing: "Add a reachable emergency contact",
      weight: 20,
    },
    {
      complete: Boolean(input.primaryLanguage?.trim()),
      done: "Primary language is listed",
      missing: "Add primary language",
      weight: 10,
    },
    {
      complete: Boolean(input.dateOfBirth),
      done: "Date of birth is available",
      missing: "Add date of birth",
      weight: 5,
    },
    {
      complete: Boolean(input.heightCm && input.weightKg),
      done: "Height and weight are available",
      missing: "Add height and weight",
      weight: 10,
    },
  ];

  const total = rules.reduce((sum, rule) => sum + rule.weight, 0);
  const earned = rules
    .filter((rule) => rule.complete)
    .reduce((sum, rule) => sum + rule.weight, 0);
  const score = Math.round((earned / total) * 100);

  return {
    completedItems: rules.filter((rule) => rule.complete).map((rule) => rule.done),
    level: score >= 80 ? "ready" : score >= 55 ? "needs-work" : "critical",
    missingItems: rules.filter((rule) => !rule.complete).map((rule) => rule.missing),
    score,
  };
}

export function buildClinicalSignals(input: ClinicalSignalInput): ClinicalSignalResult {
  const severeAllergies = input.allergies.filter((allergy) =>
    ["SEVERE", "LIFE_THREATENING"].includes(allergy.severity ?? ""),
  );
  const activeConditions = input.conditions.filter((condition) =>
    ["ACTIVE", "REMISSION"].includes(condition.status ?? ""),
  );
  const signals: ClinicalSignal[] = [];

  if (severeAllergies.length > 0) {
    signals.push({
      detail: severeAllergies
        .map((allergy) =>
          [allergy.substance, allergy.reaction].filter(Boolean).join(": "),
        )
        .join("; "),
      label: "High-risk allergy",
      level: "critical",
    });
  }

  if (!input.emergencyContacts.length) {
    signals.push({
      detail: "No emergency contact is available from this QR scan.",
      label: "Missing emergency contact",
      level: "critical",
    });
  }

  if (!input.bloodType || input.bloodType === "UNKNOWN") {
    signals.push({
      detail: "Blood type is not documented in the emergency profile.",
      label: "Blood type unknown",
      level: "warning",
    });
  }

  if (!input.emergencySummary?.trim()) {
    signals.push({
      detail: "Ask the patient or companion for critical history before treatment.",
      label: "No emergency summary",
      level: "warning",
    });
  }

  if (activeConditions.length > 0) {
    signals.push({
      detail: activeConditions
        .slice(0, 4)
        .map((condition) => condition.name)
        .join(", "),
      label: "Active conditions",
      level: "warning",
    });
  }

  if (input.medications.length > 0) {
    signals.push({
      detail: input.medications
        .slice(0, 4)
        .map((medication) =>
          [medication.name, medication.dosage, medication.frequency]
            .filter(Boolean)
            .join(" "),
        )
        .join("; "),
      label: "Current medications",
      level: "stable",
    });
  }

  if (!signals.length) {
    signals.push({
      detail: "No immediate red flags were found in the scanned emergency profile.",
      label: "Emergency profile reviewed",
      level: "stable",
    });
  }

  const riskLevel = signals.some((signal) => signal.level === "critical")
    ? "critical"
    : signals.some((signal) => signal.level === "warning")
      ? "watch"
      : "stable";

  return {
    handoffSummary: buildHandoffSummary(input, severeAllergies, activeConditions),
    riskLevel,
    signals,
    topPriorities: buildTopPriorities(input, severeAllergies, activeConditions),
  };
}

export function formatBloodType(value?: string | null) {
  if (!value || value === "UNKNOWN") {
    return "Unknown";
  }

  return value.replace("_POSITIVE", "+").replace("_NEGATIVE", "-").replace("_", " ");
}

function buildTopPriorities(
  input: ClinicalSignalInput,
  severeAllergies: ClinicalSignalInput["allergies"],
  activeConditions: ClinicalSignalInput["conditions"],
) {
  const priorities = [
    severeAllergies.length
      ? `Avoid documented high-risk allergens: ${severeAllergies
          .map((allergy) => allergy.substance)
          .join(", ")}.`
      : null,
    input.medications.length
      ? "Reconcile current medications before prescribing or administering treatment."
      : null,
    activeConditions.length
      ? "Consider active conditions while triaging and planning care."
      : null,
    input.emergencyContacts[0]?.phone
      ? `Call ${input.emergencyContacts[0].name} (${input.emergencyContacts[0].phone}) for collateral history.`
      : "Identify an emergency contact or companion for collateral history.",
  ].filter((priority): priority is string => Boolean(priority));

  return priorities.slice(0, 4);
}

function buildHandoffSummary(
  input: ClinicalSignalInput,
  severeAllergies: ClinicalSignalInput["allergies"],
  activeConditions: ClinicalSignalInput["conditions"],
) {
  const allergyText = input.allergies.length
    ? input.allergies
        .map((allergy) =>
          [allergy.substance, allergy.severity, allergy.reaction]
            .filter(Boolean)
            .join(" - "),
        )
        .join("; ")
    : "No allergies listed";
  const medicationText = input.medications.length
    ? input.medications
        .map((medication) =>
          [medication.name, medication.dosage, medication.frequency]
            .filter(Boolean)
            .join(" "),
        )
        .join("; ")
    : "No active medications listed";
  const conditionText = activeConditions.length
    ? activeConditions.map((condition) => condition.name).join(", ")
    : "No active conditions listed";
  const contact = input.emergencyContacts[0];

  return [
    `S: ${input.name}, DOB ${input.dateOfBirth ?? "unknown"}, sex ${
      input.sex ?? "unknown"
    }, blood type ${formatBloodType(input.bloodType)}.`,
    `B: ${input.emergencySummary?.trim() || "No emergency summary provided."}`,
    `A: Allergies: ${allergyText}. Medications: ${medicationText}. Conditions: ${conditionText}.`,
    `R: ${
      severeAllergies.length
        ? "Treat as high allergy risk and verify contraindications."
        : "Verify identity, medications, and current symptoms."
    } ${
      contact?.phone
        ? `Emergency contact: ${contact.name} (${contact.phone}).`
        : "No emergency contact available."
    }`,
  ].join("\n");
}
