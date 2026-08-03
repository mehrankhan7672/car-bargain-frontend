import { createFileRoute, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { exchangeFields } from "@/data/field-configs";
import { exchanges } from "@/data/dummy";

export const Route = createFileRoute("/exchanges/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Exchange — Car Bargain Manager" },
      { name: "description", content: "Update the vehicles, dealers and amounts of an exchange deal." },
      { property: "og:title", content: "Edit Exchange — Car Bargain Manager" },
      { property: "og:description", content: "Change saved exchange details." },
    ],
  }),
  component: EditExchange,
});

function EditExchange() {
  const { id } = useParams({ from: "/exchanges/$id/edit" });
  const ex = exchanges.find((e) => e.id === id);

  if (!ex) return <EmptyState title="Exchange not found" />;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Edit Exchange" subtitle={`${ex.id} · ${ex.customerName}`} />
      <EntityForm
        fields={exchangeFields}
        backTo="/exchanges"
        submitLabel="Update Exchange"
        successMessage="Exchange updated"
        defaultValues={{
          customerName: ex.customerName,
          cnic: ex.cnic,
          phone: ex.phone,
          address: ex.address,
          customerVehicle: ex.customerVehicle,
          newVehicle: ex.newVehicle,
          dealer1: ex.dealer1,
          dealer2: ex.dealer2,
          cashAdjustment: String(ex.cashAdjustment),
          finalAmount: String(ex.finalAmount),
          date: ex.date,
          status: ex.status,
        }}
      />
    </div>
  );
}
