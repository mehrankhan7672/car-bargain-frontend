import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { PrintableDocument } from "@/components/shared/PrintableDocument";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cars } from "@/data/dummy";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Billing — Car Bargain Manager" },
      {
        name: "description",
        content: "Create and print a car sale invoice with business logo and customer details.",
      },
      { property: "og:title", content: "Billing — Car Bargain Manager" },
      { property: "og:description", content: "Printable invoices for every vehicle sale." },
    ],
  }),
  component: Billing,
});

function Billing() {
  const soldCars = cars.filter((c) => c.sale);
  const [selected, setSelected] = useState(soldCars[0]?.id ?? cars[0]!.id);
  const car = cars.find((c) => c.id === selected)!;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Billing"
        subtitle="Choose a car and print the invoice"
        actions={
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="h-11 w-[260px] rounded-xl">
              <SelectValue placeholder="Choose car" />
            </SelectTrigger>
            <SelectContent>
              {cars.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.model} · {c.regNo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
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
    </div>
  );
}
