// routes/cars.index.tsx
import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2, Car as CarIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { carService } from "@/services/carService";
import { getImageUrl } from "@/lib/image-url";

export const Route = createFileRoute("/cars/")({
  head: () => ({
    meta: [
      { title: "Car List — Car Bargain Manager" },
      {
        name: "description",
        content: "All showroom cars with price, condition and status in one list.",
      },
      { property: "og:title", content: "Car List — Car Bargain Manager" },
      {
        property: "og:description",
        content: "Search, filter and manage every car in your showroom.",
      },
    ],
  }),
  component: CarList,
});

// Format currency in PKR
const formatPKR = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function CarList() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    status: "",
    condition: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch cars from API - wrapped in useCallback to prevent recreation
  const fetchCars = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 10,
          status: filters.status || undefined,
          condition: filters.condition || undefined,
          search: filters.search || undefined,
        };

        const response = await carService.getAll(params);

        if (response.success) {
          setCars(response.data);
          setPagination(response.pagination);
          setCurrentPage(page);
        } else {
          toast.error("Failed to load cars", {
            description: "Please try again later.",
          });
        }
      } catch (error: any) {
        console.error("Error fetching cars:", error);
        toast.error("Failed to load cars", {
          description: error.response?.data?.message || "Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    },
    [filters.status, filters.condition, filters.search],
  );

  // Load cars on component mount and when filters change
  useEffect(() => {
    fetchCars(1);
  }, [fetchCars]);

  // Handle search - update filters and reset to page 1
  const handleSearch = useCallback((searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  }, []);

  // Handle filter change - update filters and reset to page 1
  const handleFilterChange = useCallback((filterKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      fetchCars(page);
    },
    [fetchCars],
  );

  // Delete a car
  const deleteCar = useCallback(
    async (car: any) => {
      try {
        const response = await carService.delete(car._id);

        if (response.success) {
          toast.success("Car deleted", {
            description: `${car.company} ${car.model} removed from the list.`,
          });
          fetchCars(currentPage);
        } else {
          toast.error("Failed to delete car", {
            description: response.message || "Please try again.",
          });
        }
      } catch (error: any) {
        console.error("Error deleting car:", error);
        toast.error("Failed to delete car", {
          description: error.response?.data?.message || "Please try again.",
        });
      }
    },
    [fetchCars, currentPage],
  );

  // Refresh cars
  const handleRefresh = useCallback(() => {
    fetchCars(currentPage);
  }, [fetchCars, currentPage]);

  // Columns definition
  const columns: Column<any>[] = [
    {
      key: "car",
      header: "Car",
      cell: (c) => (
        <div className="flex min-w-0 items-center gap-3">
          {c.images && c.images.length > 0 ? (
            <img
              src={getImageUrl(c.images[0])}
              alt={`${c.company} ${c.model}`}
              loading="lazy"
              className="h-11 w-16 shrink-0 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-car.jpg";
              }}
            />
          ) : (
            <div className="h-11 w-16 shrink-0 rounded-lg bg-muted flex items-center justify-center">
              <CarIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold">{c.company}</p>
            <p className="truncate text-xs text-muted-foreground">
              {c.model} · {c.year} {c.variant ? `· ${c.variant}` : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "Owner",
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{c.userName}</p>
          <p className="truncate text-xs text-muted-foreground">{c.userPhone}</p>
          {c.dealerName && <p className="truncate text-xs text-blue-600">Dealer: {c.dealerName}</p>}
        </div>
      ),
    },
    {
      key: "registrationNumber",
      header: "Reg. Number",
      cell: (c) => (
        <span className="font-mono text-sm">
          {c.carType === "CP (Custom Paid)" ? c.registrationNumber : c.localNumber || "N/A"}
        </span>
      ),
    },
    {
      key: "color",
      header: "Color",
      cell: (c) => (
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full border"
            style={{ backgroundColor: c.color.toLowerCase() }}
          />
          <span className="text-sm">{c.color}</span>
        </div>
      ),
    },
    {
      key: "condition",
      header: "Condition",
      cell: (c) => (
        <span
          className={`text-sm ${
            c.condition === "New"
              ? "text-green-600"
              : c.condition === "Certified Pre-Owned"
                ? "text-blue-600"
                : "text-yellow-600"
          }`}
        >
          {c.condition}
        </span>
      ),
    },
    {
      key: "salePrice",
      header: "Price",
      cell: (c) => (
        <span className="font-semibold">{c.salePrice ? formatPKR(c.salePrice) : "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "dateAdded",
      header: "Added",
      cell: (c) => (
        <span className="text-xs text-muted-foreground">
          {new Date(c.dateAdded).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="View car">
            <Link to="/cars/$id" params={{ id: c._id }}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="Edit car">
            <Link to="/cars/$id/edit" params={{ id: c._id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDelete
            itemName={`${c.company} ${c.model} (${c.registrationNumber || c.localNumber || "N/A"})`}
            onConfirm={() => deleteCar(c)}
          >
            <Button
              size="icon"
              variant="ghost"
              className="rounded-lg text-destructive"
              aria-label="Delete car"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </ConfirmDelete>
        </div>
      ),
    },
  ];

  // Filter configurations
  const filtersConfig: FilterConfig<any>[] = [
    {
      label: "Status",
      options: ["Available", "Reserved", "Sold"],
      match: (c, v) => c.status === v,
      onChange: (v) => handleFilterChange("status", v),
    },
    {
      label: "Condition",
      options: ["New", "Used", "Certified Pre-Owned"],
      match: (c, v) => c.condition === v,
      onChange: (v) => handleFilterChange("condition", v),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Cars"
        subtitle="All vehicles in your showroom record"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/cars/new">
                <Plus className="h-4 w-4" /> Add Car
              </Link>
            </Button>
          </div>
        }
      />

      <DataTable
        rows={cars}
        columns={columns}
        loading={loading}
        searchKeys={(c) =>
          `${c.company} ${c.model} ${c.registrationNumber} ${c.localNumber} ${c.userName} ${c.userPhone} ${c.dealerName || ""}`
        }
        searchPlaceholder="Search by car name, model, registration number, owner or dealer..."
        onSearch={handleSearch}
        filters={filtersConfig}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: handlePageChange,
        }}
        totalCount={pagination.totalItems}
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
