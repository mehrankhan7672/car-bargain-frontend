import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { dealerFields, dealerSteps } from "@/data/field-configs";
import { dealerService } from "@/services/dealerService";

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
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      await dealerService.create(data);
      toast.success("Dealer added successfully", {
        description: `${data.name} has been added to your dealer directory.`,
      });
      navigate({ to: "/dealers" });
    } catch (error: any) {
      console.error("Error creating dealer:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors;
        toast.error(errorMessages[0] || "Validation error", {
          description: errorMessages.slice(1).join(", "),
          duration: 5000,
        });
      } else if (error.response?.data?.message) {
        toast.error("Failed to add dealer", {
          description: error.response.data.message,
        });
      } else {
        toast.error("Failed to add dealer", {
          description: "Please check your input and try again",
        });
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Add Dealer" subtitle="Enter the dealer contact details" />
      <EntityForm
        fields={dealerFields}
        steps={dealerSteps}
        entityLabel="Dealer"
        backTo="/dealers"
        submitLabel="Save Dealer"
        successMessage="Dealer added"
        defaultValues={{
          name: "",
          phone: "",
          cnic: "",
          address: "",
          notes: "",
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
