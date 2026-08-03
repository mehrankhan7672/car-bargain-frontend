import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { employeeFields } from "@/data/field-configs";

export const Route = createFileRoute("/employees/new")({
  head: () => ({
    meta: [
      { title: "Add Employee — Car Bargain Manager" },
      { name: "description", content: "Add a new staff member with role, phone, joining date and salary." },
      { property: "og:title", content: "Add Employee — Car Bargain Manager" },
      { property: "og:description", content: "Save a new employee record." },
    ],
  }),
  component: AddEmployee,
});

function AddEmployee() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Add Employee" subtitle="Enter staff member details" />
      <EntityForm
        fields={employeeFields}
        backTo="/employees"
        submitLabel="Save Employee"
        successMessage="Employee added"
        defaultValues={{ name: "", role: "", phone: "", joiningDate: "", salary: "" }}
      />
    </div>
  );
}
