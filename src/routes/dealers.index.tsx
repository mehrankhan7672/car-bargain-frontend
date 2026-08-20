import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column, type PaginationProps } from "@/components/shared/DataTable";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { EmptyState } from "@/components/shared/EmptyState";
import { dealerService } from "@/services/dealerService";

interface Dealer {
  id: string;
  _id?: string; // FIX: backend returns Mongo's _id — normalized into id below
  name: string;
  phone: string;
  cnic: string;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const Route = createFileRoute("/dealers/")({
  head: () => ({
    meta: [
      { title: "Dealers — Car Bargain Manager" },
      {
        name: "description",
        content: "Dealer directory with contact number, CNIC, address and notes.",
      },
      { property: "og:title", content: "Dealers — Car Bargain Manager" },
      { property: "og:description", content: "Keep all partner dealer contacts in one place." },
    ],
  }),
  component: DealerList,
});

function DealerList() {
  const [rows, setRows] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    fetchDealers();
  }, [currentPage, searchQuery]);

  const fetchDealers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dealerService.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
      });

      // FIX: backend returns _id, not id. Normalize once here so every
      // downstream usage (table row key, view/edit/delete links) just
      // works without scattering `d._id ?? d.id` fallbacks everywhere.
      const normalized: Dealer[] = (response.data || []).map((d: any) => ({
        ...d,
        id: d.id ?? d._id,
      }));

      setRows(normalized);
      setTotalCount(response.pagination?.total || 0);
    } catch (error: any) {
      console.error("Error fetching dealers:", error);
      setError(error.response?.data?.message || "Failed to load dealers");
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const remove = async (dealer: Dealer) => {
    try {
      await dealerService.delete(dealer.id);
      toast.success("Dealer deleted", {
        description: `${dealer.name} removed from the list.`,
      });
      // Refresh the list after deletion
      await fetchDealers();
    } catch (error: any) {
      console.error("Error deleting dealer:", error);
      toast.error("Failed to delete dealer", {
        description: error.response?.data?.message || "Please try again",
      });
    }
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
    {
      key: "phone",
      header: "Contact Number",
      cell: (d) => <span>{d.phone}</span>,
    },
    {
      key: "cnic",
      header: "CNIC",
      cell: (d) => <span className="font-mono text-sm">{d.cnic}</span>,
    },
    {
      key: "address",
      header: "Address",
      cell: (d) => <span className="text-sm">{d.address}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (d) => (
        <div className="flex justify-end gap-1">
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="rounded-lg"
            aria-label="View dealer"
          >
            <Link to="/dealers/$id" params={{ id: d.id }}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="rounded-lg"
            aria-label="Edit dealer"
          >
            <Link to="/dealers/$id/edit" params={{ id: d.id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDelete itemName={d.name} onConfirm={() => remove(d)}>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-lg text-destructive"
              aria-label="Delete dealer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </ConfirmDelete>
        </div>
      ),
    },
  ];

  const paginationProps: PaginationProps = {
    currentPage,
    totalPages: Math.ceil(totalCount / pageSize) || 1,
    totalItems: totalCount,
    itemsPerPage: pageSize,
    onPageChange: handlePageChange,
  };

  if (error) {
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
        <EmptyState
          title="Failed to load dealers"
          action={
            <Button onClick={fetchDealers} variant="outline">
              Retry
            </Button>
          }
        />
      </div>
    );
  }

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
        searchKeys={(d) => `${d.name} ${d.phone} ${d.cnic} ${d.address}`}
        searchPlaceholder="Search by dealer name, phone or CNIC..."
        loading={loading}
        pageSize={pageSize}
        emptyTitle="No dealer found"
        onSearch={handleSearch}
        pagination={paginationProps}
        totalCount={totalCount}
      />
    </div>
  );
}
