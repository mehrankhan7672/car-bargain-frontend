import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { dealers, exchanges } from "@/data/dummy";

export const Route = createFileRoute("/dealers/$id/")({
  head: () => ({
    meta: [
      { title: "Dealer Details — Car Bargain Manager" },
      { name: "description", content: "Dealer profile with contact details and related exchange deals." },
      { property: "og:title", content: "Dealer Details — Car Bargain Manager" },
      { property: "og:description", content: "See dealer contact information and his deals." },
    ],
  }),
  component: ViewDealer,
});

function ViewDealer() {
  const { id } = useParams({ from: "/dealers/$id/" });
  const dealer = dealers.find((d) => d.id === id);
  if (!dealer) return <EmptyState title="Dealer not found" />;

  const deals = exchanges.filter((e) => e.dealer1 === dealer.name || e.dealer2 === dealer.name);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title={dealer.name}
        subtitle={dealer.id}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/dealers">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/dealers/$id/edit" params={{ id: dealer.id }}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
          </>
        }
      />
      <div className="space-y-4">
        <DetailCard title="Dealer Information">
          <DetailRow label="Dealer Name" value={dealer.name} />
          <DetailRow label="Contact Number" value={dealer.phone} />
          <DetailRow label="CNIC" value={dealer.cnic} />
          <DetailRow label="Address" value={dealer.address} />
          <DetailRow label="Notes" value={dealer.notes || "—"} />
        </DetailCard>

        <div className="card-soft p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Exchange Deals
          </h3>
          {deals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exchange deal with this dealer yet.</p>
          ) : (
            <ul className="space-y-3">
              {deals.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{d.customerName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.customerVehicle} → {d.newVehicle}
                    </p>
                  </div>
                  <Link
                    to="/exchanges/$id"
                    params={{ id: d.id }}
                    className="text-sm font-semibold text-gold hover:underline"
                  >
                    View deal
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
