import { useMemo, useState, type ReactNode } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchKeys,
  searchPlaceholder = "Search...",
  filters = [],
  loading = false,
  pageSize = 6,
  emptyTitle,
  emptyAction,
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
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesQuery = searchKeys(row).toLowerCase().includes(query.trim().toLowerCase());
      const matchesFilters = filters.every((f) => {
        const value = filterValues[f.label];
        return !value || value === "all" || f.match(row, value);
      });
      return matchesQuery && matchesFilters;
    });
  }, [rows, query, filterValues, filters, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="card-soft overflow-hidden">
      <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
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
                onValueChange={(v) => {
                  setFilterValues((prev) => ({ ...prev, [f.label]: v }));
                  setPage(1);
                }}
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
      ) : paged.length === 0 ? (
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
              {paged.map((row) => (
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
          Showing {paged.length} of {filtered.length} records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-xs font-medium text-muted-foreground">
            Page {current} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
