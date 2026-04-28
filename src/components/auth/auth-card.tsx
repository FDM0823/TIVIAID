import Link from "next/link";

type AuthCardProps = {
  children: React.ReactNode;
  footerHref: string;
  footerLabel: string;
  footerText: string;
  subtitle: string;
  title: string;
};

export function AuthCard({
  children,
  footerHref,
  footerLabel,
  footerText,
  subtitle,
  title,
}: AuthCardProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link className="mb-8 text-sm font-medium text-teal-700 dark:text-teal-300" href="/">
        Back to home
      </Link>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700 dark:text-teal-300">
          TivAid
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </section>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        {footerText}{" "}
        <a className="font-semibold text-teal-700 dark:text-teal-300" href={footerHref}>
          {footerLabel}
        </a>
      </p>
    </main>
  );
}
