import { createFileRoute, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { dealerFields } from "@/data/field-configs";
import { dealers } from "@/data/dummy";

export const Route = createFileRoute("/dealers/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Dealer — Car Bargain Manager" },
      { name: "description", content: "Update dealer contact number, CNIC, address and notes." },
      { property: "og:title", content: "Edit Dealer — Car Bargain Manager" },
      { property: "og:description", content: "Change the saved dealer information." },
    ],
  }),
  component: EditDealer,
});

function EditDealer() {
  const { id } = useParams({ from: "/dealers/$id/edit" });
  const dealer = dealers.find((d) => d.id === id);
  if (!dealer) return <EmptyState title="Dealer not found" />;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Edit Dealer" subtitle={dealer.name} />
      <EntityForm
        fields={dealerFields}
        backTo="/dealers"
        submitLabel="Update Dealer"
        successMessage="Dealer updated"
        defaultValues={{
          name: dealer.name,
          phone: dealer.phone,
          cnic: dealer.cnic,
          address: dealer.address,
          notes: dealer.notes,
        }}
      />
    </div>
  );
}
