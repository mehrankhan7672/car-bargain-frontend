import { useState, useEffect } from "react";
import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DealerForm, type DealerFormValues } from "@/components/shared/DealerForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { dealerService } from "@/services/dealerService";

interface Dealer {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  cnic: string;
  address: string;
  notes?: string;
  formLanguage?: "en" | "ur";
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
      setDealer({ ...response.data, id: response.data.id ?? response.data._id });
    } catch (error: any) {
      console.error("Error fetching dealer:", error);
      setError(error.response?.data?.message || "Failed to load dealer");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: DealerFormValues) => {
    try {
      await dealerService.update(id, data);
      toast.success("Dealer updated successfully", {
        description: `${data.name} has been updated.`,
      });
      navigate({ to: "/dealers" });
    } catch (error: any) {
      console.error("Error updating dealer:", error);

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
      <DealerForm
        mode="edit"
        submitLabel="Update Dealer"
        onSubmit={handleSubmit}
        defaultValues={{
          name: dealer.name,
          phone: dealer.phone,
          cnic: dealer.cnic,
          address: dealer.address,
          notes: dealer.notes || "",
          formLanguage: dealer.formLanguage || "en",
        }}
      />
    </div>
  );
}
