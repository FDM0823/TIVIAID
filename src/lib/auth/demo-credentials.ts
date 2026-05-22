export type DemoCredential = {
  email: string;
  kind: "patient" | "doctor" | "lab";
  label: string;
  password: string;
  targetPath: string;
};

export const DEFAULT_DEMO_CREDENTIALS = [
  {
    email: "paciente.demo.0fc9@tivaid.app",
    kind: "patient",
    label: "Paciente demo",
    password: "Paciente-PBof6qC-LUNj-2026",
    targetPath: "/patient",
  },
  {
    email: "doctor.demo.0fc9@tivaid.app",
    kind: "doctor",
    label: "Doctor demo",
    password: "Doctor-G-DolYkYpQOa-2026",
    targetPath: "/doctor",
  },
  {
    email: "lab.demo.0fc9@tivaid.app",
    kind: "lab",
    label: "Laboratorio demo",
    password: "Lab-Sm8jESWoyfCe-2026",
    targetPath: "/lab-demo",
  },
] as const satisfies readonly DemoCredential[];
