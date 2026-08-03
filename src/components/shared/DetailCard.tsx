import type { ReactNode } from "react";

export function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card-soft p-5 md:p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}
