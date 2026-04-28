import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TivAid",
  description:
    "Secure healthcare profiles, medical history, doctor workflows, and QR emergency access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
