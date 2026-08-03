import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PrintableDocument } from "@/components/shared/PrintableDocument";
import { cars, formatPKR } from "@/data/dummy";

export const Route = createFileRoute("/cars/$id/")({
  head: () => ({
    meta: [
      { title: "Car Details — Car Bargain Manager" },
      { name: "description", content: "Full car detail with photo gallery, sale record and printable invoice." },
      { property: "og:title", content: "Car Details — Car Bargain Manager" },
      { property: "og:description", content: "Vehicle information, sale details and invoice preview." },
    ],
  }),
  component: ViewCar,
});

function ViewCar() {
  const { id } = useParams({ from: "/cars/$id/" });
  const car = cars.find((c) => c.id === id);
  const [active, setActive] = useState(0);

  if (!car) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <EmptyState title="Car not found" description="This vehicle is not in the record anymore." />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title={`${car.name} ${car.model}`}
        subtitle={`${car.year} · ${car.regNo}`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/cars">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/cars/$id/edit" params={{ id: car.id }}>
                <Pencil className="h-4 w-4" /> Edit Car
              </Link>
            </Button>
          </>
        }
      />

      <Tabs defaultValue="details">
        <TabsList className="mb-4 rounded-xl">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="sale">Sale Details</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="card-soft overflow-hidden">
              <img
                src={car.images[active]}
                alt={`${car.name} ${car.model} photo ${active + 1}`}
                className="aspect-16/10 w-full object-cover"
              />
              <div className="flex gap-2 p-3">
                {car.images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActive(i)}
                    className={`h-14 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                      i === active ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Show photo ${i + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <DetailCard title="Vehicle Information">
              <DetailRow label="Car Name" value={car.name} />
              <DetailRow label="Model" value={car.model} />
              <DetailRow label="Year" value={car.year} />
              <DetailRow label="Registration Number" value={car.regNo} />
              <DetailRow label="Color" value={car.color} />
              <DetailRow label="Condition" value={car.condition} />
              <DetailRow label="Price" value={formatPKR(car.price)} />
              <DetailRow label="Status" value={<StatusBadge status={car.status} />} />
            </DetailCard>
          </div>
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
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoice">
          <PrintableDocument
            docType="Invoice"
            docNo={`INV-${car.id}`}
            date={car.sale?.saleDate ?? new Date().toISOString().slice(0, 10)}
            customer={[
              { label: "Name", value: car.sale?.customerName ?? "Walk-in Customer" },
              { label: "CNIC", value: car.sale?.cnic ?? "—" },
              { label: "Phone", value: car.sale?.phone ?? "—" },
              { label: "Address", value: car.sale?.address ?? "—" },
            ]}
            details={[
              { label: "Vehicle", value: `${car.name} ${car.model}` },
              { label: "Year", value: String(car.year) },
              { label: "Registration Number", value: car.regNo },
              { label: "Color", value: car.color },
              { label: "Condition", value: car.condition },
            ]}
            amount={car.sale?.salePrice ?? car.price}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
