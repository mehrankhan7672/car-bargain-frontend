// src/routes/salaries.$id.index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { employeeService } from "@/services/employeeService";

// THIS CREATES THE ROUTE /salaries/$id
export const Route = createFileRoute("/salaries/$id/")({
  component: ViewSalary,
});

const formatPKR = (amount) => {
  if (!amount) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

function ViewSalary() {
  const { id } = useParams({ from: "/salaries/$id/" });
  const navigate = useNavigate();
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalary = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await employeeService.getSalaryById(id);
        setSalary(data);
      } catch (error) {
        console.error("Error fetching salary:", error);
        toast.error("Failed to load salary details", {
          description: error.message,
        });
        setSalary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSalary();
  }, [id]);

  const handleDelete = async () => {
    try {
      await employeeService.deleteSalaryPayment(id);
      toast.success("Salary record deleted");
      navigate({ to: "/salaries" });
    } catch (error) {
      toast.error("Failed to delete salary record", {
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading salary details...</p>
        </div>
      </div>
    );
  }

  if (!salary) {
    return <EmptyState title="Salary record not found" />;
  }

  const employeeName =
    salary.employeeName ||
    (salary.employeeId && typeof salary.employeeId === "object"
      ? salary.employeeId.name
      : salary.employeeId) ||
    "Unknown";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Salary Details"
        subtitle={`Payment for ${employeeName}`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/salaries">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/salaries/$id/edit" params={{ id: salary.id }}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
            <ConfirmDelete itemName={`${employeeName} · ${salary.month}`} onConfirm={handleDelete}>
              <Button variant="destructive" className="rounded-xl">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </ConfirmDelete>
          </>
        }
      />
      <div className="space-y-4">
        <DetailCard title="Salary Information">
          <DetailRow label="Employee Name" value={employeeName} />
          <DetailRow label="Month" value={salary.month} />
          <DetailRow label="Payment Amount" value={formatPKR(salary.payment || salary.amount)} />
          <DetailRow label="Full Salary" value={formatPKR(salary.fullSalary || salary.amount)} />
          <DetailRow
            label="Due Salary"
            value={
              <span className={(salary.dueSalary || 0) > 0 ? "text-red-600" : "text-green-600"}>
                {formatPKR(salary.dueSalary || 0)}
              </span>
            }
          />
          <DetailRow label="Paid On" value={new Date(salary.paidDate).toLocaleDateString()} />
          <DetailRow label="Payment Method" value={salary.method} />
          <DetailRow label="Payment Type" value={salary.paymentType || "Full Salary"} />
          <DetailRow label="Status" value={salary.status || "Paid"} />
          {salary.notes && <DetailRow label="Notes" value={salary.notes} />}
        </DetailCard>
      </div>
    </div>
  );
}
