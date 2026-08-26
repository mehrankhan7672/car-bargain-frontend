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
import { Car, User, CreditCard, DollarSign, Loader2, CheckCircle2, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { saleService } from "../../services/saleService";

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
  carType: string;
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

const COPY = {
  en: {
    pageTitle: "New Sale",
    pageSubtitle: "Record a new car sale transaction",
    languageLabel: "Form Language",
    selectCarTitle: "Select Car",
    availableCars: "Available Cars",
    loadingCars: "Loading cars...",
    selectCarPlaceholder: "Select a car to sell",
    noCarsFound: "No available cars found",
    carLabel: "Car",
    yearLabel: "Year",
    registrationLabel: "Registration",
    salePriceLabel: "Sale Price",
    buyerInfoTitle: "Buyer Information",
    buyerName: "Buyer Name",
    buyerNamePlaceholder: "Enter buyer name",
    fatherName: "Father's Name",
    fatherNamePlaceholder: "Enter father's name",
    phone: "Phone Number",
    phonePlaceholder: "0300-1234567",
    cnic: "CNIC Number",
    cnicPlaceholder: "1234567890123",
    address: "Full Address",
    addressPlaceholder: "Enter complete address",
    paymentTitle: "Payment Details",
    paymentType: "Payment Type",
    paymentTypePlaceholder: "Select payment type",
    fullPayment: "Full Payment",
    instalment: "Instalment",
    paymentAmount: "Payment Amount",
    paymentAmountPlaceholder: "Enter full payment amount",
    totalPrice: "Total Price",
    advancePayment: "Advance Payment",
    advancePaymentPlaceholder: "Enter advance payment",
    nextInstalmentDate: "Next Instalment Date",
    processing: "Processing...",
    completedRedirecting: "Sale Completed - Redirecting to Invoice...",
    completeSale: "Complete Sale",
    na: "N/A",
  },
  ur: {
    pageTitle: "نئی فروخت",
    pageSubtitle: "نئی گاڑی کی فروخت کا اندراج کریں",
    languageLabel: "فارم کی زبان",
    selectCarTitle: "گاڑی منتخب کریں",
    availableCars: "دستیاب گاڑیاں",
    loadingCars: "گاڑیاں لوڈ ہو رہی ہیں...",
    selectCarPlaceholder: "فروخت کے لیے گاڑی منتخب کریں",
    noCarsFound: "کوئی دستیاب گاڑی نہیں ملی",
    carLabel: "گاڑی",
    yearLabel: "سال",
    registrationLabel: "رجسٹریشن",
    salePriceLabel: "فروخت قیمت",
    buyerInfoTitle: "خریدار کی معلومات",
    buyerName: "خریدار کا نام",
    buyerNamePlaceholder: "خریدار کا نام درج کریں",
    fatherName: "والد کا نام",
    fatherNamePlaceholder: "والد کا نام درج کریں",
    phone: "فون نمبر",
    phonePlaceholder: "0300-1234567",
    cnic: "شناختی کارڈ نمبر",
    cnicPlaceholder: "1234567890123",
    address: "مکمل پتہ",
    addressPlaceholder: "مکمل پتہ درج کریں",
    paymentTitle: "ادائیگی کی تفصیلات",
    paymentType: "ادائیگی کی قسم",
    paymentTypePlaceholder: "ادائیگی کی قسم منتخب کریں",
    fullPayment: "مکمل ادائیگی",
    instalment: "قسط وار",
    paymentAmount: "ادائیگی کی رقم",
    paymentAmountPlaceholder: "مکمل ادائیگی کی رقم درج کریں",
    totalPrice: "کل قیمت",
    advancePayment: "پیشگی رقم",
    advancePaymentPlaceholder: "پیشگی رقم درج کریں",
    nextInstalmentDate: "اگلی قسط کی تاریخ",
    processing: "کارروائی جاری ہے...",
    completedRedirecting: "فروخت مکمل ہوگئی - رسید کی طرف جا رہے ہیں...",
    completeSale: "فروخت مکمل کریں",
    na: "دستیاب نہیں",
  },
} as const;

function SalesPage() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [language, setLanguage] = useState<"en" | "ur">("en");

  const t = COPY[language];
  const isUrdu = language === "ur";
  const textFieldDir = isUrdu ? "rtl" : "ltr";
  const textFieldAlign = isUrdu ? "text-right" : "text-left";

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
      form.setValue("fullPaymentAmount", car.salePrice.toString());
    }
  };

  const onSubmit = async (data: SalesFormData) => {
    if (!selectedCar) {
      toast.error("Please select a car first");
      return;
    }

    try {
      setLoading(true);

      const apiPayload = {
        carId: selectedCar._id,
        buyerName: data.buyerName,
        buyerFatherName: data.fatherName,
        buyerAddress: data.address,
        buyerPhone: data.phone,
        buyerCnic: data.cnic,
        paymentType: data.paymentType,
        ...(data.paymentType === "Full Payment" && {
          fullPaymentAmount: parseFloat(data.fullPaymentAmount || "0"),
        }),
        ...(data.paymentType === "Instalment" && {
          advancePayment: parseFloat(data.advancePayment || "0"),
          instalmentDate: data.instalmentDate,
          monthlyInstalment: 0,
        }),
        saleDate: new Date().toISOString(),
        formLanguage: language,
      };

      const response = await saleService.create(apiPayload);
      const savedSale = response.data;

      const invoiceData = {
        saleId: savedSale._id,
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
            monthlyInstalment: 0,
          }),
        },
        saleDate: savedSale.saleDate,
        formLanguage: language,
      };

      setSaleCompleted(true);

      toast.success("Sale recorded successfully!", {
        description: `${selectedCar.company} ${selectedCar.model} has been sold.`,
      });

      navigate({ to: "/sales/invoice", state: invoiceData });
    } catch (error: any) {
      console.error("Error creating sale:", error);
      toast.error("Failed to complete sale", {
        description: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCarDisplayName = (car: Car) => {
    const regNumber = car.carType === "CP (Custom Paid)" ? car.registrationNumber : car.localNumber;
    return `${car.company} ${car.model} (${car.year}) - ${regNumber || t.na}`;
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      <PageHeader title={t.pageTitle} subtitle={t.pageSubtitle} />

      <div className="card-soft mb-6 flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t.languageLabel}</span>
        </div>
        <div className="inline-flex rounded-xl border border-border p-1">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              !isUrdu ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage("ur")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              isUrdu ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            اردو
          </button>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          dir={isUrdu ? "rtl" : "ltr"}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5" />
                {t.selectCarTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="carId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.availableCars}</FormLabel>
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
                            placeholder={carsLoading ? t.loadingCars : t.selectCarPlaceholder}
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
                            {t.noCarsFound}
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
                      <p className="text-sm text-muted-foreground">{t.carLabel}</p>
                      <p className="font-medium">
                        {selectedCar.company} {selectedCar.model}
                        {selectedCar.variant && ` (${selectedCar.variant})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.yearLabel}</p>
                      <p className="font-medium">{selectedCar.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.registrationLabel}</p>
                      <p className="font-medium">
                        {selectedCar.carType === "CP (Custom Paid)"
                          ? selectedCar.registrationNumber
                          : selectedCar.localNumber || t.na}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.salePriceLabel}</p>
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
                {t.buyerInfoTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.buyerName}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.buyerNamePlaceholder}
                        {...field}
                        dir={textFieldDir}
                        className={cn("h-11 rounded-xl", textFieldAlign)}
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
                    <FormLabel>{t.fatherName}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.fatherNamePlaceholder}
                        {...field}
                        dir={textFieldDir}
                        className={cn("h-11 rounded-xl", textFieldAlign)}
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
                    <FormLabel>{t.phone}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.phonePlaceholder}
                        {...field}
                        dir="ltr"
                        className="h-11 rounded-xl text-left"
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
                    <FormLabel>{t.cnic}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.cnicPlaceholder}
                        {...field}
                        dir="ltr"
                        className="h-11 rounded-xl text-left"
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
                    <FormLabel>{t.address}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t.addressPlaceholder}
                        {...field}
                        dir={textFieldDir}
                        className={cn("h-11 rounded-xl", textFieldAlign)}
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
                {t.paymentTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.paymentType}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={saleCompleted}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder={t.paymentTypePlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Full Payment">{t.fullPayment}</SelectItem>
                        <SelectItem value="Instalment">{t.instalment}</SelectItem>
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
                        <FormLabel>{t.paymentAmount}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t.paymentAmountPlaceholder}
                            {...field}
                            dir="ltr"
                            className="h-11 rounded-xl text-left"
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
                      <p className="text-sm text-muted-foreground">{t.totalPrice}</p>
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
                        <FormLabel>{t.advancePayment}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t.advancePaymentPlaceholder}
                            {...field}
                            dir="ltr"
                            className="h-11 rounded-xl text-left"
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
                        <FormLabel>{t.nextInstalmentDate}</FormLabel>
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
                {t.processing}
              </>
            ) : saleCompleted ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {t.completedRedirecting}
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5 mr-2" />
                {t.completeSale}
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
