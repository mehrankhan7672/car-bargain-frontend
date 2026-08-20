// routes/sales/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { carService } from "@/services/carService";
import { Car, User, CreditCard, DollarSign, Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/sales/")({
  component: SalesPage,
});

const salesSchema = z.object({
  carId: z.string().min(1, "Please select a car"),
  buyerName: z.string().min(1, "Buyer name is required"),
  fatherName: z.string().min(1, "Father name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  cnic: z.string().min(13, "CNIC must be 13 digits").max(13, "CNIC must be 13 digits"),
  paymentType: z.enum(["Full Payment", "Instalment"]),
  fullPaymentAmount: z.string().optional(),
  advancePayment: z.string().optional(),
  instalmentDate: z.string().optional(),
});

type SalesFormData = z.infer<typeof salesSchema>;

// Loosely typed on purpose — `[key: string]: any` means whatever your
// backend actually sends (today or after you add engine#/chassis#/CC/
// address later) is preserved. We only declare the fields we rely on
// directly in this file's own UI (dropdown label, price defaults, etc).
interface Car {
  _id: string;
  userName: string;
  userPhone: string;
  dealerName?: string;
  company: string;
  model: string;
  variant?: string;
  year: number;
  localNumber?: string;
  registrationNumber?: string;
  color: string;
  condition: string;
  carType: string; // "NCP (Non-Custom Paid)" | "CP (Custom Paid)"
  salePrice: number;
  status: string;
  images: string[];
  [key: string]: any;
}

const formatPKR = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

function SalesPage() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);
  const [saleCompleted, setSaleCompleted] = useState(false);

  const form = useForm<SalesFormData>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      paymentType: "Full Payment",
      fullPaymentAmount: "",
      advancePayment: "",
      instalmentDate: "",
    },
  });

  const paymentType = form.watch("paymentType");

  useEffect(() => {
    fetchAvailableCars();
  }, []);

  const fetchAvailableCars = async () => {
    try {
      setCarsLoading(true);
      const response = await carService.getAll({ status: "Available", limit: 100 });
      if (response.success) {
        setCars(response.data);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Failed to load cars");
    } finally {
      setCarsLoading(false);
    }
  };

  const handleCarSelect = (carId: string) => {
    const car = cars.find((c) => c._id === carId);
    setSelectedCar(car || null);
    form.setValue("carId", carId);

    if (car) {
      console.log("Selected car — full raw object from API:", car);
      console.table(car);
      form.setValue("fullPaymentAmount", car.salePrice.toString());
    }
  };

  const onSubmit = async (data: SalesFormData) => {
    try {
      setLoading(true);

      const saleDataToSave = {
        carId: data.carId,
        buyerName: data.buyerName,
        fatherName: data.fatherName,
        address: data.address,
        phone: data.phone,
        cnic: data.cnic,
        paymentType: data.paymentType,
        ...(data.paymentType === "Full Payment" && {
          fullPaymentAmount: parseFloat(data.fullPaymentAmount || "0"),
        }),
        ...(data.paymentType === "Instalment" && {
          advancePayment: parseFloat(data.advancePayment || "0"),
          instalmentDate: data.instalmentDate,
        }),
        saleDate: new Date().toISOString(),
      };

      // TODO: replace with real API call
      // const response = await salesService.create(saleDataToSave);

      // Pass the ENTIRE selected car through as-is. Whatever fields your
      // /api/cars response has today (or gains later — address, engine#,
      // chassis#, CC) show up on the invoice automatically. No manual
      // field-picking here to keep in sync.
      const invoiceData = {
        car: { ...selectedCar },
        buyer: {
          name: data.buyerName,
          fatherName: data.fatherName,
          address: data.address,
          phone: data.phone,
          cnic: data.cnic,
        },
        payment: {
          type: data.paymentType,
          ...(data.paymentType === "Full Payment" && {
            amount: parseFloat(data.fullPaymentAmount || "0"),
          }),
          ...(data.paymentType === "Instalment" && {
            advancePayment: parseFloat(data.advancePayment || "0"),
            instalmentDate: data.instalmentDate,
            monthlyInstalment: 0, // placeholder — not collected on this form yet
          }),
        },
        saleDate: new Date().toISOString(),
      };

      setSaleCompleted(true);

      toast.success("Sale recorded successfully!", {
        description: `${selectedCar?.company} ${selectedCar?.model} has been sold.`,
      });

      navigate({ to: "/sales/invoice", state: invoiceData });
    } catch (error: any) {
      console.error("Error creating sale:", error);
      toast.error("Failed to complete sale", {
        description: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCarDisplayName = (car: Car) => {
    const regNumber = car.carType === "CP (Custom Paid)" ? car.registrationNumber : car.localNumber;
    return `${car.company} ${car.model} (${car.year}) - ${regNumber || "N/A"}`;
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      <PageHeader title="New Sale" subtitle="Record a new car sale transaction" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5" />
                Select Car
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="carId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Cars</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCarSelect(value);
                      }}
                      value={field.value}
                      disabled={carsLoading || saleCompleted}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue
                            placeholder={carsLoading ? "Loading cars..." : "Select a car to sell"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cars.map((car) => (
                          <SelectItem key={car._id} value={car._id}>
                            {getCarDisplayName(car)}
                          </SelectItem>
                        ))}
                        {cars.length === 0 && !carsLoading && (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            No available cars found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedCar && !saleCompleted && (
                <div className="mt-4 rounded-lg border p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Car</p>
                      <p className="font-medium">
                        {selectedCar.company} {selectedCar.model}
                        {selectedCar.variant && ` (${selectedCar.variant})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium">{selectedCar.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Registration</p>
                      <p className="font-medium">
                        {selectedCar.carType === "CP (Custom Paid)"
                          ? selectedCar.registrationNumber
                          : selectedCar.localNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sale Price</p>
                      <p className="font-medium text-green-600">
                        {formatPKR(selectedCar.salePrice)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Buyer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter buyer name"
                        {...field}
                        className="h-11 rounded-xl"
                        disabled={saleCompleted}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter father's name"
                        {...field}
                        className="h-11 rounded-xl"
                        disabled={saleCompleted}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0300-1234567"
                        {...field}
                        className="h-11 rounded-xl"
                        disabled={saleCompleted}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNIC Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234567890123"
                        {...field}
                        className="h-11 rounded-xl"
                        disabled={saleCompleted}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter complete address"
                        {...field}
                        className="h-11 rounded-xl"
                        disabled={saleCompleted}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={saleCompleted}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Full Payment">Full Payment</SelectItem>
                        <SelectItem value="Instalment">Instalment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentType === "Full Payment" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullPaymentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter full payment amount"
                            {...field}
                            className="h-11 rounded-xl"
                            value={field.value || selectedCar?.salePrice || ""}
                            disabled={saleCompleted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end">
                    <div className="w-full rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">Total Price</p>
                      <p className="font-semibold">{formatPKR(selectedCar?.salePrice || 0)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="advancePayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advance Payment</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter advance payment"
                            {...field}
                            className="h-11 rounded-xl"
                            disabled={saleCompleted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instalmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Instalment Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-11 rounded-xl"
                            min={new Date().toISOString().split("T")[0]}
                            disabled={saleCompleted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full rounded-xl py-6 text-base"
            disabled={loading || !selectedCar || saleCompleted}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : saleCompleted ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Sale Completed - Redirecting to Invoice...
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5 mr-2" />
                Complete Sale
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
