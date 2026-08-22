// src/routes/exchanges/$id/index.tsx (updated with visible Print button)
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PrintableDocument } from "@/components/shared/PrintableDocument";
import { exchangeService } from "@/services/exchangeService";
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
  cnic,
  phone,
  address,
  tone,
}: {
  icon: typeof User;
  label: string;
  name?: string;
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

function ViewExchange() {
  const { id } = useParams({ from: "/exchanges/$id/" });
  const navigate = useNavigate();
  const [ex, setEx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [recording, setRecording] = useState(false);

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

  useEffect(() => {
    fetchExchange();
  }, [id]);

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
    } catch (error: any) {
      console.error("Record payment error:", error);
      toast.error(error?.response?.data?.message || "Failed to record payment");
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title={`Exchange ${ex.dealNumber}`}
        subtitle={`${customerOwner.name || ""} · ${dateStr}`}
        actions={
          <>
            {/* 👇 NEW: "Print Receipt (Image)" button - now first, solid amber */}
            <Button
              variant="default"
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => {
                navigate({
                  to: "/exchanges/invoice",
                  state: { exchange: ex },
                });
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt (Image)
            </Button>

            {canRecord && (
              <Button
                variant="default"
                className="rounded-xl bg-gold-600 hover:bg-gold-700"
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
              <DetailRow
                label="Mileage"
                value={ex.showroomCar?.mileage ? `${ex.showroomCar.mileage} km` : "—"}
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
              <DetailRow
                label="Mileage"
                value={ex.customerCar?.mileage ? `${ex.customerCar.mileage} km` : "—"}
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
          <PrintableDocument
            docType="Exchange Invoice"
            docNo={ex.dealNumber}
            date={dateStr}
            customer={[
              { label: "Name", value: customerOwner.name || "—" },
              { label: "CNIC", value: customerOwner.cnic || "—" },
              { label: "Phone", value: customerOwner.phone || "—" },
              { label: "Address", value: customerOwner.address || "—" },
            ]}
            details={[
              {
                label: isStockSource ? "Dealer" : "Customer 1",
                value: `${showroomOwner.name || "—"}${showroomOwner.cnic ? ` (CNIC: ${showroomOwner.cnic})` : ""}`,
              },
              {
                label: `${isStockSource ? "Showroom Vehicle (from stock)" : "Customer 1 Vehicle (manual)"}`,
                value: `${ex.showroomCar?.company} ${ex.showroomCar?.model} ${ex.showroomCar?.year || ""} — ${formatPKR(ex.showroomCar?.value)}`,
              },
              {
                label: "Customer Vehicle",
                value: `${ex.customerCar?.company} ${ex.customerCar?.model} ${ex.customerCar?.year || ""} — ${formatPKR(ex.customerCar?.value)}`,
              },
              { label: "Exchange Type", value: ex.exchangeType },
              { label: "Difference (D)", value: formatPKR(ex.difference) },
              { label: "Settlement Amount", value: formatPKR(ex.settlementAmount) },
              { label: "Adjustments", value: formatPKR(ex.adjustmentTotal) },
              ...(ex.finalDirection !== "none"
                ? [
                    {
                      label: "Payment Flow",
                      value: `${payerName || "—"}${payerCnic ? ` (${payerCnic})` : ""} → ${payeeName || "—"}${payeeCnic ? ` (${payeeCnic})` : ""}`,
                    },
                  ]
                : []),
            ]}
            amountLabel={
              ex.finalDirection === "customer_pays_showroom"
                ? `${customerOwner.name || "Customer"} Pays ${showroomOwner.name || "Showroom"}`
                : ex.finalDirection === "showroom_pays_customer"
                  ? `${showroomOwner.name || "Showroom"} Pays ${customerOwner.name || "Customer"}`
                  : "Final Amount"
            }
            amount={ex.finalAmount}
            extraLines={
              <>
                {customerPaysShowroom && (
                  <>
                    <div className="flex justify-between border-t border-border pt-2 text-sm">
                      <span>Received from {customerOwner.name || "Customer"}</span>
                      <span>{formatPKR(amountReceived)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-destructive">
                      <span>Still Due from {customerOwner.name || "Customer"}</span>
                      <span>{formatPKR(dueAmount)}</span>
                    </div>
                  </>
                )}
                {showroomPaysCustomer && (
                  <>
                    <div className="flex justify-between border-t border-border pt-2 text-sm">
                      <span>Paid to {customerOwner.name || "Customer"}</span>
                      <span>{formatPKR(amountPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-destructive">
                      <span>Still Due to {customerOwner.name || "Customer"}</span>
                      <span>{formatPKR(dueFromShowroom)}</span>
                    </div>
                  </>
                )}
              </>
            }
            footerNote="Both parties agree to this exchange. Vehicle papers handed over after full payment."
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
              className="bg-black hover:bg-black/90 text-white"
            >
              {recording ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
