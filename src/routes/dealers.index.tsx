import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { dealers as seed, type Dealer } from "@/data/dummy";

export const Route = createFileRoute("/dealers/")({
  head: () => ({
    meta: [
      { title: "Dealers — Car Bargain Manager" },
      { name: "description", content: "Dealer directory with contact number, CNIC, address and notes." },
      { property: "og:title", content: "Dealers — Car Bargain Manager" },
      { property: "og:description", content: "Keep all partner dealer contacts in one place." },
    ],
  }),
  component: DealerList,
});

function DealerList() {
  const loading = useFakeLoading();
  const [rows, setRows] = useState<Dealer[]>(seed);

  const remove = (d: Dealer) => {
    setRows((prev) => prev.filter((x) => x.id !== d.id));
    toast.success("Dealer deleted", { description: `${d.name} removed from the list.` });
  };

  const columns: Column<Dealer>[] = [
    {
      key: "name",
      header: "Dealer Name",
      cell: (d) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{d.name}</p>
          <p className="truncate text-xs text-muted-foreground">{d.id}</p>
        </div>
      ),
    },
    { key: "phone", header: "Contact Number", cell: (d) => d.phone },
    { key: "cnic", header: "CNIC", cell: (d) => <span className="font-mono text-sm">{d.cnic}</span> },
    { key: "address", header: "Address", cell: (d) => <span className="text-sm">{d.address}</span> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (d) => (
        <div className="flex justify-end gap-1">
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="View dealer">
            <Link to="/dealers/$id" params={{ id: d.id }}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="Edit dealer">
            <Link to="/dealers/$id/edit" params={{ id: d.id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDelete itemName={d.name} onConfirm={() => remove(d)}>
            <Button size="icon" variant="ghost" className="rounded-lg text-destructive" aria-label="Delete dealer">
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
        title="Dealers"
        subtitle="Partner dealers you work with"
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/dealers/new">
              <Plus className="h-4 w-4" /> Add Dealer
            </Link>
          </Button>
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by dealer name, phone or city..."
        searchKeys={(d) => `${d.name} ${d.phone} ${d.cnic} ${d.address}`}
        emptyTitle="No dealer found"
      />
    </div>
  );
}
