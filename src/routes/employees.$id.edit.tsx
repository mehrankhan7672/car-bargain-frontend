import { createFileRoute, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { employeeFields } from "@/data/field-configs";
import { employees } from "@/data/dummy";

export const Route = createFileRoute("/employees/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Employee — Car Bargain Manager" },
      { name: "description", content: "Update staff role, phone number, joining date or salary." },
      { property: "og:title", content: "Edit Employee — Car Bargain Manager" },
      { property: "og:description", content: "Change a saved employee record." },
    ],
  }),
  component: EditEmployee,
});

function EditEmployee() {
  const { id } = useParams({ from: "/employees/$id/edit" });
  const emp = employees.find((e) => e.id === id);
  if (!emp) return <EmptyState title="Employee not found" />;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Edit Employee" subtitle={emp.name} />
      <EntityForm
        fields={employeeFields}
        backTo="/employees"
        submitLabel="Update Employee"
        successMessage="Employee updated"
        defaultValues={{
          name: emp.name,
          role: emp.role,
          phone: emp.phone,
          joiningDate: emp.joiningDate,
          salary: String(emp.salary),
        }}
      />
    </div>
  );
}
