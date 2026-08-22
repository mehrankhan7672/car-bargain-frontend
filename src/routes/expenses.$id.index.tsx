import { useEffect, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { expenseService } from "@/services/expenseService";
import { formatPKR } from "@/data/dummy";

export const Route = createFileRoute("/expenses/$id/")({
  head: () => ({
    meta: [
      { title: "Expense Details — Car Bargain Manager" },
      { name: "description", content: "Full detail of a single showroom expense entry." },
      { property: "og:title", content: "Expense Details — Car Bargain Manager" },
      { property: "og:description", content: "Category, amount, date and notes of this expense." },
    ],
  }),
  component: ViewExpense,
});

function ViewExpense() {
  const { id } = useParams({ from: "/expenses/$id/" });
  const [exp, setExp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expenseService
      .getById(id)
      .then((res) => setExp(res?.data))
      .catch((err) => {
        console.error("Failed to load expense:", err);
        toast.error("Failed to load expense", { description: err.message });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return null;
  if (!exp) return <EmptyState title="Expense not found" />;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title={exp.title}
        subtitle={`${exp.category} · ${new Date(exp.date).toLocaleDateString()}`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/expenses">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/expenses/$id/edit" params={{ id: exp._id }}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
          </>
        }
      />
      <DetailCard title="Expense Information">
        <DetailRow label="Expense Title" value={exp.title} />
        <DetailRow label="Category" value={exp.category} />
        <DetailRow label="Amount" value={formatPKR(exp.amount)} />
        <DetailRow label="Date" value={new Date(exp.date).toLocaleDateString()} />
        <DetailRow label="Notes" value={exp.notes || "—"} />
      </DetailCard>
    </div>
  );
}
