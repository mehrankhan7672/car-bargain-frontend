import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PrintableDocument } from "@/components/shared/PrintableDocument";
import { exchanges, formatPKR } from "@/data/dummy";

export const Route = createFileRoute("/exchanges/$id/")({
  head: () => ({
    meta: [
      { title: "Exchange Details — Car Bargain Manager" },
      { name: "description", content: "Exchange deal detail with dealers, vehicles and printable receipt." },
      { property: "og:title", content: "Exchange Details — Car Bargain Manager" },
      { property: "og:description", content: "See full exchange information and print the receipt." },
    ],
  }),
  component: ViewExchange,
});

function ViewExchange() {
  const { id } = useParams({ from: "/exchanges/$id/" });
  const ex = exchanges.find((e) => e.id === id);

  if (!ex) return <EmptyState title="Exchange not found" description="This deal is no longer in the record." />;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title={`Exchange ${ex.id}`}
        subtitle={`${ex.customerName} · ${ex.date}`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/exchanges">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/exchanges/$id/edit" params={{ id: ex.id }}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
          </>
        }
      />

      <Tabs defaultValue="details">
        <TabsList className="mb-4 rounded-xl">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="receipt">Receipt</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <DetailCard title="Customer Details">
            <DetailRow label="Customer Name" value={ex.customerName} />
            <DetailRow label="CNIC" value={ex.cnic} />
            <DetailRow label="Phone" value={ex.phone} />
            <DetailRow label="Address" value={ex.address} />
          </DetailCard>
          <DetailCard title="Exchange Details">
            <DetailRow label="Customer Vehicle" value={ex.customerVehicle} />
            <DetailRow label="New Vehicle" value={ex.newVehicle} />
            <DetailRow label="Dealer 1" value={ex.dealer1} />
            <DetailRow label="Dealer 2" value={ex.dealer2} />
            <DetailRow label="Cash Adjustment" value={formatPKR(ex.cashAdjustment)} />
            <DetailRow label="Final Amount" value={formatPKR(ex.finalAmount)} />
            <DetailRow label="Date" value={ex.date} />
            <DetailRow label="Status" value={<StatusBadge status={ex.status} />} />
          </DetailCard>
        </TabsContent>

        <TabsContent value="receipt">
          <PrintableDocument
            docType="Exchange Receipt"
            docNo={`RCP-${ex.id}`}
            date={ex.date}
            customer={[
              { label: "Name", value: ex.customerName },
              { label: "CNIC", value: ex.cnic },
              { label: "Phone", value: ex.phone },
              { label: "Address", value: ex.address },
            ]}
            details={[
              { label: "Customer Vehicle (given)", value: ex.customerVehicle },
              { label: "New Vehicle (taken)", value: ex.newVehicle },
              { label: "Dealer 1", value: ex.dealer1 },
              { label: "Dealer 2", value: ex.dealer2 },
              { label: "Cash Adjustment", value: formatPKR(ex.cashAdjustment) },
            ]}
            amountLabel="Final Amount"
            amount={ex.finalAmount}
            footerNote="Both parties agree to this exchange. Vehicle papers handed over after full payment."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
