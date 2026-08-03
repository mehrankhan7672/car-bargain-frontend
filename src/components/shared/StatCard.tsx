import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "card-soft group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-gold",
        accent && "border-gold/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="gold-line absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
