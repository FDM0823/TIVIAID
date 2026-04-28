import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { createPrescriptionQrImage } from "@/lib/prescriptions/data";
import { getPrescriptionForPdfById } from "@/lib/prescriptions/data";
import { createPrescriptionPdfBuffer } from "@/lib/prescriptions/pdf";

type PrescriptionPdfRouteContext = {
  params: Promise<{
    prescriptionId: string;
  }>;
};

export async function GET(_request: Request, context: PrescriptionPdfRouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { prescriptionId } = await context.params;
  const prescription = await getPrescriptionForPdfById(prescriptionId);

  if (!prescription) {
    return NextResponse.json({ error: "Prescription not found." }, { status: 404 });
  }

  const qrImageDataUrl = prescription.publicCode
    ? await createPrescriptionQrImage(prescription.publicCode)
    : "";
  const pdf = await createPrescriptionPdfBuffer(prescription, qrImageDataUrl);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Disposition": `attachment; filename="prescription-${prescription.id}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
}
