import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { exchangeFields } from "@/data/field-configs";

export const Route = createFileRoute("/exchanges/new")({
  head: () => ({
    meta: [
      { title: "Add Exchange — Car Bargain Manager" },
      { name: "description", content: "Create a new car exchange deal with customer, dealers and cash adjustment." },
      { property: "og:title", content: "Add Exchange — Car Bargain Manager" },
      { property: "og:description", content: "Record a vehicle exchange between customer and dealers." },
    ],
  }),
  component: AddExchange,
});

function AddExchange() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Add Exchange" subtitle="Enter customer, vehicle and dealer details" />
      <EntityForm
        fields={exchangeFields}
        backTo="/exchanges"
        submitLabel="Save Exchange"
        successMessage="Exchange added"
        defaultValues={{
          customerName: "",
          cnic: "",
          phone: "",
          address: "",
          customerVehicle: "",
          newVehicle: "",
          dealer1: "",
          dealer2: "",
          cashAdjustment: "",
          finalAmount: "",
          date: "",
          status: "Pending",
        }}
      />
    </div>
  );
}
