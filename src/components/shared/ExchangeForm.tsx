import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeftRight, Scale, HandCoins, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarStockCombobox, type StockCar } from "@/components/shared/CarStockCombobox";
import { exchangeService } from "@/services/exchangeService";
import { formatPKR } from "@/data/dummy";

export type AdjustmentRow = {
  label: string;
  type: "Discount" | "Extra Charge" | "Negotiation";
  amount: number;
};
export type CarType = "NCP (Non-Custom Paid)" | "CP (Custom Paid)";
export type VehicleSource = "stock" | "manual";
export type OwnerFields = { name: string; cnic: string; phone: string; address: string };

export type ExchangeFormValues = {
  showroomCar: {
    source: VehicleSource;
    carId: string | null;
    company: string;
    model: string;
    year: number | string;
    registrationNumber: string;
    carType: CarType | "";
    registrationCity: string;
    localNumber: string;
    chassisNumber: string;
    mileage: number | string;
    condition: string;
    actualValue: number | string;
    salePrice: number | string;
    value: number | string;
    dealerName: string; // stock only — display label
    owner: OwnerFields; // dealer (stock, read-only) OR Customer 1 (manual, editable)
  };
  customerCar: {
    company: string;
    model: string;
    year: number | string;
    carType: CarType;
    registrationNumber: string;
    registrationCity: string;
    localNumber: string;
    chassisNumber: string;
    mileage: number | string;
    condition: string;
    actualValue: number | string;
    value: number | string;
    owner: OwnerFields; // the customer, or Customer 2 in manual mode
  };
  amountReceivedFromCustomer: number | string;
  amountPaidToCustomer: number | string;
  adjustments: AdjustmentRow[];
  notes: string;
  date: string;
  status: "Pending" | "Completed" | "Cancelled";
};

const emptyOwner: OwnerFields = { name: "", cnic: "", phone: "", address: "" };

const emptyValues: ExchangeFormValues = {
  showroomCar: {
    source: "stock",
    carId: "",
    company: "",
    model: "",
    year: "",
    registrationNumber: "",
    carType: "NCP (Non-Custom Paid)",
    registrationCity: "",
    localNumber: "",
    chassisNumber: "",
    mileage: "",
    condition: "Used",
    actualValue: "",
    salePrice: "",
    value: "",
    dealerName: "",
    owner: { ...emptyOwner },
  },
  customerCar: {
    company: "",
    model: "",
    year: "",
    carType: "NCP (Non-Custom Paid)",
    registrationNumber: "",
    registrationCity: "",
    localNumber: "",
    chassisNumber: "",
    mileage: "",
    condition: "Used",
    actualValue: "",
    value: "",
    owner: { ...emptyOwner },
  },
  amountReceivedFromCustomer: "",
  amountPaidToCustomer: "",
  adjustments: [],
  notes: "",
  date: new Date().toISOString().slice(0, 10),
  status: "Pending",
};

function computeDeal(showroomValue: number, customerValue: number, adjustments: AdjustmentRow[]) {
  const D = customerValue - showroomValue;

  let exchangeType: "Head-to-Head" | "Car + Money Giving" | "Car + Money Getting" = "Head-to-Head";
  let settlementDirection: "none" | "showroom_pays_customer" | "customer_pays_showroom" = "none";
  let settlementAmount = 0;

  if (D > 0) {
    exchangeType = "Car + Money Giving";
    settlementDirection = "showroom_pays_customer";
    settlementAmount = D;
  } else if (D < 0) {
    exchangeType = "Car + Money Getting";
    settlementDirection = "customer_pays_showroom";
    settlementAmount = Math.abs(D);
  }

  const adjustmentTotal = adjustments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  let final = settlementAmount + adjustmentTotal;
  let finalDirection = settlementDirection;

  if (final < 0) {
    finalDirection =
      finalDirection === "showroom_pays_customer"
        ? "customer_pays_showroom"
        : finalDirection === "customer_pays_showroom"
          ? "showroom_pays_customer"
          : "none";
    final = Math.abs(final);
  }
  if (final === 0) finalDirection = "none";

  return {
    D,
    exchangeType,
    settlementDirection,
    settlementAmount,
    adjustmentTotal,
    finalAmount: final,
    finalDirection,
  };
}

