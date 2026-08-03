import { createFileRoute, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { expenseFields } from "@/data/field-configs";
import { expenses } from "@/data/dummy";

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
  const exp = expenses.find((e) => e.id === id);
  if (!exp) return <EmptyState title="Expense not found" />;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Edit Expense" subtitle={exp.title} />
      <EntityForm
        fields={expenseFields}
        backTo="/expenses"
        submitLabel="Update Expense"
        successMessage="Expense updated"
        defaultValues={{
          title: exp.title,
          category: exp.category,
          amount: String(exp.amount),
          date: exp.date,
          notes: exp.notes,
        }}
      />
    </div>
  );
}
