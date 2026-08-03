import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { expenseFields } from "@/data/field-configs";

export const Route = createFileRoute("/expenses/new")({
  head: () => ({
    meta: [
      { title: "Add Expense — Car Bargain Manager" },
      { name: "description", content: "Record a new showroom expense with category, amount and date." },
      { property: "og:title", content: "Add Expense — Car Bargain Manager" },
      { property: "og:description", content: "Save a new expense entry to your record." },
    ],
  }),
  component: AddExpense,
});

function AddExpense() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Add Expense" subtitle="Write down where the money was spent" />
      <EntityForm
        fields={expenseFields}
        backTo="/expenses"
        submitLabel="Save Expense"
        successMessage="Expense added"
        defaultValues={{ title: "", category: "", amount: "", date: "", notes: "" }}
      />
    </div>
  );
}
