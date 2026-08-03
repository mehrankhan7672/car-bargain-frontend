import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2, Car as CarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { cars as carSeed, formatPKR, type Car } from "@/data/dummy";

export const Route = createFileRoute("/cars/")({
  head: () => ({
    meta: [
      { title: "Car List — Car Bargain Manager" },
      { name: "description", content: "All showroom cars with price, condition and status in one list." },
      { property: "og:title", content: "Car List — Car Bargain Manager" },
      { property: "og:description", content: "Search, filter and manage every car in your showroom." },
    ],
  }),
  component: CarList,
});

function CarList() {
  const loading = useFakeLoading();
  const [rows, setRows] = useState<Car[]>(carSeed);

  const remove = (car: Car) => {
    setRows((prev) => prev.filter((c) => c.id !== car.id));
    toast.success("Car deleted", { description: `${car.name} removed from the list.` });
  };

  const columns: Column<Car>[] = [
    {
      key: "car",
      header: "Car",
      cell: (c) => (
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={c.images[0]}
            alt={`${c.name} ${c.model}`}
            loading="lazy"
            className="h-11 w-16 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold">{c.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {c.model} · {c.year}
            </p>
          </div>
        </div>
      ),
    },
    { key: "reg", header: "Reg. Number", cell: (c) => <span className="font-mono text-sm">{c.regNo}</span> },
    { key: "color", header: "Color", cell: (c) => c.color },
    { key: "condition", header: "Condition", cell: (c) => c.condition },
    { key: "price", header: "Price", cell: (c) => <span className="font-semibold">{formatPKR(c.price)}</span> },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="View car">
            <Link to="/cars/$id" params={{ id: c.id }}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="Edit car">
            <Link to="/cars/$id/edit" params={{ id: c.id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDelete itemName={`${c.name} (${c.regNo})`} onConfirm={() => remove(c)}>
            <Button size="icon" variant="ghost" className="rounded-lg text-destructive" aria-label="Delete car">
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
        title="Cars"
        subtitle="All vehicles in your showroom record"
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/cars/new">
              <Plus className="h-4 w-4" /> Add Car
            </Link>
          </Button>
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by car name, model or registration number..."
        searchKeys={(c) => `${c.name} ${c.model} ${c.regNo} ${c.color} ${c.year}`}
        filters={[
          { label: "Status", options: ["Available", "Sold", "Exchanged"], match: (c, v) => c.status === v },
          { label: "Condition", options: ["New", "Excellent", "Good", "Fair"], match: (c, v) => c.condition === v },
        ]}
        emptyTitle="No cars found"
        emptyAction={
          <Button asChild className="rounded-xl">
            <Link to="/cars/new">
              <CarIcon className="h-4 w-4" /> Add your first car
            </Link>
          </Button>
        }
      />
    </div>
  );
}
