import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { dealerFields } from "@/data/field-configs";

export const Route = createFileRoute("/dealers/new")({
  head: () => ({
    meta: [
      { title: "Add Dealer — Car Bargain Manager" },
      { name: "description", content: "Save a new dealer with contact number, CNIC and address." },
      { property: "og:title", content: "Add Dealer — Car Bargain Manager" },
      { property: "og:description", content: "Add a partner dealer to your showroom directory." },
    ],
  }),
  component: AddDealer,
});

function AddDealer() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Add Dealer" subtitle="Enter the dealer contact details" />
      <EntityForm
        fields={dealerFields}
        backTo="/dealers"
        submitLabel="Save Dealer"
        successMessage="Dealer added"
        defaultValues={{ name: "", phone: "", cnic: "", address: "", notes: "" }}
      />
    </div>
  );
}
