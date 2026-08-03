import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { exchanges as seed, formatPKR, type Exchange } from "@/data/dummy";

export const Route = createFileRoute("/exchanges/")({
  head: () => ({
    meta: [
      { title: "Exchanges — Car Bargain Manager" },
      { name: "description", content: "All car exchange deals with dealers, cash adjustment and final amount." },
      { property: "og:title", content: "Exchanges — Car Bargain Manager" },
      { property: "og:description", content: "Track every vehicle exchange deal done by your showroom." },
    ],
  }),
  component: ExchangeList,
});

function ExchangeList() {
  const loading = useFakeLoading();
  const [rows, setRows] = useState<Exchange[]>(seed);

  const remove = (e: Exchange) => {
    setRows((prev) => prev.filter((x) => x.id !== e.id));
    toast.success("Exchange deleted", { description: `${e.id} removed from the list.` });
  };

  const columns: Column<Exchange>[] = [
    {
      key: "customer",
      header: "Customer",
      cell: (e) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{e.customerName}</p>
          <p className="truncate text-xs text-muted-foreground">{e.phone}</p>
        </div>
      ),
    },
    { key: "old", header: "Customer Vehicle", cell: (e) => <span className="text-sm">{e.customerVehicle}</span> },
    { key: "new", header: "New Vehicle", cell: (e) => <span className="text-sm">{e.newVehicle}</span> },
    {
      key: "dealers",
      header: "Dealers",
      cell: (e) => (
        <div className="text-xs text-muted-foreground">
          <p>{e.dealer1}</p>
          <p>{e.dealer2}</p>
        </div>
      ),
    },
    { key: "cash", header: "Cash Adjustment", cell: (e) => formatPKR(e.cashAdjustment) },
    { key: "final", header: "Final Amount", cell: (e) => <span className="font-semibold">{formatPKR(e.finalAmount)}</span> },
    { key: "status", header: "Status", cell: (e) => <StatusBadge status={e.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="View exchange">
            <Link to="/exchanges/$id" params={{ id: e.id }}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="Edit exchange">
            <Link to="/exchanges/$id/edit" params={{ id: e.id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDelete itemName={`Exchange ${e.id}`} onConfirm={() => remove(e)}>
            <Button size="icon" variant="ghost" className="rounded-lg text-destructive" aria-label="Delete exchange">
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
        title="Exchanges"
        subtitle="Car exchange deals between customers and dealers"
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/exchanges/new">
              <Plus className="h-4 w-4" /> Add Exchange
            </Link>
          </Button>
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by customer, vehicle or dealer..."
        searchKeys={(e) => `${e.customerName} ${e.customerVehicle} ${e.newVehicle} ${e.dealer1} ${e.dealer2}`}
        filters={[{ label: "Status", options: ["Completed", "Pending"], match: (e, v) => e.status === v }]}
        emptyTitle="No exchange found"
      />
    </div>
  );
}
