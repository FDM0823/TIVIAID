type StatusCardProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function StatusCard({ title, description, eyebrow }: StatusCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-200/70">
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
