// src/routes/exchanges/$id/index.tsx
import { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Pencil,
  Scale,
  HandCoins,
  User,
  Building2,
  Car,
  ArrowRight,
  DollarSign,
  Printer,
  Receipt,
  Calendar,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { exchangeService } from "@/services/exchangeService";
import { ExchangeReceipt } from "@/components/shared/ExchangeReceipt";
import { formatPKR } from "@/data/dummy";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/exchanges/$id/")({
  head: () => ({
    meta: [
      { title: "Exchange Details — Car Bargain Manager" },
      {
        name: "description",
        content:
          "Exchange deal detail with vehicles, settlement calculation and printable invoice.",
      },
      { property: "og:title", content: "Exchange Details — Car Bargain Manager" },
      {
        property: "og:description",
        content: "See full exchange information and print the invoice.",
      },
    ],
  }),
  component: ViewExchange,
});

function PersonCard({
  icon: Icon,
  label,
  name,
  fatherName,
  cnic,
  phone,
  address,
  tone,
}: {
  icon: typeof User;
  label: string;
  name?: string;
  fatherName?: string;
  cnic?: string;
  phone?: string;
  address?: string;
  tone: "blue" | "green";
}) {
  const toneClasses =
    tone === "blue"
      ? "bg-blue-50 border-blue-200 text-blue-900"
      : "bg-emerald-50 border-emerald-200 text-emerald-900";
  const iconToneClasses =
    tone === "blue" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700";

  return (
    <div className={`rounded-xl border p-4 ${toneClasses}`}>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${iconToneClasses}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</p>
      </div>
      <p className="text-lg font-bold leading-tight">{name || "—"}</p>
      {fatherName && <p className="text-sm opacity-80">S/O {fatherName}</p>}
      <div className="mt-2 space-y-0.5 text-sm opacity-90">
        {cnic && <p>CNIC: {cnic}</p>}
        {phone && <p>Phone: {phone}</p>}
        {address && <p>Address: {address}</p>}
      </div>
    </div>
  );
}

function VehicleSummary({
  company,
  model,
  year,
  value,
  extraBadge,
}: {
  company?: string;
  model?: string;
  year?: number | string;
  value?: number;
  extraBadge?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground">
          <Car className="h-4 w-4" />
        </span>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Vehicle</p>
        {extraBadge && (
          <span className="ml-auto rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-foreground">
            {extraBadge}
          </span>
        )}
      </div>
      <p className="text-lg font-bold leading-tight">
        {company} {model} {year || ""}
      </p>
      <p className="mt-1 font-display text-xl font-bold">{formatPKR(value)}</p>
    </div>
  );
}

// Small helper for the sortable column header used in the payment table
function SortableHeader({
  label,
  active,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/90 hover:text-white transition-colors ${
        align === "right" ? "ml-auto flex-row-reverse" : ""
      }`}
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${active ? "opacity-100" : "opacity-50"}`} />
    </button>
  );
}

