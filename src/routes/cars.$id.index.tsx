// routes/cars/$id/index.tsx
import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Car,
  User,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Fuel,
  Gauge,
  Settings,
  Palette,
  Hash,
  Loader2,
  Image as ImageIcon,
  FileText,
  Receipt,
  Repeat2,
  PlusCircle,
  DollarSign,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { carService } from "@/services/carService";
import { saleService } from "@/services/saleService";
import { getImageUrl } from "@/lib/image-url";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomInvoice } from "@/components/shared/CustomInvoice";
// Dialog & form for payments
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import the sale agreement template image
import formTemplate from "@/assets/sale-agreement-form.png";

export const Route = createFileRoute("/cars/$id/")({
  head: () => ({
    meta: [
      { title: "Car Details — Car Bargain Manager" },
      {
        name: "description",
        content: "Full car detail with photo gallery, sale record and printable invoice.",
      },
      { property: "og:title", content: "Car Details — Car Bargain Manager" },
      {
        property: "og:description",
        content: "Vehicle information, sale details and invoice preview.",
      },
    ],
  }),
  component: ViewCar,
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

// Format a date string/Date for display
const formatDate = (value: string | Date) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper to format date as DD/MM/YYYY for invoice
const formatInvoiceDate = (date: string | Date | null) => {
  if (!date) return "";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// Months + days until a target date (for instalment deadline)
const monthsAndDaysUntil = (target: string | Date): string => {
  const to = new Date(target);
  if (isNaN(to.getTime())) return "";
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) return "";
  return `${months} month${months === 1 ? "" : "s"} ${days} day${days === 1 ? "" : "s"}`;
};

// Zod schema for payment form
const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive").min(1, "Amount is required"),
  date: z.string().optional(),
  note: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// ---- Invoice overlay field positions (same as sales/invoice) ----
type FieldPos = {
  top: number;
  left: number;
  width: number;
  align?: "left" | "right" | "center";
  fontSize?: string;
  fontWeight?: number;
};

const FIELDS = {
  date: { top: 20.6, left: -15, width: 37, align: "right" } as FieldPos,
  sellerName: { top: 24.6, left: 58.3, width: 30.6, align: "center" } as FieldPos,
  sellerAddress: { top: 24.6, left: -70, width: 100, align: "right" } as FieldPos,
  buyerName: { top: 28.9, left: 58.3, width: 30.6, align: "center" } as FieldPos,
  buyerFather: { top: 28.9, left: 38.7, width: 30.7, align: "center" } as FieldPos,
  buyerAddress: { top: 28.9, left: -75, width: 100, align: "right" } as FieldPos,
  carCompany: { top: 32.9, left: 57.4, width: 30.4, align: "right" } as FieldPos,
  carModel: { top: 32.9, left: 12, width: 30.1, align: "right" } as FieldPos,
  carRegNumber: { top: 32.9, left: 33.2, width: 30.4, align: "right" } as FieldPos,
  carEngineNumber: { top: 32.9, left: -22, width: 40, align: "right" } as FieldPos,
  carChassisNumber: { top: 37.1, left: 28.3, width: 50.6, align: "right" } as FieldPos,
  carColor: { top: 37.1, left: 10.4, width: 30.5, align: "right" } as FieldPos,
  carEngineCC: { top: 37.1, left: -15, width: 30.7, align: "right" } as FieldPos,
  totalPrice: { top: 41, left: 35.3, width: 46.6, align: "right" } as FieldPos,
  halfPrice: { top: 41, left: 18.4, width: 20.7, align: "right" } as FieldPos,
  amountReceived: { top: 45.5, left: 50.3, width: 30.1, align: "right" } as FieldPos,
  remaining: { top: 45.2, left: 4, width: 24.3, align: "right" } as FieldPos,
  deadlineDate: { top: 48.7, left: 33, width: 30, align: "right" } as FieldPos,
  deadlineDuration: { top: 48.7, left: 52, width: 40, align: "right" } as FieldPos,
  monthlyInstalment: { top: 48.7, left: 8.4, width: 14.7, align: "right" } as FieldPos,
};

// Overlay field component
const F = ({
  pos,
  value,
  ltr = false,
}: {
  pos: FieldPos;
  value?: string | null;
  ltr?: boolean;
}) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <span
      dir={ltr ? "ltr" : "rtl"}
      style={{
        position: "absolute",
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        width: `${pos.width}%`,
        textAlign: pos.align || "right",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontSize: pos.fontSize || "clamp(8px, 1.5vw, 16px)",
        fontWeight: pos.fontWeight || 700,
        color: "#111",
        lineHeight: 1,
      }}
    >
      {value}
    </span>
  );
};

