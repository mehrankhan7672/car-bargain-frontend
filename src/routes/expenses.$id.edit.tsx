import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { expenseFields, expenseSteps } from "@/data/field-configs";
import { expenseService } from "@/services/expenseService";

export const Route = createFileRoute("/expenses/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Expense — Car Bargain Manager" },
      { name: "description", content: "Update the title, category, amount or date of an expense." },
      { property: "og:title", content: "Edit Expense — Car Bargain Manager" },
      { property: "og:description", content: "Change a saved expense entry." },
    ],
  }),
  component: EditExpense,
});

function EditExpense() {
  const { id } = useParams({ from: "/expenses/$id/edit" });
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
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Edit Expense" subtitle={exp.title} />
      <EntityForm
        fields={expenseFields}
        steps={expenseSteps}
        entityLabel="Expense"
        backTo="/expenses"
        submitLabel="Update Expense"
        successMessage="Expense updated"
        defaultValues={{
          title: exp.title,
          category: exp.category,
          amount: String(exp.amount),
          date: exp.date ? new Date(exp.date).toISOString().slice(0, 10) : "",
          notes: exp.notes || "",
        }}
      />
    </div>
  );
}
