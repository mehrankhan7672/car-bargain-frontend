import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { employees, formatPKR, salaries as seed, type Salary } from "@/data/dummy";

export const Route = createFileRoute("/salaries")({
  head: () => ({
    meta: [
      { title: "Salary History — Car Bargain Manager" },
      { name: "description", content: "All salary payments with employee name, month, amount and method." },
      { property: "og:title", content: "Salary History — Car Bargain Manager" },
      { property: "og:description", content: "Search salary payments by employee." },
    ],
  }),
  component: SalaryHistory,
});

function SalaryHistory() {
  const loading = useFakeLoading();
  const [rows, setRows] = useState<Salary[]>(seed);

  const columns: Column<Salary>[] = [
    { key: "employee", header: "Employee", cell: (s) => <span className="font-semibold">{s.employee}</span> },
    { key: "month", header: "Month", cell: (s) => s.month },
    { key: "amount", header: "Amount", cell: (s) => <span className="font-semibold">{formatPKR(s.amount)}</span> },
    { key: "paidOn", header: "Paid On", cell: (s) => s.paidOn },
    { key: "method", header: "Method", cell: (s) => s.method },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (s) => (
        <div className="flex justify-end">
          <ConfirmDelete
            itemName={`${s.employee} · ${s.month}`}
            onConfirm={() => {
              setRows((prev) => prev.filter((x) => x.id !== s.id));
              toast.success("Salary record deleted");
            }}
          >
            <Button size="icon" variant="ghost" className="rounded-lg text-destructive" aria-label="Delete salary">
              <Trash2 className="h-4 w-4" />
            </Button>
          </ConfirmDelete>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Salary History" subtitle="Record of every salary payment" />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by employee name..."
        searchKeys={(s) => `${s.employee} ${s.month} ${s.method}`}
        filters={[
          { label: "Employee", options: employees.map((e) => e.name), match: (s, v) => s.employee === v },
          { label: "Method", options: ["Cash", "Bank Transfer", "Cheque"], match: (s, v) => s.method === v },
        ]}
        emptyTitle="No salary record found"
      />
    </div>
  );
}
