import { useMemo, useState, type ReactNode, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

export type FilterConfig<T> = {
  label: string;
  options: string[];
  match: (row: T, value: string) => boolean;
  onChange?: (value: string) => void; // For API filtering
};

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchKeys,
  searchPlaceholder = "Search...",
  filters = [],
  loading = false,
  pageSize = 10,
  emptyTitle,
  emptyAction,
  onSearch,
  pagination,
  totalCount,
}: {
  rows: T[];
  columns: Column<T>[];
  searchKeys: (row: T) => string;
  searchPlaceholder?: string;
  filters?: FilterConfig<T>[];
  loading?: boolean;
  pageSize?: number;
  emptyTitle?: string;
  emptyAction?: ReactNode;
  onSearch?: (query: string) => void;
  pagination?: PaginationProps;
  totalCount?: number;
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  // Handle filter changes
  const handleFilterChange = (filterLabel: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [filterLabel]: value }));
    setPage(1);

    // Find the filter config and call onChange if exists
    const filter = filters.find((f) => f.label === filterLabel);
    if (filter?.onChange) {
      filter.onChange(value);
    }
  };

  // Local filtering (if not using API pagination)
  const filteredRows = useMemo(() => {
    // If we have pagination from API, use rows directly
    if (pagination) {
      return rows;
    }

    // Otherwise, do local filtering
    return rows.filter((row) => {
      const matchesQuery = searchKeys(row).toLowerCase().includes(query.trim().toLowerCase());
      const matchesFilters = filters.every((f) => {
        const value = filterValues[f.label];
        return !value || value === "all" || f.match(row, value);
      });
      return matchesQuery && matchesFilters;
    });
  }, [rows, query, filterValues, filters, searchKeys, pagination]);

  // Calculate pagination for local filtering
  const localTotalPages = pagination
    ? pagination.totalPages
    : Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const localCurrentPage = pagination ? pagination.currentPage : Math.min(page, localTotalPages);

  // Get current page data
  const currentData = pagination
    ? rows
    : filteredRows.slice((localCurrentPage - 1) * pageSize, localCurrentPage * pageSize);

  // Total count display
  const displayTotal = pagination ? pagination.totalItems : filteredRows.length;

  // Handler for page change
  const handlePageChange = (newPage: number) => {
    if (pagination) {
      pagination.onPageChange(newPage);
    } else {
      setPage(newPage);
    }
  };

  return (
    <div className="card-soft overflow-hidden">
      <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!onSearch) {
                setPage(1);
              }
            }}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl pl-9"
          />
        </div>
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
            {filters.map((f) => (
              <Select
                key={f.label}
                value={filterValues[f.label] ?? "all"}
                onValueChange={(v) => handleFilterChange(f.label, v)}
              >
                <SelectTrigger className="h-10 w-[150px] rounded-xl">
                  <SelectValue placeholder={f.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {f.label}</SelectItem>
                  {f.options.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <TableSkeleton cols={columns.length} />
      ) : currentData.length === 0 ? (
        <EmptyState title={emptyTitle ?? "No records found"} action={emptyAction} />
      ) : (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                {columns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={`whitespace-nowrap text-xs uppercase tracking-wider ${c.className ?? ""}`}
                  >
                    {c.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row) => (
                <TableRow key={row.id} className="transition-colors hover:bg-accent/40">
                  {columns.map((c) => (
                    <TableCell key={c.key} className={`py-3 ${c.className ?? ""}`}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Showing {currentData.length} of {displayTotal} records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={localCurrentPage <= 1 || loading}
            onClick={() => handlePageChange(localCurrentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-xs font-medium text-muted-foreground">
            Page {localCurrentPage} / {localTotalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={localCurrentPage >= localTotalPages || loading}
            onClick={() => handlePageChange(localCurrentPage + 1)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
