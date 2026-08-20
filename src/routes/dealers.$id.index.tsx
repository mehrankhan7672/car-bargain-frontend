import { useState, useEffect } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { EmptyState } from "@/components/shared/EmptyState";
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

export const Route = createFileRoute("/dealers/$id/")({
  head: () => ({
    meta: [
      { title: "Dealer Details — Car Bargain Manager" },
      {
        name: "description",
        content: "Dealer profile with contact details and related exchange deals.",
      },
      { property: "og:title", content: "Dealer Details — Car Bargain Manager" },
      { property: "og:description", content: "See dealer contact information and his deals." },
    ],
  }),
  component: ViewDealer,
});

function ViewDealer() {
  const { id } = useParams({ from: "/dealers/$id/" });
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDealer();
    }
  }, [id]);

  const fetchDealer = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching dealer with ID:", id);

      const response = await dealerService.getById(id);
      console.log("Dealer response:", response);

      if (response && response.data) {
        // FIX: normalize _id -> id so the Edit button's link and the
        // "ID: ..." subtitle below don't render/link to "undefined".
        setDealer({ ...response.data, id: response.data.id ?? response.data._id });
      } else {
        setError("Dealer not found");
      }
    } catch (error: any) {
      console.error("Error fetching dealer:", error);

      // Check if it's a 404 error
      if (error.response?.status === 404) {
        setError("Dealer not found");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to load dealer. Please try again.");
      }

      toast.error("Failed to load dealer", {
        description: error.response?.data?.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader title="Dealer Details" subtitle="Loading..." />
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading dealer information...</div>
        </div>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader title="Dealer Details" subtitle="Error" />
        <EmptyState
          title={error || "Dealer not found"}
          description="Try a different search or add a new record."
          action={
            <div className="flex gap-3">
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/dealers">
                  <ArrowLeft className="h-4 w-4" /> Back to Dealers
                </Link>
              </Button>
              <Button onClick={fetchDealer} variant="default" className="rounded-xl">
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title={dealer.name}
        subtitle={`ID: ${dealer.id}`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/dealers">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/dealers/$id/edit" params={{ id: dealer.id }}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
          </>
        }
      />
      <div className="space-y-4">
        <DetailCard title="Dealer Information">
          <DetailRow label="Dealer Name" value={dealer.name} />
          <DetailRow label="Contact Number" value={dealer.phone} />
          <DetailRow label="CNIC" value={dealer.cnic} />
          <DetailRow label="Address" value={dealer.address} />
          <DetailRow label="Notes" value={dealer.notes || "—"} />
          <DetailRow label="Created At" value={new Date(dealer.createdAt).toLocaleDateString()} />
          <DetailRow label="Last Updated" value={new Date(dealer.updatedAt).toLocaleDateString()} />
        </DetailCard>
      </div>
    </div>
  );
}
