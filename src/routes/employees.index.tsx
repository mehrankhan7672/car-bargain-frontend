// src/routes/employees.index.tsx
import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2, DollarSign, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDelete } from "@/components/shared/ConfirmDelete";
import { employeeService } from "@/services/employeeService";

export const Route = createFileRoute("/employees/")({
  head: () => ({
    meta: [
      { title: "Employees — Car Bargain Manager" },
      {
        name: "description",
        content: "Staff list with role, phone number, joining date and monthly salary.",
      },
      { property: "og:title", content: "Employees — Car Bargain Manager" },
      { property: "og:description", content: "Manage showroom staff and pay their salary." },
    ],
  }),
  component: EmployeeList,
});

const formatPKR = (amount) => {
  if (!amount) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const PAYMENT_METHODS = [
  { value: "Cash", label: "Cash" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Cheque", label: "Cheque" },
  { value: "Mobile Wallet", label: "Mobile Wallet" },
];

// UPDATED: Added "Deduction"
const PAYMENT_TYPES = [
  { value: "Full Salary", label: "Full Salary" },
  { value: "Partial Salary", label: "Partial Salary" },
  { value: "Advance", label: "Advance" },
  { value: "Bonus", label: "Bonus" },
  { value: "Commission", label: "Commission" },
  { value: "Deduction", label: "Deduction" },
];

function GiveSalary({ employee, onSalaryPaid }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(employee.salary);
  const [paymentType, setPaymentType] = useState("Full Salary");
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" }),
  );
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Full Salary is locked to the fixed salary amount. Partial Salary is
  // editable but still can't exceed it. Advance / Bonus / Commission are
  // free entry — unrelated to the fixed monthly salary.
  const isLockedFull = paymentType === "Full Salary";
  const isCappedAtSalary = paymentType === "Partial Salary";
  const isFreeEntry =
    paymentType === "Advance" || paymentType === "Bonus" || paymentType === "Commission";

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    setPaidDate(dateValue);
    if (dateValue) {
      const dateObj = new Date(dateValue);
      if (!isNaN(dateObj.getTime())) {
        const monthName = dateObj.toLocaleString("default", { month: "long", year: "numeric" });
        setMonth(monthName);
        if (errors.month) setErrors({ ...errors, month: null });
      }
    }
  };

  const handlePaymentTypeChange = (val) => {
    const wasLockedFull = paymentType === "Full Salary";
    setPaymentType(val);

    if (val === "Full Salary") {
      setAmount(employee.salary);
    } else if (val === "Deduction") {
      setAmount((prev) => (prev && Number(prev) > 0 ? -Number(prev) : prev || ""));
    } else if (wasLockedFull) {
      setAmount("");
    }
    if (errors.amount) setErrors({ ...errors, amount: null });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!amount || Number(amount) === 0) {
      newErrors.amount = "Amount must not be zero";
    } else if (paymentType !== "Deduction" && Number(amount) < 0) {
      newErrors.amount = "Only Deduction can be negative";
    } else if (isCappedAtSalary && Number(amount) > employee.salary) {
      newErrors.amount = `Amount cannot exceed ${formatPKR(employee.salary)}`;
    } else if (paymentType === "Deduction" && Number(amount) > 0) {
      setAmount(-Number(amount));
      return;
    }

    if (!month.trim()) newErrors.month = "Month is required";
    if (!paidDate) newErrors.paidDate = "Paid date is required";
    if (!paymentMethod) newErrors.paymentMethod = "Payment method is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaySalary = async () => {
    if (!validateForm()) {
      toast.error("Please fix all errors");
      return;
    }

    setLoading(true);
    try {
      await employeeService.recordSalaryPayment(employee.id, {
        amount: Number(amount),
        month: month.trim(),
        paidDate: paidDate,
        method: paymentMethod,
        paymentType: paymentType,
        isPartial: paymentType === "Partial Salary",
        isAdvance: paymentType === "Advance",
      });

      toast.success("Salary paid", {
        description: `${employee.name} · ${formatPKR(Number(amount))} via ${paymentMethod} for ${month.trim()}`,
      });

      setOpen(false);
      setErrors({});
      if (onSalaryPaid) onSalaryPaid();
    } catch (error) {
      toast.error("Failed to pay salary", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setErrors({});
    setAmount(employee.salary);
    setPaymentType("Full Salary");
    setMonth(new Date().toLocaleString("default", { month: "long", year: "numeric" }));
    setPaidDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Cash");
  };

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="rounded-lg hover:bg-primary/10"
        aria-label="Give salary"
        onClick={() => setOpen(true)}
        type="button"
      >
        <DollarSign className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Give Salary</DialogTitle>
            <DialogDescription>
              Pay monthly salary to <span className="font-semibold">{employee.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount (PKR) <span className="text-red-500">*</span>
                  {paymentType === "Deduction" && (
                    <span className="ml-1 text-xs text-red-500 font-medium">
                      (will be subtracted)
                    </span>
                  )}
                  {isLockedFull && (
                    <span className="ml-1 text-xs text-muted-foreground font-medium">
                      (fixed to salary)
                    </span>
                  )}
                  {isFreeEntry && (
                    <span className="ml-1 text-xs text-muted-foreground font-medium">
                      (any amount)
                    </span>
                  )}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  disabled={isLockedFull}
                  readOnly={isLockedFull}
                  onChange={(e) => {
                    let val = e.target.value;

                    if (paymentType === "Deduction") {
                      if (val === "") {
                        setAmount("");
                        return;
                      }
                      let numVal = Number(val);
                      if (!isNaN(numVal)) {
                        if (numVal > 0) numVal = -numVal;
                        setAmount(numVal);
                      } else {
                        setAmount(val);
                      }
                    } else if (isCappedAtSalary) {
                      if (val === "") {
                        setAmount("");
                        return;
                      }
                      let numVal = Number(val);
                      if (!isNaN(numVal)) {
                        if (numVal < 0) numVal = 0;
                        if (numVal > employee.salary) numVal = employee.salary;
                        setAmount(numVal);
                      } else {
                        setAmount(val);
                      }
                    } else {
                      if (val === "") {
                        setAmount("");
                        return;
                      }
                      let numVal = Number(val);
                      if (!isNaN(numVal)) {
                        if (numVal < 0) numVal = 0;
                        setAmount(numVal);
                      } else {
                        setAmount(val);
                      }
                    }
                    if (errors.amount) setErrors({ ...errors, amount: null });
                  }}
                  className={`h-10 rounded-lg ${errors.amount ? "border-red-500" : ""} ${
                    isLockedFull ? "bg-muted/50 cursor-not-allowed" : ""
                  }`}
                  placeholder={
                    paymentType === "Deduction"
                      ? "Enter amount to deduct (e.g., 2000)"
                      : isFreeEntry
                        ? "Enter any amount"
                        : "Enter amount"
                  }
                />
                {paymentType === "Deduction" && amount && Number(amount) < 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ Will deduct {formatPKR(Math.abs(Number(amount)))}
                  </p>
                )}
                {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
              </div>

              <div className="grid gap-1">
                <Label htmlFor="paymentType" className="text-sm font-medium">
                  Payment Type
                </Label>
                <Select value={paymentType} onValueChange={handlePaymentTypeChange}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="paymentMethod" className="text-sm font-medium">
                  Method <span className="text-red-500">*</span>
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger
                    className={`h-10 rounded-lg ${errors.paymentMethod ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-xs text-red-500">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="paidDate" className="text-sm font-medium">
                  Paid On <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="paidDate"
                  type="date"
                  value={paidDate}
                  onChange={handleDateChange}
                  className={`h-10 rounded-lg ${errors.paidDate ? "border-red-500" : ""}`}
                />
                {errors.paidDate && <p className="text-xs text-red-500">{errors.paidDate}</p>}
              </div>

              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="month" className="text-sm font-medium">
                    Month <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">(auto‑filled)</span>
                </div>
                <Input
                  id="month"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    if (errors.month) setErrors({ ...errors, month: null });
                  }}
                  className={`h-10 rounded-lg ${errors.month ? "border-red-500" : ""}`}
                  placeholder="e.g., August 2026"
                />
                {errors.month && <p className="text-xs text-red-500">{errors.month}</p>}
              </div>
            </div>

            <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee</span>
                <span className="font-medium">{employee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-medium">{formatPKR(employee.salary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span
                  className={`font-semibold ${
                    Number(amount) < 0
                      ? "text-red-500"
                      : isCappedAtSalary && Number(amount) > employee.salary
                        ? "text-red-500"
                        : "text-primary"
                  }`}
                >
                  {formatPKR(Number(amount) || 0)}
                  {paymentType === "Deduction" && Number(amount) < 0 && (
                    <span className="ml-1 text-xs text-red-500">(deduction)</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Type</span>
                <span className="font-medium">{paymentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Month</span>
                <span className="font-medium">{month || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{paymentMethod}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 mt-2">
            <Button variant="outline" className="rounded-lg flex-1 h-10" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="rounded-lg flex-1 h-10"
              onClick={handlePaySalary}
              disabled={loading || Number(amount) === 0}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Paying...
                </>
              ) : (
                "Pay Salary"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EmployeeList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterRole && filterRole !== "All") filters.role = filterRole;

      const data = await employeeService.getAllEmployees(filters);
      setRows(data || []);
    } catch (error) {
      toast.error("Failed to load employees", { description: error.message });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, filterRole]);

  const remove = async (employee) => {
    try {
      await employeeService.deleteEmployee(employee.id);
      setRows((prev) => prev.filter((x) => x.id !== employee.id));
      toast.success("Employee deleted", { description: `${employee.name} removed.` });
    } catch (error) {
      toast.error("Failed to delete employee", { description: error.message });
    }
  };

  const columns = [
    {
      key: "name",
      header: "Employee Name",
      cell: (employee) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{employee.name}</p>
          <p className="truncate text-xs text-muted-foreground">{employee.id}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (employee) => employee.role },
    { key: "phone", header: "Phone Number", cell: (employee) => employee.phone },
    { key: "joiningDate", header: "Joining Date", cell: (employee) => employee.joiningDate },
    {
      key: "salary",
      header: "Salary",
      cell: (employee) => <span className="font-semibold">{formatPKR(employee.salary)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (employee) => (
        <div className="flex justify-end gap-1">
          <GiveSalary employee={employee} onSalaryPaid={fetchEmployees} />
          <Button asChild size="icon" variant="ghost" className="rounded-lg">
            <Link to="/employees/$id/" params={{ id: employee.id }}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="rounded-lg">
            <Link to="/employees/$id/edit" params={{ id: employee.id }}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <ConfirmDelete itemName={employee.name} onConfirm={() => remove(employee)}>
            <Button size="icon" variant="ghost" className="rounded-lg text-destructive">
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
            <Button variant="outline" className="rounded-xl" onClick={fetchEmployees}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
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
        searchKeys={(employee) => `${employee.name} ${employee.role} ${employee.phone}`}
        filters={[
          {
            label: "Role",
            options: [
              "All",
              "Manager",
              "Salesman",
              "Accountant",
              "Driver",
              "Watchman",
              "Cleaner",
              "Cook",
              "Waiter",
            ],
            match: (employee, value) => (value === "All" ? true : employee.role === value),
          },
        ]}
        emptyTitle="No employee found"
        onSearch={(value) => setSearchTerm(value)}
        onFilterChange={(value) => setFilterRole(value)}
      />
    </div>
  );
}
