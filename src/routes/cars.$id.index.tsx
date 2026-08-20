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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PrintableDocument } from "@/components/shared/PrintableDocument";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { carService } from "@/services/carService";
import { getImageUrl } from "@/lib/image-url";
import { Skeleton } from "@/components/ui/skeleton";

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

function ViewCar() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

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

  // carType decides which of registrationNumber/registrationCity vs.
  // localNumber is actually relevant to show — a CP car has no localNumber
  // and an NCP car has no registrationNumber/registrationCity.
  const isRegisteredCar = car.carType === "CP (Custom Paid)";

  // FIX: exchangeCarId now comes back from the backend as a populated
  // object (company/model/variant/year/color/salePrice/status), not just a
  // raw ID string — see validateExchangeCarId/populate() in
  // CarController.js. Detect that shape here so the JSX below can safely
  // render its fields, and so a plain string/ObjectId (e.g. any older data
  // saved before this feature existed) doesn't crash the page.
  const exchangeCar =
    car.exchangeCarId && typeof car.exchangeCarId === "object" ? car.exchangeCarId : null;

  // FIX: `amount ? formatPKR(amount) : "N/A"` treated a genuine 0 as
  // falsy and displayed "N/A" instead of "PKR 0". This helper only
  // falls back to "N/A" for null/undefined, not for 0.
  const formatMoneyOrNA = (amount: number | null | undefined) =>
    amount !== null && amount !== undefined ? formatPKR(amount) : "N/A";

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

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            {/* Image Gallery */}
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

            {/* Car Information */}
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

          {/* Owner Information */}
          <div className="grid gap-4 lg:grid-cols-2">
            <DetailCard title="Owner Information">
              <DetailRow label="Full Name" value={car.userName} />
              {/* FIX: dealerName was captured on the schema/list view but
                  never shown here — useful to confirm which dealer record
                  this car is actually linked to, separate from the
                  free-text userName. */}
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

          {/* Pricing Information */}
          <DetailCard title="Pricing Information">
            <DetailRow
              label="Sale Price"
              value={car.salePrice ? formatPKR(car.salePrice) : "N/A"}
            />
            <DetailRow label="Transaction Type" value={car.transactionType} />
            {car.transactionType === "Exchange with Bargain" && (
              <>
                <DetailRow label="Exchange Type" value={car.exchangeType || "N/A"} />
                {/* FIX: was `amount ? ... : "N/A"`, which showed "N/A" for
                    a real 0 amount. Now only falls back for null/undefined. */}
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
                {/* FIX: only fall back to the plain text description when
                    there's no actual linked car record to show instead. */}
                {!exchangeCar && (
                  <DetailRow label="Exchange Car Details" value={car.exchangeCarDetails || "N/A"} />
                )}
              </>
            )}
          </DetailCard>

          {/* FIX: new section — the backend now populates exchangeCarId
              with the full linked car's data (see getCarById/getAllCars in
              CarController.js), but this page never rendered any of it.
              Shows the actual traded-in vehicle with a direct link to its
              own detail page, instead of just the frozen text snapshot in
              exchangeCarDetails. */}
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

          {/* Description & Notes */}
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

        <TabsContent value="sale">
          {car.sale ? (
            <DetailCard title="Sale Details">
              <DetailRow label="Customer Name" value={car.sale.customerName} />
              <DetailRow label="CNIC" value={car.sale.cnic} />
              <DetailRow label="Phone" value={car.sale.phone} />
              <DetailRow label="Address" value={car.sale.address} />
              <DetailRow label="Sale Price" value={formatPKR(car.sale.salePrice)} />
              <DetailRow label="Sale Date" value={car.sale.saleDate} />
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

        <TabsContent value="invoice">
          <PrintableDocument
            docType="Invoice"
            docNo={`INV-${car._id?.slice(-6)}`}
            date={car.sale?.saleDate ?? new Date().toISOString().slice(0, 10)}
            customer={[
              { label: "Name", value: car.sale?.customerName ?? "Walk-in Customer" },
              { label: "CNIC", value: car.sale?.cnic ?? "—" },
              { label: "Phone", value: car.sale?.phone ?? "—" },
              { label: "Address", value: car.sale?.address ?? "—" },
            ]}
            details={[
              { label: "Vehicle", value: `${car.company} ${car.model}` },
              { label: "Year", value: String(car.year) },
              {
                label: isRegisteredCar ? "Registration Number" : "Local Number",
                value: isRegisteredCar ? car.registrationNumber : car.localNumber || "N/A",
              },
              { label: "Color", value: car.color },
              { label: "Condition", value: car.condition },
              { label: "Variant", value: car.variant || "N/A" },
            ]}
            amount={car.sale?.salePrice ?? car.salePrice}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
