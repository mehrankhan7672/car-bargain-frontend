import { Printer, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { business, formatPKR } from "@/data/dummy";

export type DocumentRow = { label: string; value: string };

export function PrintableDocument({
  docType = "Invoice",
  docNo,
  date,
  customer,
  details,
  amountLabel = "Total Amount",
  amount,
  footerNote = "Thank you for your business. Please keep this document for your record.",
}: {
  docType?: string;
  docNo: string;
  date: string;
  customer: DocumentRow[];
  details: DocumentRow[];
  amountLabel?: string;
  amount: number;
  footerNote?: string;
}) {
  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap justify-end gap-2">
        <Button variant="outline" className="rounded-xl" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button
          className="rounded-xl"
          onClick={() =>
            toast.success("PDF download started", {
              description: "Demo only — no file is generated.",
            })
          }
        >
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      <div className="card-soft print-area mx-auto max-w-3xl overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-gold-soft/50 p-6">
          <Logo size="lg" tone="dark" />
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-display text-lg font-bold uppercase tracking-widest text-foreground">
              {docType}
            </p>
            <p className="mt-1">{docNo}</p>
            <p>{date}</p>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Business Details
            </p>
            <p className="font-semibold">{business.name}</p>
            <p className="text-sm text-muted-foreground">{business.address}</p>
            <p className="text-sm text-muted-foreground">{business.phone}</p>
            <p className="text-sm text-muted-foreground">{business.email}</p>
            <p className="text-sm text-muted-foreground">{business.ntn}</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Customer Details
            </p>
            {customer.map((r) => (
              <p key={r.label} className="text-sm">
                <span className="text-muted-foreground">{r.label}: </span>
                <span className="font-medium">{r.value}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/70">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs uppercase tracking-wider">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody>
                {details.map((d) => (
                  <tr key={d.label} className="border-t border-border">
                    <td className="px-4 py-2.5 text-muted-foreground">{d.label}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{d.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-gold/40 bg-gold-soft/60 px-4 py-3">
            <span className="text-sm font-semibold uppercase tracking-wide">{amountLabel}</span>
            <span className="font-display text-xl font-bold">{formatPKR(amount)}</span>
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-sm text-xs text-muted-foreground">{footerNote}</p>
            <div className="text-center">
              <div className="h-10 w-44 border-b border-dashed border-border" />
              <p className="mt-1 text-xs text-muted-foreground">Authorised Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
