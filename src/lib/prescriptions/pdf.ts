import PDFDocument from "pdfkit";

import type { PrescriptionPdfView } from "@/lib/prescriptions/data";

export async function createPrescriptionPdfBuffer(
  prescription: PrescriptionPdfView,
  qrImageDataUrl: string,
) {
  const document = new PDFDocument({ margin: 48, size: "A4" });
  const chunks: Buffer[] = [];

  document.on("data", (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });

  document.fontSize(22).text("TivAid Digital Prescription", { align: "center" });
  document.moveDown();
  document.fontSize(10).fillColor("#64748b").text(`Verification code: ${prescription.publicCode}`);
  document.moveDown();

  document.fillColor("#0f172a").fontSize(14).text("Patient", { underline: true });
  document.fontSize(12).text(prescription.patientName);
  document.text(`Email: ${prescription.patientEmail}`);
  document.moveDown();

  document.fontSize(14).text("Prescriber", { underline: true });
  document.fontSize(12).text(prescription.doctorName);
  document.text(`Specialty: ${prescription.doctorSpecialty}`);
  document.text(`License: ${prescription.doctorLicense}`);
  document.moveDown();

  document.fontSize(14).text("Medication", { underline: true });
  document.fontSize(12).text(`Name: ${prescription.medicationName}`);
  document.text(`Dosage: ${prescription.dosage}`);
  document.text(`Frequency: ${prescription.frequency}`);
  document.text(`Route: ${prescription.route ?? "Not specified"}`);
  document.text(`Quantity: ${prescription.quantity ?? "Not specified"}`);
  document.text(`Refills: ${prescription.refills}`);
  document.text(`Status: ${prescription.status}`);
  document.text(`Prescribed: ${new Date(prescription.prescribedAt).toLocaleString()}`);
  document.text(
    `Expires: ${prescription.expiresAt ? new Date(prescription.expiresAt).toLocaleDateString() : "Not specified"}`,
  );
  document.moveDown();

  if (prescription.instructions) {
    document.fontSize(14).text("Instructions", { underline: true });
    document.fontSize(12).text(prescription.instructions);
    document.moveDown();
  }

  const qrBase64 = qrImageDataUrl.split(",")[1];
  if (qrBase64) {
    document.fontSize(14).text("Verification QR", { underline: true });
    document.image(Buffer.from(qrBase64, "base64"), { fit: [150, 150] });
  }

  document.moveDown();
  document
    .fontSize(9)
    .fillColor("#64748b")
    .text("Verify this prescription by scanning the QR code or visiting the verification URL.");

  document.end();

  return done;
}
