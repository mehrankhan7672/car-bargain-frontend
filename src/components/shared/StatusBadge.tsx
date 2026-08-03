import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  Available: "bg-success/15 text-success border-success/30",
  Sold: "bg-gold-soft text-gold-foreground border-gold/40",
  Exchanged: "bg-secondary text-secondary-foreground border-border",
  Completed: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tones[status] ?? "bg-secondary text-secondary-foreground border-border",
      )}
    >
      {status}
    </span>
  );
}
