// src/routes/logs.index.tsx
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Car,
  HandCoins,
  Users,
  Building2,
  ArrowLeftRight,
  ListFilter,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { logService } from "@/services/logService";
import { formatPKR } from "@/data/dummy";

export const Route = createFileRoute("/logs/")({
  head: () => ({
    meta: [
      { title: "Activity Logs — Car Bargain Manager" },
      {
        name: "description",
        content:
          "Every activity log across cars, exchanges, employees, salaries, expenses, dealers and account activity.",
      },
      { property: "og:title", content: "Activity Logs — Car Bargain Manager" },
      {
        property: "og:description",
        content: "A full audit trail of everything happening in your showroom.",
      },
    ],
  }),
  component: LogsPage,
});

const categories = [
  "All",
  "Car",
  "Exchange",
  "Employee",
  "Salary",
  "Expense",
  "Dealer",
  "Auth",
  "Other",
] as const;

const categoryMeta: Record<string, { icon: typeof Car; className: string }> = {
  Car: { icon: Car, className: "bg-secondary text-secondary-foreground border-border" },
  Exchange: { icon: ArrowLeftRight, className: "bg-gold-soft text-gold-foreground border-gold/40" },
  Employee: { icon: Users, className: "bg-success/15 text-success border-success/30" },
  Salary: { icon: HandCoins, className: "bg-warning/20 text-warning-foreground border-warning/40" },
  Expense: { icon: Wallet, className: "bg-destructive/15 text-destructive border-destructive/30" },
  Dealer: { icon: Building2, className: "bg-secondary text-secondary-foreground border-border" },
  Auth: { icon: ShieldCheck, className: "bg-primary/15 text-primary border-primary/30" },
  Other: { icon: ListFilter, className: "bg-secondary text-secondary-foreground border-border" },
};

type LogEntry = {
  _id: string;
  category: string;
  action: string;
  title: string;
  description?: string;
  amount?: number | null;
  performedBy: string;
  createdAt: string;
};

function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [category, setCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  const load = (cat: string) => {
    setLoading(true);
    Promise.all([
      logService.getAll({ category: cat === "All" ? undefined : cat, limit: 200 }),
      logService.getStats(),
    ])
      .then(([logsRes, statsRes]) => {
        setLogs(logsRes?.data || []);
        setCounts(statsRes?.data?.byCategory || {});
      })
      .catch((err) => {
        console.error("Failed to load logs:", err);
        toast.error("Failed to load activity logs");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Activity Logs"
        subtitle="A full audit trail across every category in your showroom"
      />

      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const meta = cat === "All" ? null : categoryMeta[cat];
          const Icon = meta?.icon ?? ListFilter;
          const count = cat === "All" ? totalCount : counts[cat] || 0;
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-gold bg-gold-soft text-gold-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat}
              <span className="ml-1 rounded-full bg-background/60 px-1.5 text-xs">{count}</span>
            </button>
          );
        })}

        <div className="ml-auto">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Log list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Actions across cars, exchanges, salaries and more will show up here."
        />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const meta = categoryMeta[log.category] || categoryMeta.Other;
            const Icon = meta.icon;
            return (
              <div key={log._id} className="card-soft flex items-start gap-3 p-4">
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${meta.className}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{log.title}</p>
                    <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {log.action}
                    </span>
                  </div>
                  {log.description && (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {log.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()} · {log.performedBy}
                  </p>
                </div>
                {log.amount != null && (
                  <span className="shrink-0 text-sm font-semibold">{formatPKR(log.amount)}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
