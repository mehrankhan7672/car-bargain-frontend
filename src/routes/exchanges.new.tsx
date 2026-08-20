import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { ExchangeForm } from "@/components/shared/ExchangeForm";

export const Route = createFileRoute("/exchanges/new")({
  head: () => ({
    meta: [
      { title: "Add Exchange — Car Bargain Manager" },
      {
        name: "description",
        content:
          "Create a new car exchange deal: select a showroom vehicle and a customer vehicle, and let the system calculate the settlement.",
      },
      { property: "og:title", content: "Add Exchange — Car Bargain Manager" },
      {
        property: "og:description",
        content: "Record a vehicle exchange between the showroom and a customer.",
      },
    ],
  }),
  component: AddExchange,
});

function AddExchange() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Add Exchange"
        subtitle="Select showroom & customer vehicles — the settlement is calculated automatically"
      />
      <ExchangeForm mode="new" />
    </div>
  );
}
