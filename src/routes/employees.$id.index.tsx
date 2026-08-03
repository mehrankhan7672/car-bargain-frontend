import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { employees, formatPKR, salaries } from "@/data/dummy";

export const Route = createFileRoute("/employees/$id/")({
  head: () => ({
    meta: [
      { title: "Employee Details — Car Bargain Manager" },
      { name: "description", content: "Staff profile with role, joining date, salary and payment history." },
      { property: "og:title", content: "Employee Details — Car Bargain Manager" },
      { property: "og:description", content: "See employee information and salary payments." },
    ],
  }),
  component: ViewEmployee,
});

function ViewEmployee() {
  const { id } = useParams({ from: "/employees/$id/" });
  const emp = employees.find((e) => e.id === id);
  if (!emp) return <EmptyState title="Employee not found" />;
  const history = salaries.filter((s) => s.employee === emp.name);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title={emp.name}
        subtitle={`${emp.role} · joined ${emp.joiningDate}`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/employees">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/employees/$id/edit" params={{ id: emp.id }}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
          </>
        }
      />
      <div className="space-y-4">
        <DetailCard title="Employee Information">
          <DetailRow label="Employee Name" value={emp.name} />
          <DetailRow label="Role" value={emp.role} />
          <DetailRow label="Phone Number" value={emp.phone} />
          <DetailRow label="Joining Date" value={emp.joiningDate} />
          <DetailRow label="Monthly Salary" value={formatPKR(emp.salary)} />
        </DetailCard>
        <div className="card-soft p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Salary History
          </h3>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No salary paid yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm">
                  <span className="font-medium">{s.month}</span>
                  <span className="text-muted-foreground">{s.method}</span>
                  <span className="font-semibold">{formatPKR(s.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