function ViewExchange() {
  const { id } = useParams({ from: "/exchanges/$id/" });
  const navigate = useNavigate();
  const [ex, setEx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [recording, setRecording] = useState(false);

  // Sorting + pagination state for the Payment History table
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchExchange = async () => {
    setLoading(true);
    try {
      const res = await exchangeService.getById(id);
      setEx(res?.data);
    } catch (err) {
      console.error("Failed to load exchange:", err);
      toast.error("Failed to load exchange");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await exchangeService.getPayments(id);
      setPayments(res?.data || []);
    } catch (err) {
      console.error("Failed to load payment history:", err);
      toast.error("Failed to load payment history");
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchExchange();
    fetchPayments();
  }, [id]);

  // Describe a single payment transaction for display
  const describePayment = (p: any) => {
    if (p.direction === "customer_to_showroom") {
      return { from: customerOwner.name || "Customer", to: showroomOwner.name || "Showroom" };
    }
    return { from: showroomOwner.name || "Showroom", to: customerOwner.name || "Customer" };
  };

  // Filter payments by month & search
  const filteredPayments = useMemo(() => {
    let result = payments;
    // Month filter
    if (filterMonth) {
      result = result.filter((p) => {
        if (!p.date) return false;
        const d = new Date(p.date);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return month === filterMonth;
      });
    }
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const { from, to } = describePayment(p);
        return (
          from?.toLowerCase().includes(query) ||
          to?.toLowerCase().includes(query) ||
          (p.method || "").toLowerCase().includes(query) ||
          (p.notes || "").toLowerCase().includes(query) ||
          (p.recordedBy?.name || "").toLowerCase().includes(query)
        );
      });
    }
    return result;
  }, [payments, filterMonth, searchQuery]);

  // Sort the filtered payments by the active column
  const sortedPayments = useMemo(() => {
    const list = [...filteredPayments];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        cmp = (a.amount || 0) - (b.amount || 0);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filteredPayments, sortField, sortDirection]);

  // Paginate the sorted list
  const totalPages = Math.max(1, Math.ceil(sortedPayments.length / rowsPerPage));
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedPayments.slice(start, start + rowsPerPage);
  }, [sortedPayments, currentPage, rowsPerPage]);

  // Reset to page 1 whenever filters, sorting, or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterMonth, searchQuery, rowsPerPage, sortField, sortDirection]);

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (loading) return null;
  if (!ex)
    return (
      <EmptyState title="Exchange not found" description="This deal is no longer in the record." />
    );

  const typeIcon = ex.exchangeType === "Head-to-Head" ? Scale : HandCoins;
  const TypeIcon = typeIcon;
  const dateStr = new Date(ex.date).toLocaleDateString();

  const isStockSource = ex.showroomCar?.source === "stock";

  const showroomOwner = ex.showroomCar?.owner || {};
  const customerOwner = ex.customerCar?.owner || {};

  const customerPaysShowroom = ex.finalDirection === "customer_pays_showroom";
  const showroomPaysCustomer = ex.finalDirection === "showroom_pays_customer";

  const amountReceived = Number(ex.amountReceivedFromCustomer) || 0;
  const dueAmount = Number(ex.dueAmount) || 0;
  const amountPaid = Number(ex.amountPaidToCustomer) || 0;
  const dueFromShowroom = Number(ex.dueFromShowroom) || 0;

  const payerName = customerPaysShowroom ? customerOwner.name : showroomOwner.name;
  const payerCnic = customerPaysShowroom ? customerOwner.cnic : showroomOwner.cnic;
  const payeeName = customerPaysShowroom ? showroomOwner.name : customerOwner.name;
  const payeeCnic = customerPaysShowroom ? showroomOwner.cnic : customerOwner.cnic;

  const partyAIcon = isStockSource ? Building2 : User;
  const partyALabel = isStockSource ? "Dealer (Party A)" : "Customer 1 (Party A)";
  const partyBLabel = isStockSource ? "Customer (Party B)" : "Customer 2 (Party B)";

  const due = customerPaysShowroom ? dueAmount : showroomPaysCustomer ? dueFromShowroom : 0;
  const canRecord = due > 0;

  const handleRecordPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (!paymentDate) {
      toast.error("Please select a payment date");
      return;
    }

    let direction = "";
    if (customerPaysShowroom) direction = "customer_pays_showroom";
    else if (showroomPaysCustomer) direction = "showroom_pays_customer";
    else {
      toast.error("No payment is due – exchange is already settled");
      return;
    }

    const due = customerPaysShowroom ? dueAmount : dueFromShowroom;
    if (paymentAmount > due) {
      toast.error(`Payment cannot exceed the due amount (${formatPKR(due)})`);
      return;
    }

    setRecording(true);
    try {
      await exchangeService.recordPayment(id, {
        amount: paymentAmount,
        direction: direction,
        date: paymentDate,
        method: paymentMethod || "Cash",
        notes: paymentNotes || "",
      });
      toast.success("Payment recorded successfully");
      setPaymentDialogOpen(false);
      setPaymentAmount(0);
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("Cash");
      setPaymentNotes("");
      await fetchExchange();
      await fetchPayments();
    } catch (error: any) {
      console.error("Record payment error:", error);
      toast.error(error?.response?.data?.message || "Failed to record payment");
    } finally {
      setRecording(false);
    }
  };

  // Helper to format date nicely
  const formatPaymentDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPaymentTime = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-PK", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Total of filtered payments (all pages, not just the current page)
  const totalFiltered = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Method badge tone
  const methodBadgeClasses = (method: string) => {
    switch ((method || "Cash").toLowerCase()) {
      case "bank transfer":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cheque":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "mobile wallet":
        return "bg-violet-50 text-violet-700 border-violet-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title={`Exchange ${ex.dealNumber}`}
        subtitle={`${customerOwner.name || ""} · ${dateStr}`}
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-400 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
              onClick={() => {
                navigate({
                  to: "/exchanges/invoice",
                  state: { exchange: ex },
                });
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>

            {canRecord && (
              <Button
                variant="default"
                className="rounded-xl bg-black hover:bg-black/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => setPaymentDialogOpen(true)}
              >
                <DollarSign className="h-4 w-4 mr-2" /> Record Payment
              </Button>
            )}

            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/exchanges">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/exchanges/$id/edit" params={{ id: ex._id }}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
          </>
        }
      />

      <Tabs defaultValue="details">
        <TabsList className="mb-4 rounded-xl">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          {/* Party A — Dealer or Customer 1 */}
          <DetailCard
            title={
              isStockSource ? "Showroom Vehicle (from stock)" : "Customer 1's Vehicle (manual)"
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <PersonCard
                icon={partyAIcon}
                label={partyALabel}
                name={showroomOwner.name}
                fatherName={showroomOwner.fatherName}
                cnic={showroomOwner.cnic}
                phone={showroomOwner.phone}
                address={showroomOwner.address}
                tone="blue"
              />
              <VehicleSummary
                company={ex.showroomCar?.company}
                model={ex.showroomCar?.model}
                year={ex.showroomCar?.year}
                value={ex.showroomCar?.value}
                extraBadge={isStockSource ? "Stock" : "Manual"}
              />
            </div>

            <div className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2 text-sm">
              <DetailRow label="Registration" value={ex.showroomCar?.registrationNumber || "—"} />
              <DetailRow
                label="Papers Status"
                value={ex.showroomCar?.carType || "NCP (Non-Custom Paid)"}
              />
              {ex.showroomCar?.carType === "CP (Custom Paid)" ? (
                <>
                  <DetailRow
                    label="Registration City"
                    value={ex.showroomCar?.registrationCity || "—"}
                  />
                  <DetailRow label="Local Number" value={ex.showroomCar?.localNumber || "—"} />
                </>
              ) : (
                <DetailRow label="Local Number" value={ex.showroomCar?.localNumber || "—"} />
              )}
              <DetailRow label="Chassis Number" value={ex.showroomCar?.chassisNumber || "—"} />
              <DetailRow label="Engine Number" value={ex.showroomCar?.engineNumber || "—"} />
              <DetailRow
                label="Mileage"
                value={ex.showroomCar?.mileage ? `${ex.showroomCar.mileage} km` : "—"}
              />
              <DetailRow label="Color" value={ex.showroomCar?.color || "—"} />
              <DetailRow
                label="Power (CC)"
                value={ex.showroomCar?.powerCC || ex.showroomCar?.engineCC || "—"}
              />
              <DetailRow label="Condition" value={ex.showroomCar?.condition || "—"} />
              <DetailRow label="Actual Value" value={formatPKR(ex.showroomCar?.actualValue)} />
              {isStockSource && (
                <DetailRow label="Sale Price" value={formatPKR(ex.showroomCar?.salePrice)} />
              )}
            </div>
          </DetailCard>

          {/* Party B — Customer or Customer 2 */}
          <DetailCard title={isStockSource ? "Customer Vehicle" : "Customer 2's Vehicle"}>
            <div className="grid gap-3 sm:grid-cols-2">
              <PersonCard
                icon={User}
                label={partyBLabel}
                name={customerOwner.name}
                fatherName={customerOwner.fatherName}
                cnic={customerOwner.cnic}
                phone={customerOwner.phone}
                address={customerOwner.address}
                tone="green"
              />
              <VehicleSummary
                company={ex.customerCar?.company}
                model={ex.customerCar?.model}
                year={ex.customerCar?.year}
                value={ex.customerCar?.value}
              />
            </div>

            <div className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2 text-sm">
              <DetailRow label="Registration" value={ex.customerCar?.registrationNumber || "—"} />
              <DetailRow
                label="Papers Status"
                value={ex.customerCar?.carType || "NCP (Non-Custom Paid)"}
              />
              {ex.customerCar?.carType === "CP (Custom Paid)" ? (
                <>
                  <DetailRow
                    label="Registration City"
                    value={ex.customerCar?.registrationCity || "—"}
                  />
                  <DetailRow label="Local Number" value={ex.customerCar?.localNumber || "—"} />
                </>
              ) : (
                <DetailRow label="Local Number" value={ex.customerCar?.localNumber || "—"} />
              )}
              <DetailRow label="Chassis Number" value={ex.customerCar?.chassisNumber || "—"} />
              <DetailRow label="Engine Number" value={ex.customerCar?.engineNumber || "—"} />
              <DetailRow
                label="Mileage"
                value={ex.customerCar?.mileage ? `${ex.customerCar.mileage} km` : "—"}
              />
              <DetailRow label="Color" value={ex.customerCar?.color || "—"} />
              <DetailRow
                label="Power (CC)"
                value={ex.customerCar?.powerCC || ex.customerCar?.engineCC || "—"}
              />
              <DetailRow label="Condition" value={ex.customerCar?.condition || "—"} />
            </div>
          </DetailCard>

          {/* Settlement and payments */}
          <DetailCard title="Settlement & Payment Tracking">
            <div className="grid gap-3 sm:grid-cols-3 mb-4">
              <div className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Exchange Type
                </p>
                <p className="mt-1 flex items-center justify-center gap-1.5 font-display text-base font-bold">
                  <TypeIcon className="h-4 w-4" /> {ex.exchangeType}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Difference (D)
                </p>
                <p className="mt-1 font-display text-base font-bold">
                  {formatPKR(Math.abs(ex.difference))}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Adjustments</p>
                <p className="mt-1 font-display text-base font-bold">
                  {formatPKR(ex.adjustmentTotal)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-gold-soft/60 px-4 py-3 mb-3">
              <p className="text-sm font-semibold uppercase tracking-wide">Final Amount</p>
              <span className="font-display text-2xl font-bold">{formatPKR(ex.finalAmount)}</span>
            </div>

            {ex.finalDirection !== "none" ? (
              <div className="rounded-xl border border-border p-4 mb-3">
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Payment Flow
                </p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 text-center">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Pays
                    </p>
                    <p className="mt-1 text-base font-bold">{payerName || "—"}</p>
                    {payerCnic && <p className="text-xs text-muted-foreground">{payerCnic}</p>}
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <ArrowRight className="h-5 w-5 text-gold-foreground" />
                    <span className="mt-1 whitespace-nowrap text-xs font-bold text-gold-foreground">
                      {formatPKR(ex.finalAmount)}
                    </span>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Receives
                    </p>
                    <p className="mt-1 text-base font-bold">{payeeName || "—"}</p>
                    {payeeCnic && <p className="text-xs text-muted-foreground">{payeeCnic}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border p-3 mb-3 text-center text-sm text-muted-foreground">
                Values are equal — no cash exchanged
              </div>
            )}

            {customerPaysShowroom && (
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow
                  label={`Received from ${customerOwner.name || "Customer"}`}
                  value={formatPKR(amountReceived)}
                />
                <DetailRow
                  label={`Still Due from ${customerOwner.name || "Customer"}`}
                  value={formatPKR(dueAmount)}
                  valueClassName="text-destructive font-semibold"
                />
              </div>
            )}
            {showroomPaysCustomer && (
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow
                  label={`Paid to ${customerOwner.name || "Customer"}`}
                  value={formatPKR(amountPaid)}
                />
                <DetailRow
                  label={`Still Due to ${customerOwner.name || "Customer"}`}
                  value={formatPKR(dueFromShowroom)}
                  valueClassName="text-destructive font-semibold"
                />
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <DetailRow label="Status" value={<StatusBadge status={ex.status} />} />
              {canRecord && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gold-400 text-gold-700 hover:bg-gold-50"
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  <DollarSign className="h-4 w-4 mr-1" /> Record Payment
                </Button>
              )}
            </div>
          </DetailCard>

          {/* ================================================================ */}
          {/* PAYMENT HISTORY – ONE UNIFIED CARD                                */}
          {/* (filters, table, pagination, and totals all inside one border)    */}
          {/* ================================================================ */}
          <DetailCard title="Payment History">
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              {paymentsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading payments...
                  </div>
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted-foreground">
                  <Receipt className="h-10 w-10 opacity-20" />
                  <p>No payments recorded for this exchange yet.</p>
                </div>
              ) : (
                <>
                  {/* Toolbar strip */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border bg-muted/20 px-5 py-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-muted-foreground">Month:</span>
                      <Input
                        type="month"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="w-40 h-9 bg-background"
                      />
                      {filterMonth && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            const now = new Date();
                            setFilterMonth(
                              `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
                            );
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Input
                        placeholder="Search payments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-48 h-9 bg-background"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 bg-background"
                        onClick={() => {
                          const now = new Date();
                          setFilterMonth(
                            `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
                          );
                          setSearchQuery("");
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        This Month
                      </Button>
                    </div>
                  </div>

                  {filteredPayments.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No payments match your filters.
                    </div>
                  ) : (
                    <>
                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-800 dark:to-slate-700">
                              <th className="px-5 py-3.5 text-left">
                                <SortableHeader
                                  label="Date"
                                  active={sortField === "date"}
                                  onClick={() => toggleSort("date")}
                                />
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                                Paid By
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                                Paid To
                              </th>
                              <th className="px-5 py-3.5 text-right">
                                <SortableHeader
                                  label="Amount"
                                  active={sortField === "amount"}
                                  onClick={() => toggleSort("amount")}
                                  align="right"
                                />
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                                Method
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                                Notes
                              </th>
                              <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                                Recorded By
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-card">
                            {paginatedPayments.map((p) => {
                              const { from, to } = describePayment(p);
                              return (
                                <tr key={p._id} className="transition-colors hover:bg-muted/30">
                                  <td className="px-5 py-4 align-top">
                                    <p className="font-semibold leading-tight">
                                      {formatPaymentDate(p.date)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatPaymentTime(p.date)}
                                    </p>
                                  </td>
                                  <td className="px-5 py-4 align-top">
                                    <p className="font-semibold leading-tight">{from}</p>
                                  </td>
                                  <td className="px-5 py-4 align-top">
                                    <p className="font-semibold leading-tight">{to}</p>
                                  </td>
                                  <td className="px-5 py-4 text-right align-top">
                                    <span className="font-display font-bold text-emerald-600 dark:text-emerald-400">
                                      {formatPKR(p.amount)}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 align-top">
                                    <Badge
                                      variant="outline"
                                      className={`rounded-full border px-2.5 py-0.5 font-medium ${methodBadgeClasses(
                                        p.method
                                      )}`}
                                    >
                                      {p.method || "Cash"}
                                    </Badge>
                                  </td>
                                  <td className="px-5 py-4 align-top text-muted-foreground">
                                    {p.notes || "—"}
                                  </td>
                                  <td className="px-5 py-4 align-top text-muted-foreground">
                                    {p.recordedBy?.name || "—"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination strip */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-3 text-sm text-muted-foreground">
                        <span>
                          {sortedPayments.length === 0
                            ? "0 of 0"
                            : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                                currentPage * rowsPerPage,
                                sortedPayments.length
                              )} of ${sortedPayments.length}`}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span>Rows per page:</span>
                            <Select
                              value={String(rowsPerPage)}
                              onValueChange={(v) => setRowsPerPage(Number(v))}
                            >
                              <SelectTrigger className="h-8 w-[70px] bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="mr-1">
                              {currentPage}/{totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-background"
                              disabled={currentPage <= 1}
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-background"
                              disabled={currentPage >= totalPages}
                              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Totals strip — same card, top border to separate from pagination */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-border px-5 py-3 text-sm">
                        <span className="text-muted-foreground">
                          Showing <strong className="text-foreground">{filteredPayments.length}</strong> transaction
                          {filteredPayments.length !== 1 && "s"}
                          {filterMonth &&
                            ` for ${new Date(filterMonth + "-01").toLocaleDateString("en-PK", {
                              month: "long",
                              year: "numeric",
                            })}`}
                          {searchQuery && ` matching "${searchQuery}"`}
                        </span>
                        <span className="text-muted-foreground">
                          Total: <strong className="text-primary">{formatPKR(totalFiltered)}</strong>
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </DetailCard>

          {/* Adjustments */}
          {ex.adjustments?.length > 0 && (
            <DetailCard title="Adjustments">
              {ex.adjustments.map((a: any, i: number) => (
                <DetailRow key={i} label={`${a.label} (${a.type})`} value={formatPKR(a.amount)} />
              ))}
            </DetailCard>
          )}

          {/* Notes */}
          {ex.notes && (
            <DetailCard title="Notes">
              <DetailRow label="Notes" value={ex.notes} />
            </DetailCard>
          )}
        </TabsContent>

        <TabsContent value="invoice">
          <ExchangeReceipt
            ex={ex}
            showroomOwner={showroomOwner}
            customerOwner={customerOwner}
            isStockSource={isStockSource}
            dateStr={dateStr}
            payerName={payerName}
            payerCnic={payerCnic}
            payeeName={payeeName}
            payeeCnic={payeeCnic}
          />
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment against the exchange due amount.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Due Amount</p>
              <p className="font-display text-2xl font-bold text-destructive">{formatPKR(due)}</p>
              <p className="text-xs text-muted-foreground">
                {customerPaysShowroom
                  ? `${customerOwner.name || "Customer"} owes ${showroomOwner.name || "Showroom"}`
                  : showroomPaysCustomer
                    ? `${showroomOwner.name || "Showroom"} owes ${customerOwner.name || "Customer"}`
                    : "No payment due"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount (PKR)</Label>
              <Input
                id="payment-amount"
                type="number"
                min={0}
                max={due}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                placeholder="Enter amount"
              />
              {paymentAmount > due && (
                <p className="text-xs text-destructive">Amount cannot exceed due amount</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Mobile Wallet">Mobile Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes (optional)</Label>
              <Input
                id="payment-notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Any notes about this payment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPaymentDialogOpen(false);
                setPaymentAmount(0);
                setPaymentDate(new Date().toISOString().split("T")[0]);
                setPaymentMethod("Cash");
                setPaymentNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={recording || paymentAmount <= 0 || paymentAmount > due || !paymentDate}
              className="bg-black hover:bg-black/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {recording ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}