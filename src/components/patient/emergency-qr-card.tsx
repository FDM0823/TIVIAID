type EmergencyQrCardProps = {
  qrImageDataUrl?: string;
  emergencyUrl?: string;
};

export function EmergencyQrCard({ emergencyUrl, qrImageDataUrl }: EmergencyQrCardProps) {
  if (!qrImageDataUrl || !emergencyUrl) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
          Emergency QR
        </p>
        <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
          Create your emergency QR
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Generate a dynamic QR code that links responders to a limited emergency
          profile. It never embeds medical data directly in the QR image.
        </p>
        <form action="/api/patient/qr/emergency" className="mt-5" method="post">
          <button
            className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            type="submit"
          >
            Generate emergency QR
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
        Emergency QR
      </p>
      <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
        Dynamic emergency profile
      </h2>
      <div className="mt-5 rounded-2xl bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Emergency QR code" className="mx-auto h-56 w-56" src={qrImageDataUrl} />
      </div>
      <p className="mt-4 break-all text-xs text-slate-500 dark:text-slate-400">
        {emergencyUrl}
      </p>
      <form action="/api/patient/qr/emergency" className="mt-5" method="post">
        <button
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200"
          type="submit"
        >
          Rotate QR token
        </button>
      </form>
    </section>
  );
}