function ViewCar() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Sales state
  const [sales, setSales] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);

  // Payment dialog state
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      note: "",
    },
  });

  // Fetch car data
  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await carService.getById(id);
        if (response.success) {
          setCar(response.data);
        } else {
          toast.error("Failed to load car details", {
            description: "The car you're looking for might not exist.",
          });
          navigate({ to: "/cars" });
        }
      } catch (error: any) {
        console.error("Error fetching car:", error);
        toast.error("Failed to load car details", {
          description: error.response?.data?.message || "Please try again.",
        });
        navigate({ to: "/cars" });
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id, navigate]);

  // Fetch sales for this car
  const fetchSales = async () => {
    if (!id) return;
    try {
      setSalesLoading(true);
      const response = await saleService.getAll({ carId: id });
      if (response.success) {
        setSales(response.data || []);
      } else {
        if (car?.sale) setSales([car.sale]);
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      if (car?.sale) setSales([car.sale]);
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [id, car?.sale]);

  // Handle adding a payment
  const onAddPayment = async (values: PaymentFormValues) => {
    if (!selectedSaleId) return;
    try {
      setSubmittingPayment(true);
      await saleService.addPayment(selectedSaleId, {
        amount: values.amount,
        date: values.date || new Date().toISOString(),
        note: values.note,
      });
      toast.success("Payment recorded successfully");
      setIsPaymentDialogOpen(false);
      form.reset();
      await fetchSales();
    } catch (error: any) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await carService.delete(id);
      if (response.success) {
        toast.success("Car deleted", {
          description: `${car.company} ${car.model} has been removed.`,
        });
        navigate({ to: "/cars" });
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
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <EmptyState
          title="Car not found"
          description="This vehicle is not in the record anymore."
          action={
            <Button asChild className="rounded-xl">
              <Link to="/cars">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cars
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const isRegisteredCar = car.carType === "CP (Custom Paid)";
  const exchangeCar =
    car.exchangeCarId && typeof car.exchangeCarId === "object" ? car.exchangeCarId : null;

  const formatMoneyOrNA = (amount: number | null | undefined) =>
    amount !== null && amount !== undefined ? formatPKR(amount) : "N/A";

  // Helper to compute remaining due
  const getRemainingDue = (sale: any) => {
    const totalPrice = sale.carSnapshot?.salePrice ?? car.salePrice ?? 0;
    const advance = sale.advancePayment || 0;
    const payments = sale.payments || [];
    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalReceived = advance + totalPaid;
    return Math.max(0, totalPrice - totalReceived);
  };

  // Get the sale to display in invoice (use the first sale, or fallback to car.sale)
  const invoiceSale = sales.length > 0 ? sales[0] : car.sale || null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageHeader
        title={`${car.company} ${car.model}`}
        subtitle={
          isRegisteredCar
            ? `${car.year} · ${car.registrationNumber}`
            : `${car.year} · ${car.localNumber || "N/A"}`
        }
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/cars">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/cars/$id/edit" params={{ id: car._id }}>
                <Pencil className="h-4 w-4" /> Edit Car
              </Link>
            </Button>
            <ConfirmDelete
              itemName={`${car.company} ${car.model} (${
                isRegisteredCar ? car.registrationNumber : car.localNumber || "N/A"
              })`}
              onConfirm={handleDelete}
            >
              <Button variant="destructive" className="rounded-xl" disabled={deleting}>
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </ConfirmDelete>
          </div>
        }
      />

      <Tabs defaultValue="details" className="mt-6">
        <TabsList className="mb-4 rounded-xl">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="sale">Sale Details</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
        </TabsList>

        {/* ===== DETAILS TAB ===== (unchanged) */}
        <TabsContent value="details" className="space-y-4">
          {/* ... (details content is the same as before, omitted for brevity) ... */}
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="card-soft overflow-hidden">
              {car.images && car.images.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(car.images[activeImage])}
                    alt={`${car.company} ${car.model} photo ${activeImage + 1}`}
                    className="aspect-16/10 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-car.jpg";
                    }}
                  />
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {car.images.map((src: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          i === activeImage
                            ? "border-primary"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        aria-label={`Show photo ${i + 1}`}
                      >
                        <img
                          src={getImageUrl(src)}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-car.jpg";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center bg-muted">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No images available</p>
                </div>
              )}
            </div>
            <DetailCard title="Vehicle Information">
              <DetailRow label="Company" value={car.company} />
              <DetailRow label="Model" value={car.model} />
              <DetailRow label="Variant" value={car.variant || "N/A"} />
              <DetailRow label="Year" value={car.year} />
              <DetailRow label="Car Type" value={car.carType} />
              {isRegisteredCar ? (
                <>
                  <DetailRow label="Registration Number" value={car.registrationNumber} />
                  <DetailRow label="Registration City" value={car.registrationCity} />
                </>
              ) : (
                <DetailRow label="Local Number" value={car.localNumber || "N/A"} />
              )}
              <DetailRow label="Color" value={car.color} />
              <DetailRow label="Custom Color" value={car.customColor || "N/A"} />
              <DetailRow label="Condition" value={car.condition} />
              <DetailRow label="Status" value={<StatusBadge status={car.status} />} />
              <DetailRow label="Date Added" value={formatDate(car.dateAdded)} />
            </DetailCard>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <DetailCard title="Owner Information">
              <DetailRow label="Full Name" value={car.userName} />
              {car.dealerName && <DetailRow label="Dealer" value={car.dealerName} />}
              <DetailRow label="Phone Number" value={car.userPhone} />
              <DetailRow label="CNIC Number" value={car.userCnic} />
              <DetailRow label="Address" value={car.userAddress} />
            </DetailCard>
            <DetailCard title="Car Specifications">
              <DetailRow label="Mileage" value={`${car.mileage} KM`} />
              <DetailRow label="Engine CC" value={`${car.engineCC} CC`} />
              <DetailRow label="Fuel Type" value={car.fuelType} />
              <DetailRow label="Transmission" value={car.transmission} />
              <DetailRow label="Chassis Number" value={car.chassisNumber} />
              <DetailRow label="Engine Number" value={car.engineNumber} />
            </DetailCard>
          </div>
          <DetailCard title="Pricing Information">
            <DetailRow
              label="Sale Price"
              value={car.salePrice ? formatPKR(car.salePrice) : "N/A"}
            />
            <DetailRow label="Transaction Type" value={car.transactionType} />
            {car.transactionType === "Exchange with Bargain" && (
              <>
                <DetailRow label="Exchange Type" value={car.exchangeType || "N/A"} />
                <DetailRow
                  label="Exchange Additional Amount"
                  value={formatMoneyOrNA(car.exchangeAdditionalAmount)}
                />
                {car.exchangeType === "Car + Money" && (
                  <DetailRow
                    label="Money Amount"
                    value={formatMoneyOrNA(car.exchangeMoneyAmount)}
                  />
                )}
                {!exchangeCar && (
                  <DetailRow label="Exchange Car Details" value={car.exchangeCarDetails || "N/A"} />
                )}
              </>
            )}
          </DetailCard>
          {exchangeCar && (
            <DetailCard title="Exchanged Car">
              <div className="flex items-start justify-between gap-4">
                <div className="grid flex-1 grid-cols-1 gap-1 sm:grid-cols-2">
                  <DetailRow
                    label="Vehicle"
                    value={`${exchangeCar.company} ${exchangeCar.model}`}
                  />
                  <DetailRow label="Variant" value={exchangeCar.variant || "N/A"} />
                  <DetailRow label="Year" value={exchangeCar.year} />
                  <DetailRow label="Color" value={exchangeCar.color} />
                  <DetailRow
                    label={exchangeCar.registrationNumber ? "Registration Number" : "Local Number"}
                    value={exchangeCar.registrationNumber || exchangeCar.localNumber || "N/A"}
                  />
                  <DetailRow
                    label="Sale Price"
                    value={
                      exchangeCar.salePrice !== undefined && exchangeCar.salePrice !== null
                        ? formatPKR(exchangeCar.salePrice)
                        : "N/A"
                    }
                  />
                  <DetailRow label="Status" value={<StatusBadge status={exchangeCar.status} />} />
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0 rounded-xl">
                  <Link to="/cars/$id" params={{ id: exchangeCar._id }}>
                    <Repeat2 className="h-4 w-4" /> View Car
                  </Link>
                </Button>
              </div>
            </DetailCard>
          )}
          {(car.description || car.notes) && (
            <DetailCard title="Additional Information">
              {car.description && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1">{car.description}</p>
                </div>
              )}
              {car.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{car.notes}</p>
                </div>
              )}
            </DetailCard>
          )}
        </TabsContent>

        {/* ===== SALE TAB ===== (unchanged, same as before) */}
        <TabsContent value="sale">
          {salesLoading ? (
            <div className="card-soft flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sales.length > 0 ? (
            <div className="space-y-6">
              {sales.map((sale, idx) => {
                const statusColor =
                  sale.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800";
                const remainingDue = getRemainingDue(sale);
                const isInstalment = sale.paymentType === "Instalment";

                return (
                  <div
                    key={idx}
                    className="card-soft overflow-hidden rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-6 py-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        Sale #{idx + 1}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}
                      >
                        {sale.status || "Completed"}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                      {/* Seller / Buyer */}
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg bg-muted/20 p-4">
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <User className="h-4 w-4" /> Seller / Owner
                          </h4>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-border/30 pb-1">
                              <dt className="text-muted-foreground">Name</dt>
                              <dd className="font-medium">
                                {sale.sellerSnapshot?.name || car.userName || "N/A"}
                              </dd>
                            </div>
                            <div className="flex justify-between border-b border-border/30 pb-1">
                              <dt className="text-muted-foreground">Phone</dt>
                              <dd className="font-medium">
                                {sale.sellerSnapshot?.phone || car.userPhone || "N/A"}
                              </dd>
                            </div>
                            <div className="flex justify-between border-b border-border/30 pb-1">
                              <dt className="text-muted-foreground">CNIC</dt>
                              <dd className="font-medium">
                                {sale.sellerSnapshot?.cnic || car.userCnic || "N/A"}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Address</dt>
                              <dd className="font-medium text-right">
                                {sale.sellerSnapshot?.address || car.userAddress || "N/A"}
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <div className="rounded-lg bg-muted/20 p-4">
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <User className="h-4 w-4" /> Buyer
                          </h4>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-border/30 pb-1">
                              <dt className="text-muted-foreground">Name</dt>
                              <dd className="font-medium">{sale.buyerName || "N/A"}</dd>
                            </div>
                            <div className="flex justify-between border-b border-border/30 pb-1">
                              <dt className="text-muted-foreground">Father's Name</dt>
                              <dd className="font-medium">{sale.buyerFatherName || "N/A"}</dd>
                            </div>
                            <div className="flex justify-between border-b border-border/30 pb-1">
                              <dt className="text-muted-foreground">Phone</dt>
                              <dd className="font-medium">{sale.buyerPhone || "N/A"}</dd>
                            </div>
                            <div className="flex justify-between border-b border-border/30 pb-1">
                              <dt className="text-muted-foreground">CNIC</dt>
                              <dd className="font-medium">{sale.buyerCnic || "N/A"}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Address</dt>
                              <dd className="font-medium text-right">
                                {sale.buyerAddress || "N/A"}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="rounded-lg bg-muted/20 p-4">
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <CreditCard className="h-4 w-4" /> Payment
                        </h4>
                        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                          <div className="flex justify-between border-b border-border/30 pb-1">
                            <dt className="text-muted-foreground">Payment Type</dt>
                            <dd className="font-medium">{sale.paymentType || "N/A"}</dd>
                          </div>
                          {sale.paymentType === "Full Payment" && (
                            <div className="flex justify-between border-b border-border/30 pb-1">
                              <dt className="text-muted-foreground">Full Amount</dt>
                              <dd className="font-medium">
                                {formatMoneyOrNA(sale.fullPaymentAmount)}
                              </dd>
                            </div>
                          )}
                          {isInstalment && (
                            <>
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <dt className="text-muted-foreground">Advance</dt>
                                <dd className="font-medium">
                                  {formatMoneyOrNA(sale.advancePayment)}
                                </dd>
                              </div>
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <dt className="text-muted-foreground">Monthly Instalment</dt>
                                <dd className="font-medium">
                                  {formatMoneyOrNA(sale.monthlyInstalment)}
                                </dd>
                              </div>
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <dt className="text-muted-foreground">Instalment Date</dt>
                                <dd className="font-medium">
                                  {sale.instalmentDate ? formatDate(sale.instalmentDate) : "N/A"}
                                </dd>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between border-b border-border/30 pb-1">
                            <dt className="text-muted-foreground">Sale Date</dt>
                            <dd className="font-medium">{formatDate(sale.saleDate)}</dd>
                          </div>
                          {sale.formLanguage && (
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Form Language</dt>
                              <dd className="font-medium">
                                {sale.formLanguage === "en" ? "English" : "Urdu"}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      {/* Payment Summary & Add Payment */}
                      {isInstalment && (
                        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <DollarSign className="h-4 w-4" /> Payment Summary
                              </h4>
                              <dl className="space-y-1 text-sm">
                                <div className="flex gap-4">
                                  <dt className="text-muted-foreground w-32">Total Price:</dt>
                                  <dd className="font-medium">
                                    {formatPKR(sale.carSnapshot?.salePrice ?? car.salePrice ?? 0)}
                                  </dd>
                                </div>
                                <div className="flex gap-4">
                                  <dt className="text-muted-foreground w-32">Advance Paid:</dt>
                                  <dd className="font-medium">
                                    {formatMoneyOrNA(sale.advancePayment)}
                                  </dd>
                                </div>
                                {(sale.payments || []).length > 0 && (
                                  <div className="flex gap-4">
                                    <dt className="text-muted-foreground w-32">
                                      Additional Payments:
                                    </dt>
                                    <dd className="font-medium">
                                      {formatPKR(
                                        (sale.payments || []).reduce(
                                          (sum: number, p: any) => sum + p.amount,
                                          0,
                                        ),
                                      )}
                                    </dd>
                                  </div>
                                )}
                                <div className="flex gap-4 border-t border-border/30 pt-1 mt-1">
                                  <dt className="text-muted-foreground w-32 font-semibold">
                                    Remaining Due:
                                  </dt>
                                  <dd className="font-bold text-primary">
                                    {remainingDue <= 0
                                      ? "Paid in Full ✅"
                                      : formatPKR(remainingDue)}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                            {remainingDue > 0 && (
                              <Dialog
                                open={isPaymentDialogOpen && selectedSaleId === sale._id}
                                onOpenChange={(open) => {
                                  setIsPaymentDialogOpen(open);
                                  if (!open) setSelectedSaleId(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={() => {
                                      setSelectedSaleId(sale._id);
                                      setIsPaymentDialogOpen(true);
                                    }}
                                  >
                                    <PlusCircle className="h-4 w-4 mr-1" /> Add Payment
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Record Payment</DialogTitle>
                                  </DialogHeader>
                                  <Form {...form}>
                                    <form
                                      onSubmit={form.handleSubmit(onAddPayment)}
                                      className="space-y-4"
                                    >
                                      <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Amount (PKR)</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                placeholder="Enter amount"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                              <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name="note"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Note (optional)</FormLabel>
                                            <FormControl>
                                              <Input placeholder="e.g. 2nd instalment" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => {
                                            setIsPaymentDialogOpen(false);
                                            setSelectedSaleId(null);
                                            form.reset();
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button type="submit" disabled={submittingPayment}>
                                          {submittingPayment ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            "Record Payment"
                                          )}
                                        </Button>
                                      </div>
                                    </form>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                          {(sale.payments || []).length > 0 && (
                            <div className="mt-3 text-sm">
                              <p className="text-muted-foreground font-medium">Payment History</p>
                              <ul className="mt-1 space-y-1">
                                {sale.payments.map((p: any, i: number) => (
                                  <li
                                    key={i}
                                    className="flex justify-between border-b border-border/20 pb-1"
                                  >
                                    <span>
                                      {formatDate(p.date)} {p.note && `· ${p.note}`}
                                    </span>
                                    <span className="font-medium">{formatPKR(p.amount)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Car Snapshot */}
                      {sale.carSnapshot && (
                        <div className="rounded-lg bg-muted/20 p-4">
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Car className="h-4 w-4" /> Car at Sale Time
                          </h4>
                          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                            <div className="flex justify-between border-b border-border/30 pb-1">
                              <dt className="text-muted-foreground">Vehicle</dt>
                              <dd className="font-medium">
                                {`${sale.carSnapshot.company || ""} ${
                                  sale.carSnapshot.model || ""
                                }`.trim() || "N/A"}
                              </dd>
                            </div>
                            {sale.carSnapshot.variant && (
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <dt className="text-muted-foreground">Variant</dt>
                                <dd className="font-medium">{sale.carSnapshot.variant}</dd>
                              </div>
                            )}
                            {sale.carSnapshot.year && (
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <dt className="text-muted-foreground">Year</dt>
                                <dd className="font-medium">{sale.carSnapshot.year}</dd>
                              </div>
                            )}
                            {sale.carSnapshot.registrationNumber && (
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <dt className="text-muted-foreground">Registration</dt>
                                <dd className="font-medium">
                                  {sale.carSnapshot.registrationNumber}
                                </dd>
                              </div>
                            )}
                            {sale.carSnapshot.localNumber && (
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <dt className="text-muted-foreground">Local Number</dt>
                                <dd className="font-medium">{sale.carSnapshot.localNumber}</dd>
                              </div>
                            )}
                            {sale.carSnapshot.carType && (
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <dt className="text-muted-foreground">Car Type</dt>
                                <dd className="font-medium">{sale.carSnapshot.carType}</dd>
                              </div>
                            )}
                            {sale.carSnapshot.salePrice !== undefined &&
                              sale.carSnapshot.salePrice !== null && (
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Sale Price</dt>
                                  <dd className="font-medium">
                                    {formatPKR(sale.carSnapshot.salePrice)}
                                  </dd>
                                </div>
                              )}
                          </dl>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : car.sale ? (
            <DetailCard title="Sale Details">
              <DetailRow
                label="Buyer Name"
                value={car.sale.buyerName || car.sale.customerName || "N/A"}
              />
              <DetailRow label="Buyer's Father Name" value={car.sale.buyerFatherName || "N/A"} />
              <DetailRow
                label="Buyer Address"
                value={car.sale.buyerAddress || car.sale.address || "N/A"}
              />
              <DetailRow
                label="Buyer Phone"
                value={car.sale.buyerPhone || car.sale.phone || "N/A"}
              />
              <DetailRow label="Buyer CNIC" value={car.sale.buyerCnic || car.sale.cnic || "N/A"} />
              <DetailRow label="Payment Type" value={car.sale.paymentType || "N/A"} />
              {car.sale.fullPaymentAmount !== undefined && (
                <DetailRow
                  label="Full Payment Amount"
                  value={formatMoneyOrNA(car.sale.fullPaymentAmount)}
                />
              )}
              {car.sale.advancePayment !== undefined && (
                <DetailRow
                  label="Advance Payment"
                  value={formatMoneyOrNA(car.sale.advancePayment)}
                />
              )}
              {car.sale.monthlyInstalment !== undefined && (
                <DetailRow
                  label="Monthly Instalment"
                  value={formatMoneyOrNA(car.sale.monthlyInstalment)}
                />
              )}
              {car.sale.instalmentDate && (
                <DetailRow label="Instalment Date" value={formatDate(car.sale.instalmentDate)} />
              )}
              <DetailRow label="Sale Date" value={formatDate(car.sale.saleDate)} />
              {car.sale.status && (
                <DetailRow label="Status" value={<StatusBadge status={car.sale.status} />} />
              )}
            </DetailCard>
          ) : (
            <div className="card-soft">
              <EmptyState
                title="This car is not sold yet"
                description="Sale details will show here once the vehicle is sold to a customer."
                action={
                  <Button asChild className="rounded-xl">
                    <Link to="/cars/$id/edit" params={{ id: car._id }}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Add Sale Details
                    </Link>
                  </Button>
                }
              />
            </div>
          )}
        </TabsContent>

        {/* ================================================================ */}
        {/* ===== NEW INVOICE TAB – with overlay form and store info ===== */}
        <TabsContent value="invoice">
          {!invoiceSale ? (
            <div className="card-soft no-print">
              <EmptyState
                title="No sale record found"
                description="This car hasn't been sold yet. Complete a sale to generate an invoice."
                action={
                  <Button asChild className="rounded-xl">
                    <Link to="/cars/$id/edit" params={{ id: car._id }}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Add Sale Details
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mx-auto max-w-3xl print-only" id="invoice-print-area">
              {/* Print button – hidden during print */}
              <div className="mb-4 flex justify-end gap-2 print:hidden no-print">
                <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
              </div>

              {/* Custom Invoice Component */}
              <div className="card-soft overflow-hidden rounded-2xl border border-border/50">
                <CustomInvoice
                  data={{
                    sale: invoiceSale,
                    car: car,
                    buyer: {
                      name: invoiceSale.buyerName,
                      fatherName: invoiceSale.buyerFatherName,
                      address: invoiceSale.buyerAddress,
                      phone: invoiceSale.buyerPhone,
                      cnic: invoiceSale.buyerCnic,
                    },
                    seller: {
                      name: invoiceSale.sellerSnapshot?.name || car.userName,
                      phone: invoiceSale.sellerSnapshot?.phone || car.userPhone,
                      cnic: invoiceSale.sellerSnapshot?.cnic || car.userCnic,
                      address: invoiceSale.sellerSnapshot?.address || car.userAddress,
                    },
                    payment: {
                      type: invoiceSale.paymentType,
                      fullPaymentAmount: invoiceSale.fullPaymentAmount,
                      advancePayment: invoiceSale.advancePayment,
                      instalmentDate: invoiceSale.instalmentDate,
                      monthlyInstalment: invoiceSale.monthlyInstalment,
                    },
                    saleDate: invoiceSale.saleDate,
                    invoiceNumber: `INV-${invoiceSale._id?.slice(-6)}`,
                  }}
                />
              </div>
            </div>
          )}
        </TabsContent>
        {/* ================================================================ */}
      </Tabs>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          .print\\:hidden { display: none !important; }
          .card-soft { border: 1px solid #ddd !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