export function ExchangeForm({
  mode,
  exchangeId,
  defaultValues,
}: {
  mode: "new" | "edit";
  exchangeId?: string;
  defaultValues?: Partial<ExchangeFormValues>;
}) {
  const navigate = useNavigate();
  const [values, setValues] = useState<ExchangeFormValues>({
    ...emptyValues,
    ...defaultValues,
    showroomCar: {
      ...emptyValues.showroomCar,
      ...defaultValues?.showroomCar,
      owner: { ...emptyOwner, ...defaultValues?.showroomCar?.owner },
    },
    customerCar: {
      ...emptyValues.customerCar,
      ...defaultValues?.customerCar,
      owner: { ...emptyOwner, ...defaultValues?.customerCar?.owner },
    },
  });
  const [submitting, setSubmitting] = useState(false);

  const isStockSource = values.showroomCar.source !== "manual";
  const showroomValue = Number(values.showroomCar.value) || 0;
  const customerValue = Number(values.customerCar.value) || 0;
  const salePrice = Number(values.showroomCar.salePrice) || 0;
  const valueExceedsSalePrice = isStockSource && salePrice > 0 && showroomValue > salePrice;

  const deal = useMemo(
    () => computeDeal(showroomValue, customerValue, values.adjustments),
    [showroomValue, customerValue, values.adjustments],
  );

  const customerOwes = deal.finalDirection === "customer_pays_showroom";
  const amountOwed = customerOwes ? deal.finalAmount : 0;
  const amountReceived = Number(values.amountReceivedFromCustomer) || 0;
  const dueAmount = customerOwes ? Math.max(0, amountOwed - amountReceived) : 0;

  const showroomOwes = deal.finalDirection === "showroom_pays_customer";
  const amountOwedByShowroom = showroomOwes ? deal.finalAmount : 0;
  const amountPaidToCustomer = Number(values.amountPaidToCustomer) || 0;
  const dueFromShowroom = showroomOwes
    ? Math.max(0, amountOwedByShowroom - amountPaidToCustomer)
    : 0;

  const showroomSectionTitle = isStockSource ? "1. Showroom Vehicle" : "1. Customer 1's Vehicle";
  const customerSectionTitle = isStockSource ? "2. Customer Vehicle" : "2. Customer 2's Vehicle";
  const showroomValueLabel = isStockSource ? "Showroom-Side Value" : "Customer 1 Value";
  const customerValueLabel = isStockSource ? "Customer Value" : "Customer 2 Value";

  const setVehicleSource = (source: VehicleSource) => {
    setValues((v) => ({
      ...v,
      showroomCar: {
        ...emptyValues.showroomCar,
        source,
        carId: source === "manual" ? null : "",
      },
      amountPaidToCustomer: "",
    }));
  };

  const setShowroomCar = (car: StockCar) => {
    const c = car as any;
    setValues((v) => ({
      ...v,
      showroomCar: {
        ...v.showroomCar,
        source: "stock",
        carId: car._id,
        company: car.company,
        model: car.model,
        year: car.year,
        registrationNumber: car.registrationNumber || car.localNumber || "",
        ...(c.carType && { carType: c.carType }),
        registrationCity: c.registrationCity || "",
        localNumber: c.localNumber || "",
        salePrice: c.salePrice || "",
        value: v.showroomCar.value || c.salePrice || "",
        dealerName: c.dealerName || "",
        owner: {
          name: c.dealerName || c.userName || "",
          cnic: c.userCnic || "",
          phone: c.userPhone || "",
          address: c.userAddress || "",
        },
      },
    }));
  };

  const updateShowroomManual = (patch: Partial<ExchangeFormValues["showroomCar"]>) =>
    setValues((v) => ({ ...v, showroomCar: { ...v.showroomCar, ...patch } }));

  const updateShowroomOwner = (patch: Partial<OwnerFields>) =>
    setValues((v) => ({
      ...v,
      showroomCar: { ...v.showroomCar, owner: { ...v.showroomCar.owner, ...patch } },
    }));

  const updateCustomerCar = (patch: Partial<ExchangeFormValues["customerCar"]>) =>
    setValues((v) => ({ ...v, customerCar: { ...v.customerCar, ...patch } }));

  const updateCustomerOwner = (patch: Partial<OwnerFields>) =>
    setValues((v) => ({
      ...v,
      customerCar: { ...v.customerCar, owner: { ...v.customerCar.owner, ...patch } },
    }));

  const addAdjustment = () =>
    setValues((v) => ({
      ...v,
      adjustments: [...v.adjustments, { label: "", type: "Negotiation", amount: 0 }],
    }));

  const updateAdjustment = (idx: number, patch: Partial<AdjustmentRow>) =>
    setValues((v) => ({
      ...v,
      adjustments: v.adjustments.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    }));

  const removeAdjustment = (idx: number) =>
    setValues((v) => ({ ...v, adjustments: v.adjustments.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isStockSource) {
      if (!values.customerCar.owner.name || !values.customerCar.owner.phone) {
        toast.error("Customer name and phone are required");
        return;
      }
      if (!values.showroomCar.carId) {
        toast.error("Please select a showroom vehicle from stock");
        return;
      }
      if (!showroomValue) {
        toast.error("Please enter the showroom vehicle's agreed value");
        return;
      }
      if (valueExceedsSalePrice) {
        toast.error(`Agreed value cannot exceed the sale price (${formatPKR(salePrice)})`);
        return;
      }
    } else {
      if (!values.showroomCar.owner.name || !values.showroomCar.owner.phone) {
        toast.error("Customer 1 name and phone are required");
        return;
      }
      if (!values.customerCar.owner.name || !values.customerCar.owner.phone) {
        toast.error("Customer 2 name and phone are required");
        return;
      }
      if (!values.showroomCar.company || !values.showroomCar.model) {
        toast.error("Please enter Customer 1's vehicle make and model");
        return;
      }
      if (!showroomValue) {
        toast.error("Please enter Customer 1's vehicle agreed value");
        return;
      }
      const carType1 = values.showroomCar.carType || "NCP (Non-Custom Paid)";
      if (carType1 === "CP (Custom Paid)" && !values.showroomCar.registrationCity) {
        toast.error("Please enter the registration city for Customer 1's CP vehicle");
        return;
      }
    }

    if (!values.customerCar.company || !values.customerCar.model) {
      toast.error("Please enter the customer vehicle's make and model");
      return;
    }
    if (!customerValue) {
      toast.error("Please enter the customer vehicle's agreed value");
      return;
    }
    if (values.customerCar.carType === "CP (Custom Paid)" && !values.customerCar.registrationCity) {
      toast.error("Please enter the registration city for a custom-paid (CP) vehicle");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        showroomCar: values.showroomCar,
        customerCar: values.customerCar,
        amountReceivedFromCustomer: values.amountReceivedFromCustomer,
        amountPaidToCustomer: values.amountPaidToCustomer,
        adjustments: values.adjustments,
        notes: values.notes,
        date: values.date,
        status: values.status,
      };

      if (mode === "new") {
        await exchangeService.create(payload);
        toast.success("Exchange added", { description: "Deal saved and inventory updated." });
      } else if (exchangeId) {
        await exchangeService.update(exchangeId, payload);
        toast.success("Exchange updated");
      }
      navigate({ to: "/exchanges" });
    } catch (error: any) {
      console.error("Save exchange error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save exchange deal. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const typeStyles: Record<string, { icon: typeof Scale; badge: string }> = {
    "Head-to-Head": { icon: Scale, badge: "bg-secondary text-secondary-foreground border-border" },
    "Car + Money Giving": {
      icon: HandCoins,
      badge: "bg-success/15 text-success border-success/30",
    },
    "Car + Money Getting": {
      icon: HandCoins,
      badge: "bg-gold-soft text-gold-foreground border-gold/40",
    },
  };
  const TypeIcon = typeStyles[deal.exchangeType].icon;

  const showroomCarSelected = isStockSource && !!values.showroomCar.carId;
  const customerCarType = values.customerCar.carType;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Showroom-side vehicle */}
      <Card className="card-soft border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">{showroomSectionTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Vehicle Source</Label>
            <Select
              value={values.showroomCar.source}
              onValueChange={(val) => setVehicleSource(val as VehicleSource)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">From Showroom Stock</SelectItem>
                <SelectItem value="manual">Another Customer's Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isStockSource ? (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Vehicle</Label>
                <CarStockCombobox
                  value={values.showroomCar.carId || ""}
                  onSelect={setShowroomCar}
                />
              </div>

              {showroomCarSelected && (
                <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-secondary/40 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Actual Sale Price
                    </p>
                    <p className="mt-1 font-display text-lg font-bold">
                      {salePrice ? formatPKR(salePrice) : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/40 p-3">
                    <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" /> Dealer / Seller
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {values.showroomCar.owner.name || "—"}
                    </p>
                    {values.showroomCar.owner.phone && (
                      <p className="text-xs text-muted-foreground">
                        {values.showroomCar.owner.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Agreed Value (PKR)</Label>
                <Input
                  type="number"
                  min={0}
                  max={salePrice || undefined}
                  value={values.showroomCar.value}
                  onChange={(e) => updateShowroomManual({ value: e.target.value })}
                  placeholder="4500000"
                  required
                  aria-invalid={valueExceedsSalePrice}
                  className={valueExceedsSalePrice ? "border-destructive" : undefined}
                />
                {valueExceedsSalePrice && (
                  <p className="text-xs text-destructive">
                    Agreed value cannot exceed the sale price ({formatPKR(salePrice)})
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Customer 1 Details */}
              <div className="sm:col-span-2 border-b border-border pb-4 mb-2">
                <h4 className="text-sm font-medium mb-2">Customer 1 Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input
                      value={values.showroomCar.owner.name}
                      onChange={(e) => updateShowroomOwner({ name: e.target.value })}
                      placeholder="Ali Hassan"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CNIC</Label>
                    <Input
                      value={values.showroomCar.owner.cnic}
                      onChange={(e) => updateShowroomOwner({ cnic: e.target.value })}
                      placeholder="35202-1234567-1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      value={values.showroomCar.owner.phone}
                      onChange={(e) => updateShowroomOwner({ phone: e.target.value })}
                      placeholder="+92 321 7654321"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Address</Label>
                    <Input
                      value={values.showroomCar.owner.address}
                      onChange={(e) => updateShowroomOwner({ address: e.target.value })}
                      placeholder="Model Town, Lahore"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle fields */}
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input
                  value={values.showroomCar.company}
                  onChange={(e) => updateShowroomManual({ company: e.target.value })}
                  placeholder="Toyota"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Model</Label>
                <Input
                  value={values.showroomCar.model}
                  onChange={(e) => updateShowroomManual({ model: e.target.value })}
                  placeholder="Corolla 2018"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={values.showroomCar.year}
                  onChange={(e) => updateShowroomManual({ year: e.target.value })}
                  placeholder="2018"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Papers Status</Label>
                <Select
                  value={values.showroomCar.carType || "NCP (Non-Custom Paid)"}
                  onValueChange={(val) =>
                    updateShowroomManual({
                      carType: val as CarType,
                      ...(val === "CP (Custom Paid)"
                        ? { localNumber: "" }
                        : { registrationNumber: "", registrationCity: "" }),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NCP (Non-Custom Paid)">NCP (Non-Custom Paid)</SelectItem>
                    <SelectItem value="CP (Custom Paid)">CP (Custom Paid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {values.showroomCar.carType === "CP (Custom Paid)" ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Registration Number</Label>
                    <Input
                      value={values.showroomCar.registrationNumber}
                      onChange={(e) => updateShowroomManual({ registrationNumber: e.target.value })}
                      placeholder="LEB-1234"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Registration City</Label>
                    <Input
                      value={values.showroomCar.registrationCity}
                      onChange={(e) => updateShowroomManual({ registrationCity: e.target.value })}
                      placeholder="Lahore"
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <Label>Local Number (optional)</Label>
                  <Input
                    value={values.showroomCar.localNumber}
                    onChange={(e) => updateShowroomManual({ localNumber: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Chassis Number</Label>
                <Input
                  value={values.showroomCar.chassisNumber}
                  onChange={(e) => updateShowroomManual({ chassisNumber: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mileage (km)</Label>
                <Input
                  type="number"
                  value={values.showroomCar.mileage}
                  onChange={(e) => updateShowroomManual({ mileage: e.target.value })}
                  placeholder="65000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Condition</Label>
                <Select
                  value={values.showroomCar.condition}
                  onValueChange={(val) => updateShowroomManual({ condition: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                    <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Agreed Value (PKR)</Label>
                <Input
                  type="number"
                  min={0}
                  value={values.showroomCar.value}
                  onChange={(e) => updateShowroomManual({ value: e.target.value })}
                  placeholder="4000000"
                  required
                />
              </div>

              {!isStockSource && showroomOwes && (
                <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Amount Customer 1 Pays Now (PKR)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={amountOwedByShowroom}
                      value={values.amountPaidToCustomer}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, amountPaidToCustomer: e.target.value }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Due from Customer 1</Label>
                    <div className="flex h-9 items-center rounded-xl border border-border bg-secondary/40 px-3 text-sm font-semibold">
                      {formatPKR(dueFromShowroom)}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Customer Vehicle (always second) */}
      <Card className="card-soft border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">{customerSectionTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 border-b border-border pb-4 mb-2">
            <h4 className="text-sm font-medium mb-2">
              {isStockSource ? "Customer Details" : "Customer 2 Details"}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={values.customerCar.owner.name}
                  onChange={(e) => updateCustomerOwner({ name: e.target.value })}
                  placeholder={isStockSource ? "Imran Sheikh" : "Sara Khan"}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>CNIC</Label>
                <Input
                  value={values.customerCar.owner.cnic}
                  onChange={(e) => updateCustomerOwner({ cnic: e.target.value })}
                  placeholder="35202-4455667-1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={values.customerCar.owner.phone}
                  onChange={(e) => updateCustomerOwner({ phone: e.target.value })}
                  placeholder="+92 300 1231234"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input
                  value={values.customerCar.owner.address}
                  onChange={(e) => updateCustomerOwner({ address: e.target.value })}
                  placeholder="DHA Phase 5, Lahore"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input
              value={values.customerCar.company}
              onChange={(e) => updateCustomerCar({ company: e.target.value })}
              placeholder="Honda"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Model</Label>
            <Input
              value={values.customerCar.model}
              onChange={(e) => updateCustomerCar({ model: e.target.value })}
              placeholder="City 2016"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Input
              type="number"
              value={values.customerCar.year}
              onChange={(e) => updateCustomerCar({ year: e.target.value })}
              placeholder="2016"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Papers Status</Label>
            <Select
              value={customerCarType}
              onValueChange={(val) =>
                updateCustomerCar({
                  carType: val as CarType,
                  ...(val === "CP (Custom Paid)"
                    ? { localNumber: "" }
                    : { registrationNumber: "", registrationCity: "" }),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NCP (Non-Custom Paid)">NCP (Non-Custom Paid)</SelectItem>
                <SelectItem value="CP (Custom Paid)">CP (Custom Paid)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {customerCarType === "CP (Custom Paid)" ? (
            <>
              <div className="space-y-1.5">
                <Label>Registration Number</Label>
                <Input
                  value={values.customerCar.registrationNumber}
                  onChange={(e) => updateCustomerCar({ registrationNumber: e.target.value })}
                  placeholder="LEB-1234"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Registration City</Label>
                <Input
                  value={values.customerCar.registrationCity}
                  onChange={(e) => updateCustomerCar({ registrationCity: e.target.value })}
                  placeholder="Lahore"
                  required
                />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label>Local Number (optional)</Label>
              <Input
                value={values.customerCar.localNumber}
                onChange={(e) => updateCustomerCar({ localNumber: e.target.value })}
                placeholder="Optional"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Chassis Number</Label>
            <Input
              value={values.customerCar.chassisNumber}
              onChange={(e) => updateCustomerCar({ chassisNumber: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Mileage (km)</Label>
            <Input
              type="number"
              value={values.customerCar.mileage}
              onChange={(e) => updateCustomerCar({ mileage: e.target.value })}
              placeholder="65000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Select
              value={values.customerCar.condition}
              onValueChange={(val) => updateCustomerCar({ condition: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
                <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Agreed Value (PKR)</Label>
            <Input
              type="number"
              min={0}
              value={values.customerCar.value}
              onChange={(e) => updateCustomerCar({ value: e.target.value })}
              placeholder="4000000"
              required
            />
          </div>

          {customerOwes && (
            <>
              <div className="space-y-1.5">
                <Label>
                  {isStockSource
                    ? "Amount Customer Gives Now (PKR)"
                    : "Amount Customer 2 Gives Now (PKR)"}
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={amountOwed}
                  value={values.amountReceivedFromCustomer}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, amountReceivedFromCustomer: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due</Label>
                <div className="flex h-9 items-center rounded-xl border border-border bg-secondary/40 px-3 text-sm font-semibold">
                  {formatPKR(dueAmount)}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 3: System Calculates Difference */}
      <Card className="card-soft overflow-hidden border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">3. System Calculates Difference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {showroomValueLabel}
              </p>
              <p className="mt-1 font-display text-lg font-bold">{formatPKR(showroomValue)}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {customerValueLabel}
              </p>
              <p className="mt-1 font-display text-lg font-bold">{formatPKR(customerValue)}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Difference (D)
              </p>
              <p className="mt-1 font-display text-lg font-bold">{formatPKR(Math.abs(deal.D))}</p>
              <p className="text-xs text-muted-foreground">
                {deal.D > 0
                  ? `Customer vehicle is higher by ${formatPKR(deal.D)}`
                  : deal.D < 0
                    ? `Showroom vehicle is higher by ${formatPKR(Math.abs(deal.D))}`
                    : "Values are equal"}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${typeStyles[deal.exchangeType].badge}`}
          >
            <div className="flex items-center gap-2">
              <TypeIcon className="h-5 w-5" />
              <div>
                <p className="font-semibold">{deal.exchangeType}</p>
                <p className="text-xs opacity-80">
                  {deal.settlementDirection === "none" && "No money involved"}
                  {deal.settlementDirection === "showroom_pays_customer" &&
                    (isStockSource
                      ? `Showroom side pays customer ${formatPKR(deal.settlementAmount)}`
                      : `Customer 1 pays Customer 2 ${formatPKR(deal.settlementAmount)}`)}
                  {deal.settlementDirection === "customer_pays_showroom" &&
                    (isStockSource
                      ? `Customer pays showroom side ${formatPKR(deal.settlementAmount)}`
                      : `Customer 2 pays Customer 1 ${formatPKR(deal.settlementAmount)}`)}
                </p>
              </div>
            </div>
            <ArrowLeftRight className="h-5 w-5 opacity-60" />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Apply Adjustments */}
      <Card className="card-soft border-0 shadow-none">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">4. Apply Adjustments (If Any)</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            onClick={addAdjustment}
          >
            <Plus className="h-4 w-4" /> Add Adjustment
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {values.adjustments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No discounts, extra charges, or negotiation adjustments added.
            </p>
          )}
          {values.adjustments.map((adj, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
              <Input
                value={adj.label}
                onChange={(e) => updateAdjustment(idx, { label: e.target.value })}
                placeholder="e.g. Negotiated discount"
              />
              <Select
                value={adj.type}
                onValueChange={(val) =>
                  updateAdjustment(idx, { type: val as AdjustmentRow["type"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Discount">Discount</SelectItem>
                  <SelectItem value="Extra Charge">Extra Charge</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={adj.amount}
                onChange={(e) => updateAdjustment(idx, { amount: Number(e.target.value) })}
                placeholder="Amount (± PKR)"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-lg text-destructive"
                onClick={() => removeAdjustment(idx)}
                aria-label="Remove adjustment"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Tip: enter Discounts as negative amounts and Extra Charges as positive amounts.
          </p>
        </CardContent>
      </Card>

      {/* Section 5: Final Cash Amount & Settlement */}
      <Card className="card-soft border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">5. Final Cash Amount & Settlement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-gold-soft/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide">Final Amount</p>
              <p className="text-xs text-muted-foreground">
                {deal.finalDirection === "none" && "No cash exchanged"}
                {deal.finalDirection === "showroom_pays_customer" &&
                  (isStockSource ? "Showroom side pays customer" : "Customer 1 pays Customer 2")}
                {deal.finalDirection === "customer_pays_showroom" &&
                  (isStockSource ? "Customer pays showroom side" : "Customer 2 pays Customer 1")}
              </p>
            </div>
            <span className="font-display text-2xl font-bold">{formatPKR(deal.finalAmount)}</span>
          </div>

          {showroomOwes && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>
                  {isStockSource
                    ? "Amount Paid by Showroom Now (PKR)"
                    : "Amount Customer 1 Pays Now (PKR)"}
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={amountOwedByShowroom}
                  value={values.amountPaidToCustomer}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, amountPaidToCustomer: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Remaining Due</Label>
                <div className="flex h-9 items-center rounded-xl border border-border bg-secondary/40 px-3 text-sm font-semibold">
                  {formatPKR(dueFromShowroom)}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Exchange Date</Label>
              <Input
                type="date"
                value={values.date}
                onChange={(e) => setValues((v) => ({ ...v, date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(val) => setValues((v) => ({ ...v, status: val as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={values.notes}
              onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
              placeholder="Any additional notes about this exchange..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => navigate({ to: "/exchanges" })}
        >
          Cancel
        </Button>
        <Button type="submit" className="rounded-xl" disabled={submitting}>
          {submitting ? "Saving..." : mode === "new" ? "Save Exchange" : "Update Exchange"}
        </Button>
      </div>
    </form>
  );
}
