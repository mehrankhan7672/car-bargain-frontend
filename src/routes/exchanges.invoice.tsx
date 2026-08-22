// routes/exchanges.invoice.tsx
import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import formTemplate from "@/assets/exchange-receipt-form.png";

export const Route = createFileRoute("/exchanges/invoice")({
  component: ExchangeInvoicePage,
});

const formatPKR = (amount?: number | null) =>
  !amount ? "" : new Intl.NumberFormat("en-PK").format(amount);

const formatDate = (date: string | Date | null) => {
  if (!date) return "";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// Percentages measured against the 427x629 template image
// (src/assets/exchange-receipt-form.png). Same technique as
// sales/invoice.tsx: FIELDS holds a rough first pass — nudge top/left/width
// by 1-2% at a time while previewing in the browser until each value sits
// on its printed line. Treat this exactly like that file was tuned.
type FieldPos = {
  top: number;
  left: number;
  width: number;
  align?: "left" | "right" | "center";
  fontSize?: string;
  fontWeight?: number;
};

const FIELDS = {
  receiptNumber: { top: 17, left: 80, width: 16, align: "right" } as FieldPos,
  date: { top: 17, left: 5, width: 24, align: "right" } as FieldPos,

  // ---- First party (Showroom / Dealer side) ----
  showroomNameFather: { top: 19.8, left: 5, width: 52, align: "right" } as FieldPos,
  showroomAddress: { top: 23, left: 5, width: 68, align: "right" } as FieldPos,

  showroomCarCompanyModel: { top: 26.2, left: 65, width: 30, align: "right" } as FieldPos,
  showroomCarRegNumber: { top: 26.2, left: 32, width: 30, align: "right" } as FieldPos,
  showroomCarYear: { top: 26.2, left: 5, width: 24, align: "right" } as FieldPos,

  showroomChassisNumber: { top: 29.5, left: 5, width: 68, align: "right" } as FieldPos,

  showroomColor: { top: 32.5, left: 40, width: 30, align: "right" } as FieldPos,

  showroomPrice: { top: 35.7, left: 5, width: 68, align: "right" } as FieldPos,

  // ---- Second party (Customer side) ----
  customerNameFather: { top: 40.3, left: 5, width: 52, align: "right" } as FieldPos,
  customerAddress: { top: 43.5, left: 5, width: 68, align: "right" } as FieldPos,

  customerCarCompanyModel: { top: 46.7, left: 65, width: 30, align: "right" } as FieldPos,
  customerCarRegNumber: { top: 46.7, left: 32, width: 30, align: "right" } as FieldPos,
  customerCarYear: { top: 46.7, left: 5, width: 24, align: "right" } as FieldPos,

  customerChassisNumber: { top: 50, left: 5, width: 68, align: "right" } as FieldPos,

  customerColor: { top: 53, left: 40, width: 30, align: "right" } as FieldPos,

  customerPrice: { top: 56.2, left: 5, width: 68, align: "right" } as FieldPos,

  // "بینامہ" row — settlement / difference amount between the two vehicles
  settlement: { top: 59.3, left: 5, width: 68, align: "right" } as FieldPos,
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
        fontSize: pos.fontSize || "clamp(7px, 1.4vw, 14px)",
        fontWeight: pos.fontWeight || 700,
        color: "#111",
        lineHeight: 1,
      }}
    >
      {value}
    </span>
  );
};

function ExchangeInvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  useEffect(() => {
    if (!state || !state.exchange) {
      toast.error("No receipt data found", {
        description: "Please open this receipt from a completed exchange.",
      });
    }
  }, [state]);

  if (!state || !state.exchange) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4">
        <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileWarning className="h-16 w-16 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">
              No Receipt Data Available
            </h3>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
              Please open this receipt from a completed exchange.
            </p>
            <Button className="mt-6 rounded-xl" onClick={() => navigate({ to: "/exchanges" })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Exchanges
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ex = state.exchange;
  const showroomCar = ex.showroomCar || {};
  const customerCar = ex.customerCar || {};

  const showroomRegNumber =
    showroomCar.carType === "CP (Custom Paid)"
      ? showroomCar.registrationNumber
      : showroomCar.localNumber;
  const customerRegNumber =
    customerCar.carType === "CP (Custom Paid)"
      ? customerCar.registrationNumber
      : customerCar.localNumber;

  const settlementText =
    ex.finalDirection === "showroom_pays_customer"
      ? `Showroom pays customer: PKR ${formatPKR(ex.finalAmount)}`
      : ex.finalDirection === "customer_pays_showroom"
        ? `Customer pays showroom: PKR ${formatPKR(ex.finalAmount)}`
        : "Head-to-Head — no cash exchanged";

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => navigate({ to: "/exchanges" })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button className="rounded-xl" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <div className="relative mx-auto w-full" style={{ aspectRatio: "427 / 629" }}>
        <img
          src={formTemplate}
          alt="Exchange receipt form"
          className="absolute inset-0 h-full w-full select-none"
          draggable={false}
        />

        <F pos={FIELDS.receiptNumber} value={ex.dealNumber} ltr />
        <F pos={FIELDS.date} value={formatDate(ex.date)} ltr />

        {/* First party — Showroom / Dealer side */}
        <F
          pos={FIELDS.showroomNameFather}
          value={showroomCar.dealerName || showroomCar.sellerName}
        />
        <F pos={FIELDS.showroomAddress} value={showroomCar.sellerAddress} />
        <F
          pos={FIELDS.showroomCarCompanyModel}
          value={[showroomCar.company, showroomCar.model].filter(Boolean).join(" ")}
        />
        <F pos={FIELDS.showroomCarRegNumber} value={showroomRegNumber} ltr />
        <F
          pos={FIELDS.showroomCarYear}
          value={showroomCar.year ? String(showroomCar.year) : ""}
          ltr
        />
        <F pos={FIELDS.showroomChassisNumber} value={showroomCar.chassisNumber} ltr />
        <F pos={FIELDS.showroomColor} value={showroomCar.condition} />
        <F pos={FIELDS.showroomPrice} value={formatPKR(showroomCar.value)} ltr />

        {/* Second party — Customer side */}
        <F pos={FIELDS.customerNameFather} value={ex.customerName} />
        <F pos={FIELDS.customerAddress} value={ex.customerAddress} />
        <F
          pos={FIELDS.customerCarCompanyModel}
          value={[customerCar.company, customerCar.model].filter(Boolean).join(" ")}
        />
        <F pos={FIELDS.customerCarRegNumber} value={customerRegNumber} ltr />
        <F
          pos={FIELDS.customerCarYear}
          value={customerCar.year ? String(customerCar.year) : ""}
          ltr
        />
        <F pos={FIELDS.customerChassisNumber} value={customerCar.chassisNumber} ltr />
        <F pos={FIELDS.customerColor} value={customerCar.condition} />
        <F pos={FIELDS.customerPrice} value={formatPKR(customerCar.value)} ltr />

        {/* Settlement / difference amount — the one row this form has that
            the sale form doesn't, since only exchanges have a difference. */}
        <F pos={FIELDS.settlement} value={settlementText} />

        {/* Everything below this point (the Note box + witness/signature
            grid) is intentionally left untouched — no data fields are
            rendered over it, per your request. Those stay blank on print
            for hand-filling. */}
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
