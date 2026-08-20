// routes/sales/invoice.tsx
import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import formTemplate from "@/assets/sale-agreement-form.png";

export const Route = createFileRoute("/sales/invoice")({
  component: InvoicePage,
});

const formatPKR = (amount: number) =>
  !amount ? "" : new Intl.NumberFormat("en-PK").format(amount);

const formatDate = (date: string | Date | null) => {
  if (!date) return "";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// Months + days between today and a target date, e.g. "2 months 10 days".
// Returns "" if the target date is invalid or already passed.
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

// Percentages measured against the 517x744 template image.
// fontSize / fontWeight are optional per-field overrides — leave them off
// to use the global default set in the <F> component below.
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
  // One combined line across سکنہ/تحصیل/ضلع — not split into 3 pieces.
  buyerAddress: { top: 28.9, left: -75, width: 100, align: "right" } as FieldPos,

  carCompany: { top: 32.9, left: 57.4, width: 30.4, align: "right" } as FieldPos,
  carModel: { top: 32.9, left: 12, width: 30.1, align: "right" } as FieldPos,
  carRegNumber: { top: 32.9, left: 33.2, width: 30.4, align: "right" } as FieldPos,
  carEngineNumber: { top: 32.9, left: -22, width: 40, align: "right" } as FieldPos,

  carChassisNumber: { top: 37.1, left: 28.3, width: 50.6, align: "right" } as FieldPos,
  carColor: { top: 37.1, left: 10.4, width: 30.5, align: "right" } as FieldPos,
  carEngineCC: { top: 37.1, left: -15, width: 30.7, align: "right" } as FieldPos,

  // Row 1: total price / half of total
  totalPrice: { top: 41, left: 35.3, width: 46.6, align: "right" } as FieldPos,
  halfPrice: { top: 41, left: 18.4, width: 20.7, align: "right" } as FieldPos,

  // Row 2: amount received (full or advance) / remaining balance
  amountReceived: { top: 45.5, left: 50.3, width: 30.1, align: "right" } as FieldPos,
  remaining: { top: 45.2, left: 4, width: 24.3, align: "right" } as FieldPos,

  // Row 3: instalment deadline — split into date and duration so each can
  // be nudged independently. Both start at the old `deadline` coordinates.
  deadlineDate: { top: 48.7, left: 33, width: 30, align: "right" } as FieldPos,
  deadlineDuration: { top: 48.7, left: 52, width: 40, align: "right" } as FieldPos,
  monthlyInstalment: { top: 48.7, left: 8.4, width: 14.7, align: "right" } as FieldPos,
};

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

function InvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  useEffect(() => {
    if (!state || !state.car) {
      toast.error("No invoice data found", {
        description: "Please complete a sale first to generate an invoice.",
      });
    }
  }, [state]);

  if (!state || !state.car) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4">
        <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileWarning className="h-16 w-16 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">
              No Invoice Data Available
            </h3>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
              Please complete a sale from the sales page to generate an invoice.
            </p>
            <Button className="mt-6 rounded-xl" onClick={() => navigate({ to: "/sales" })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Sales
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { car = {}, buyer = {}, payment = {}, saleDate = new Date().toISOString() } = state;

  const isRegisteredCar = car?.carType === "CP (Custom Paid)";
  const regNumber = isRegisteredCar ? car?.registrationNumber : car?.localNumber;

  const totalPrice = car?.salePrice || 0;
  const halfPrice = totalPrice / 2;
  const isFull = payment?.type === "Full Payment";

  // --- Price section logic ---
  const amountReceived = isFull ? totalPrice : payment?.advancePayment || 0;
  const remaining = isFull ? null : Math.max(totalPrice - amountReceived, 0);

  let deadlineDateDisplay: string | null = null;
  let deadlineDurationDisplay: string | null = null;
  let monthlyInstalmentDisplay: string | null = null;

  if (isFull) {
    deadlineDateDisplay = "-";
    deadlineDurationDisplay = "-";
    monthlyInstalmentDisplay = "-";
  } else if (payment?.instalmentDate) {
    deadlineDateDisplay = formatDate(payment.instalmentDate);
    const dur = monthsAndDaysUntil(payment.instalmentDate);
    deadlineDurationDisplay = dur || "-";
    monthlyInstalmentDisplay = String(payment?.monthlyInstalment ?? 0);
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <Button variant="outline" className="rounded-xl" onClick={() => navigate({ to: "/sales" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button className="rounded-xl" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <div className="relative mx-auto w-full" style={{ aspectRatio: "517 / 744" }}>
        <img
          src={formTemplate}
          alt="Sale agreement form"
          className="absolute inset-0 h-full w-full select-none"
          draggable={false}
        />

        <F pos={FIELDS.date} value={formatDate(saleDate)} ltr />

        <F pos={FIELDS.sellerName} value={car?.dealerName || car?.userName} />
        <F pos={FIELDS.sellerAddress} value={car?.userAddress} />

        <F pos={FIELDS.buyerName} value={buyer?.name} />
        <F pos={FIELDS.buyerFather} value={buyer?.fatherName} />
        <F pos={FIELDS.buyerAddress} value={buyer?.address} />

        <F pos={FIELDS.carCompany} value={car?.company} />
        <F pos={FIELDS.carRegNumber} value={regNumber} ltr />
        <F pos={FIELDS.carModel} value={car?.year ? String(car.year) : ""} ltr />
        <F pos={FIELDS.carEngineNumber} value={car?.engineNumber} ltr />

        <F pos={FIELDS.carChassisNumber} value={car?.chassisNumber} ltr />
        <F pos={FIELDS.carColor} value={car?.color} />
        <F pos={FIELDS.carEngineCC} value={car?.engineCC ? `${car.engineCC}` : ""} ltr />

        <F pos={FIELDS.totalPrice} value={formatPKR(totalPrice)} ltr />
        <F pos={FIELDS.halfPrice} value={formatPKR(halfPrice)} ltr />

        <F pos={FIELDS.amountReceived} value={formatPKR(amountReceived)} ltr />
        <F pos={FIELDS.remaining} value={remaining === null ? "-" : formatPKR(remaining)} ltr />

        <F pos={FIELDS.deadlineDate} value={deadlineDateDisplay} ltr />
        <F pos={FIELDS.deadlineDuration} value={deadlineDurationDisplay} ltr />
        <F pos={FIELDS.monthlyInstalment} value={monthlyInstalmentDisplay} ltr />
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
