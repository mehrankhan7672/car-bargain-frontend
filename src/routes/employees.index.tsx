import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2, BadgeDollarSign } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { employees as seed, formatPKR, type Employee } from "@/data/dummy";

export const Route = createFileRoute("/employees/")({
  head: () => ({
    meta: [
      { title: "Employees — Car Bargain Manager" },
      { name: "description", content: "Staff list with role, phone number, joining date and monthly salary." },
      { property: "og:title", content: "Employees — Car Bargain Manager" },
      { property: "og:description", content: "Manage showroom staff and pay their salary." },
    ],
  }),
  component: EmployeeList,
});

function GiveSalary({ employee }: { employee: Employee }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="rounded-lg" aria-label="Give salary">
          <BadgeDollarSign className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Give Salary</DialogTitle>
          <DialogDescription>Pay monthly salary to {employee.name}.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Amount (PKR)</Label>
            <Input defaultValue={employee.salary} className="h-11 rounded-xl" />
          </div>
          <div className="grid gap-2">
            <Label>Month</Label>
            <Input defaultValue="August 2026" className="h-11 rounded-xl" />
          </div>
          <div className="grid gap-2">
            <Label>Paid On</Label>
            <Input type="date" className="h-11 rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-xl"
            onClick={() => {
              setOpen(false);
              toast.success("Salary paid", { description: `${employee.name} · ${formatPKR(employee.salary)}` });
            }}
          >
            Pay Salary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmployeeList() {
  const loading = useFakeLoading();
  const [rows, setRows] = useState<Employee[]>(seed);

  const remove = (e: Employee) => {
    setRows((prev) => prev.filter((x) => x.id !== e.id));
    toast.success("Employee deleted", { description: `${e.name} removed from the list.` });
  };

  const columns: Column<Employee>[] = [
    {
      key: "name",
      header: "Employee Name",
      cell: (e) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{e.name}</p>
          <p className="truncate text-xs text-muted-foreground">{e.id}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (e) => e.role },
    { key: "phone", header: "Phone Number", cell: (e) => e.phone },
    { key: "joining", header: "Joining Date", cell: (e) => e.joiningDate },
    { key: "salary", header: "Salary", cell: (e) => <span className="font-semibold">{formatPKR(e.salary)}</span> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <GiveSalary employee={e} />
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="View employee">
            <Link to="/employees/$id" params={{ id: e.id }}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="rounded-lg" aria-label="Edit employee">
            <Link to="/employees/$id/edit" params={{ id: e.id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDelete itemName={e.name} onConfirm={() => remove(e)}>
            <Button size="icon" variant="ghost" className="rounded-lg text-destructive" aria-label="Delete employee">
              <Trash2 className="h-4 w-4" />
            </Button>
          </ConfirmDelete>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Employees"
        subtitle="Your showroom staff"
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/salaries">Salary History</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/employees/new">
                <Plus className="h-4 w-4" /> Add Employee
              </Link>
            </Button>
          </>
        }
      />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by employee name or phone..."
        searchKeys={(e) => `${e.name} ${e.role} ${e.phone}`}
        filters={[
          {
            label: "Role",
            options: ["Manager", "Salesman", "Accountant", "Driver", "Mechanic"],
            match: (e, v) => e.role === v,
          },
        ]}
        emptyTitle="No employee found"
      />
    </div>
  );
}
