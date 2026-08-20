import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2, Scale, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { exchangeService } from "@/services/exchangeService";
import { formatPKR } from "@/data/dummy";

type ExchangeRow = {
  _id: string;
  dealNumber: string;
  customerName: string;
  customerPhone: string;
  showroomCar: {
    company: string;
    model: string;
    year: number;
    registrationNumber?: string;
    value: number;
  };
  customerCar: {
    company: string;
    model: string;
    year: number;
    registrationNumber?: string;
    value: number;
  };
  exchangeType: "Head-to-Head" | "Car + Money Giving" | "Car + Money Getting";
  finalAmount: number;
  finalDirection: string;
  status: string;
  date: string;
};

const typeIcon = (type: string) =>
  type === "Head-to-Head" ? (
    <Scale className="h-3.5 w-3.5" />
  ) : (
    <HandCoins className="h-3.5 w-3.5" />
  );

export const Route = createFileRoute("/exchanges/")({
  head: () => ({
    meta: [
      { title: "Exchanges — Car Bargain Manager" },
      {
        name: "description",
        content:
          "All car exchange deals with showroom vehicles, customer vehicles and settlement amounts.",
      },
      { property: "og:title", content: "Exchanges — Car Bargain Manager" },
      {
        property: "og:description",
        content: "Track every vehicle exchange deal done by your showroom.",
      },
    ],
  }),
  component: ExchangeList,
});

function ExchangeList() {
  const [rows, setRows] = useState<ExchangeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    exchangeService
      .getAll({ limit: 200 })
      .then((res) => setRows(res?.data || []))
      .catch((err) => {
        console.error("Failed to load exchanges:", err);
        toast.error("Failed to load exchanges");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (e: ExchangeRow) => {
    try {
      await exchangeService.delete(e._id);
      setRows((prev) => prev.filter((x) => x._id !== e._id));
      toast.success("Exchange deleted", { description: `${e.dealNumber} removed from the list.` });
    } catch (err) {
      console.error("Delete exchange error:", err);
      toast.error("Failed to delete exchange");
    }
  };

  const columns: Column<ExchangeRow>[] = [
    {
      key: "customer",
      header: "Customer",
      cell: (e) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{e.customerName}</p>
          <p className="truncate text-xs text-muted-foreground">{e.customerPhone}</p>
        </div>
      ),
    },
    {
      key: "showroom",
      header: "Showroom Vehicle",
      cell: (e) => (
        <span className="text-sm">
          {e.showroomCar?.company} {e.showroomCar?.model} {e.showroomCar?.year}
        </span>
      ),
    },
    {
      key: "customerCar",
      header: "Customer Vehicle",
      cell: (e) => (
        <span className="text-sm">
          {e.customerCar?.company} {e.customerCar?.model} {e.customerCar?.year}
        </span>
      ),
    },
    {
      key: "type",
      header: "Exchange Type",
      cell: (e) => (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium">
          {typeIcon(e.exchangeType)} {e.exchangeType}
        </span>
      ),
    },
    {
      key: "final",
      header: "Final Amount",
      cell: (e) => <span className="font-semibold">{formatPKR(e.finalAmount)}</span>,
    },
    { key: "status", header: "Status", cell: (e) => <StatusBadge status={e.status} /> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="rounded-lg"
            aria-label="View exchange"
          >
            <Link to="/exchanges/$id" params={{ id: e._id }}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="rounded-lg"
            aria-label="Edit exchange"
          >
            <Link to="/exchanges/$id/edit" params={{ id: e._id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDelete itemName={`Exchange ${e.dealNumber}`} onConfirm={() => remove(e)}>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-lg text-destructive"
              aria-label="Delete exchange"
            >
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
        subtitle="Car exchange deals between the showroom and customers"
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
        searchPlaceholder="Search by customer, deal # or vehicle..."
        searchKeys={(e) =>
          `${e.dealNumber} ${e.customerName} ${e.customerPhone} ${e.showroomCar?.company} ${e.showroomCar?.model} ${e.customerCar?.company} ${e.customerCar?.model}`
        }
        filters={[
          {
            label: "Status",
            options: ["Pending", "Completed", "Cancelled"],
            match: (e, v) => e.status === v,
          },
          {
            label: "Type",
            options: ["Head-to-Head", "Car + Money Giving", "Car + Money Getting"],
            match: (e, v) => e.exchangeType === v,
          },
        ]}
        emptyTitle="No exchange found"
      />
    </div>
  );
}
