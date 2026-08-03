import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2, Wallet, Receipt, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { expenses as seed, formatPKR, type Expense } from "@/data/dummy";

export const Route = createFileRoute("/expenses/")({
  head: () => ({
    meta: [
      { title: "Expenses — Car Bargain Manager" },
      { name: "description", content: "Track showroom expenses by category with totals and monthly summary." },
      { property: "og:title", content: "Expenses — Car Bargain Manager" },
      { property: "og:description", content: "Repair, fuel, office and marketing expense tracker." },
    ],
  }),
  component: ExpenseList,
});

function ExpenseList() {
  const loading = useFakeLoading();
  const [rows, setRows] = useState<Expense[]>(seed);

  const total = rows.reduce((s, e) => s + e.amount, 0);
  const biggest = rows.reduce((m, e) => (e.amount > m.amount ? e : m), rows[0]);

  const remove = (e: Expense) => {
    setRows((prev) => prev.filter((x) => x.id !== e.id));
    toast.success("Expense deleted", { description: `${e.title} removed from the list.` });
  };

  const columns: Column<Expense>[] = [
    {
      key: "title",
      header: "Expense Title",
      cell: (e) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{e.title}</p>
          <p className="truncate text-xs text-muted-foreground">{e.notes || "No note"}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (e) => (
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{e.category}</span>
      ),
    },
    { key: "amount", header: "Amount", cell: (e) => <span className="font-semibold">{formatPKR(e.amount)}</span> },
    { key: "date", header: "Date", cell: (e) => e.date },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="View expense">
            <Link to="/expenses/$id" params={{ id: e.id }}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="Edit expense">
            <Link to="/expenses/$id/edit" params={{ id: e.id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDelete itemName={e.title} onConfirm={() => remove(e)}>
            <Button size="icon" variant="ghost" className="rounded-lg text-destructive" aria-label="Delete expense">
              <Trash2 className="h-4 w-4" />
            </Button>
          </ConfirmDelete>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Expenses"
        subtitle="Every rupee spent on the showroom"
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/expenses/new">
              <Plus className="h-4 w-4" /> Add Expense
            </Link>
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Expenses" value={formatPKR(total)} icon={Wallet} accent />
        <StatCard label="Total Entries" value={rows.length} icon={Receipt} hint="All categories" />
        <StatCard
          label="Biggest Expense"
          value={biggest ? formatPKR(biggest.amount) : formatPKR(0)}
          icon={TrendingDown}
          hint={biggest?.title}
        />
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by title or note..."
        searchKeys={(e) => `${e.title} ${e.category} ${e.notes} ${e.date}`}
        filters={[
          {
            label: "Category",
            options: ["Repair", "Fuel", "Office", "Salary", "Marketing", "Other"],
            match: (e, v) => e.category === v,
          },
        ]}
        emptyTitle="No expense found"
      />
    </div>
  );
}
