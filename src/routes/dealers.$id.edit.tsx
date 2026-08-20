import { useState, useEffect } from "react";
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { dealerFields, dealerSteps } from "@/data/field-configs";
import { dealerService } from "@/services/dealerService";

interface Dealer {
  id: string;
  _id?: string; // FIX: backend returns Mongo's _id — normalized into id below
  name: string;
  phone: string;
  cnic: string;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDealer();
  }, [id]);

  const fetchDealer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dealerService.getById(id);
      // FIX: normalize _id -> id for consistency with the rest of the app,
      // even though this page itself only reads dealer.name below.
      setDealer({ ...response.data, id: response.data.id ?? response.data._id });
    } catch (error: any) {
      console.error("Error fetching dealer:", error);
      setError(error.response?.data?.message || "Failed to load dealer");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await dealerService.update(id, data);
      toast.success("Dealer updated successfully", {
        description: `${data.name} has been updated.`,
      });
      navigate({ to: "/dealers" });
    } catch (error: any) {
      console.error("Error updating dealer:", error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors;
        toast.error(errorMessages[0] || "Validation error", {
          description: errorMessages.slice(1).join(", "),
          duration: 5000,
        });
      } else if (error.response?.data?.message) {
        toast.error("Failed to update dealer", {
          description: error.response.data.message,
        });
      } else {
        toast.error("Failed to update dealer", {
          description: "Please check your input and try again",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader title="Edit Dealer" subtitle="Loading..." />
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading dealer information...</div>
        </div>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader title="Edit Dealer" subtitle="Error" />
        <EmptyState
          title={error || "Dealer not found"}
          action={
            // FIX: Link wasn't imported at all before — this crashed the
            // page with "Link is not defined" any time the fetch failed.
            <Button asChild variant="outline">
              <Link to="/dealers">Back to Dealers</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Edit Dealer" subtitle={dealer.name} />
      <EntityForm
        fields={dealerFields}
        steps={dealerSteps}
        entityLabel="Dealer"
        backTo="/dealers"
        submitLabel="Update Dealer"
        successMessage="Dealer updated"
        defaultValues={{
          name: dealer.name,
          phone: dealer.phone,
          cnic: dealer.cnic,
          address: dealer.address,
          notes: dealer.notes || "",
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
