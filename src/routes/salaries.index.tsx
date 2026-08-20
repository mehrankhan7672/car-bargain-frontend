// src/routes/salaries.index.tsx
import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2, Pencil, RefreshCw, Plus } from "lucide-react";
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

export const Route = createFileRoute("/salaries/")({
  head: () => ({
    meta: [
      { title: "Salary History — Car Bargain Manager" },
      {
        name: "description",
        content: "All salary payments with employee name, month, amount and method.",
      },
      { property: "og:title", content: "Salary History — Car Bargain Manager" },
      { property: "og:description", content: "Search salary payments by employee." },
    ],
  }),
  component: SalaryHistory,
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

function EditSalaryDialog({ salary, onUpdate, onClose }) {
  const [open, setOpen] = useState(true);
  const maxSalary = salary.fullSalary || salary.amount || 0;

  // Payment type state – default to the saved type or "Full Salary"
  const [paymentType, setPaymentType] = useState(salary.paymentType || "Full Salary");
  const [amount, setAmount] = useState(() => {
    // Pre‑fill the amount according to its type
    if (salary.paymentType === "Full Salary") return maxSalary;
    if (salary.paymentType === "Deduction") {
      const val = salary.payment || salary.amount || 0;
      return val < 0 ? val : -Math.abs(val);
    }
    return salary.payment || salary.amount || "";
  });

  const [month, setMonth] = useState(salary.month || "");
  const [paidDate, setPaidDate] = useState(
    salary.paidDate ? new Date(salary.paidDate).toISOString().split("T")[0] : "",
  );
  const [method, setMethod] = useState(salary.method || "Cash");
  const [status, setStatus] = useState(salary.status || "Paid");
  const [notes, setNotes] = useState(salary.notes || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isLockedFull = paymentType === "Full Salary";
  const isCappedAtSalary = paymentType === "Partial Salary";
  const isFreeEntry = ["Advance", "Bonus", "Commission"].includes(paymentType);
  const isDeduction = paymentType === "Deduction";

  // When payment type changes, adjust amount accordingly
  const handlePaymentTypeChange = (val) => {
    const wasLockedFull = paymentType === "Full Salary";
    setPaymentType(val);

    if (val === "Full Salary") {
      setAmount(maxSalary);
    } else if (val === "Deduction") {
      // If previous amount is positive, convert to negative
      const current = Number(amount);
      if (!isNaN(current) && current > 0) {
        setAmount(-current);
      } else if (amount === "" || amount === 0) {
        setAmount("");
      }
    } else if (wasLockedFull) {
      setAmount(""); // clear locked amount
    }
    if (errors.amount) setErrors({ ...errors, amount: null });
  };

  // Handle amount input with caps and sign rules
  const handleAmountChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      setAmount("");
      if (errors.amount) setErrors({ ...errors, amount: null });
      return;
    }
    let num = Number(raw);
    if (isNaN(num)) return;

    if (isDeduction) {
      // Deduction must be negative
      if (num > 0) num = -num;
      // Cap magnitude to maxSalary
      if (num < -maxSalary) num = -maxSalary;
      setAmount(num);
    } else if (isCappedAtSalary) {
      if (num < 0) num = 0;
      if (num > maxSalary) num = maxSalary;
      setAmount(num);
    } else if (isFreeEntry) {
      if (num < 0) num = 0;
      setAmount(num);
    } else {
      // Should not happen (Full Salary is read‑only)
      setAmount(num);
    }
    if (errors.amount) setErrors({ ...errors, amount: null });
  };

  const validateForm = () => {
    const newErrors = {};
    const numericAmount = Number(amount);
    if (!amount || numericAmount === 0) {
      newErrors.amount = "Amount must not be zero";
    } else if (!isDeduction && numericAmount < 0) {
      newErrors.amount = "Only Deduction can be negative";
    } else if (isCappedAtSalary && numericAmount > maxSalary) {
      newErrors.amount = `Amount cannot exceed ${formatPKR(maxSalary)}`;
    } else if (isDeduction && numericAmount > 0) {
      newErrors.amount = "Deduction must be negative";
    } else if (isDeduction && numericAmount < -maxSalary) {
      newErrors.amount = `Deduction cannot exceed ${formatPKR(maxSalary)}`;
    }

    if (!month.trim()) newErrors.month = "Month is required";
    if (!paidDate) newErrors.paidDate = "Paid date is required";
    if (!method) newErrors.method = "Payment method is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      toast.error("Please fix all errors");
      return;
    }

    setLoading(true);
    try {
      await employeeService.updateSalaryPayment(salary.id, {
        payment: Number(amount),
        month,
        paidDate,
        method,
        paymentType,
        status,
        notes,
      });
      toast.success("Salary updated successfully");
      setOpen(false);
      if (onUpdate) onUpdate();
      if (onClose) onClose();
    } catch (error) {
      toast.error("Failed to update salary", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Salary</DialogTitle>
          <DialogDescription className="text-sm">
            {salary.employeeName || "Employee"} · {salary.month}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Row 1: Amount + Payment Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">
                Amount (PKR) *
                {isLockedFull && (
                  <span className="ml-1 text-muted-foreground font-normal">(fixed)</span>
                )}
                {isCappedAtSalary && (
                  <span className="ml-1 text-muted-foreground font-normal">
                    (max {formatPKR(maxSalary)})
                  </span>
                )}
                {isFreeEntry && (
                  <span className="ml-1 text-muted-foreground font-normal">(any amount)</span>
                )}
                {isDeduction && <span className="ml-1 text-red-500 font-normal">(negative)</span>}
              </Label>
              <Input
                type="number"
                value={amount}
                disabled={isLockedFull}
                readOnly={isLockedFull}
                onChange={handleAmountChange}
                className={`h-9 text-sm rounded-lg ${errors.amount ? "border-red-500" : ""} ${
                  isLockedFull ? "bg-muted/50 cursor-not-allowed" : ""
                }`}
                placeholder={
                  isDeduction
                    ? "Enter deduction amount (e.g., 2000)"
                    : isFreeEntry
                      ? "Enter any amount"
                      : "Enter amount"
                }
              />
              {isDeduction && amount && Number(amount) < 0 && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Will deduct {formatPKR(Math.abs(Number(amount)))}
                </p>
              )}
              {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Payment Type</Label>
              <Select value={paymentType} onValueChange={handlePaymentTypeChange}>
                <SelectTrigger className="h-9 text-sm rounded-lg">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Paid Date + Method */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Paid On *</Label>
              <Input
                type="date"
                value={paidDate}
                onChange={(e) => {
                  setPaidDate(e.target.value);
                  if (errors.paidDate) setErrors({ ...errors, paidDate: null });
                }}
                className={`h-9 text-sm rounded-lg ${errors.paidDate ? "border-red-500" : ""}`}
              />
              {errors.paidDate && <p className="text-xs text-red-500">{errors.paidDate}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Method *</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger
                  className={`h-9 text-sm rounded-lg ${errors.method ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.method && <p className="text-xs text-red-500">{errors.method}</p>}
            </div>
          </div>

          {/* Row 3: Month + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Month *</Label>
              <Input
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  if (errors.month) setErrors({ ...errors, month: null });
                }}
                className={`h-9 text-sm rounded-lg ${errors.month ? "border-red-500" : ""}`}
                placeholder="e.g., August 2026"
              />
              {errors.month && <p className="text-xs text-red-500">{errors.month}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-sm rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium">Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-sm rounded-lg"
              placeholder="Add notes..."
            />
          </div>

          {/* Summary (amount, full, due) */}
          <div className="grid grid-cols-3 gap-2 p-2 bg-muted/30 rounded-lg text-xs">
            <div>
              <span className="text-muted-foreground">Payment:</span>
              <span
                className={`font-semibold ml-1 ${
                  Number(amount) < 0 ? "text-red-500" : "text-primary"
                }`}
              >
                {formatPKR(Number(amount) || 0)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Full:</span>
              <span className="font-medium ml-1">{formatPKR(maxSalary)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Due:</span>
              <span
                className={`font-semibold ml-1 ${
                  (salary.dueSalary || 0) > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatPKR(salary.dueSalary || 0)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-lg flex-1 h-9" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-lg flex-1 h-9"
            onClick={handleUpdate}
            disabled={loading || Number(amount) === 0}
          >
            {loading ? "Updating..." : "Update Salary"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function SalaryHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("All");
  const [filterMethod, setFilterMethod] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [editingSalary, setEditingSalary] = useState(null);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterEmployee && filterEmployee !== "All") filters.employee = filterEmployee;
      if (filterMethod && filterMethod !== "All") filters.method = filterMethod;
      if (filterType && filterType !== "All") filters.paymentType = filterType;

      const data = await employeeService.getAllSalaries(filters);
      setRows(data || []);
    } catch (error) {
      toast.error("Failed to load salaries", { description: error.message });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [searchTerm, filterEmployee, filterMethod, filterType]);

  const remove = async (salary) => {
    try {
      await employeeService.deleteSalaryPayment(salary.id);
      setRows((prev) => prev.filter((x) => x.id !== salary.id));
      toast.success("Salary record deleted", {
        description: `Record for ${salary.employeeName} · ${salary.month} removed.`,
      });
    } catch (error) {
      toast.error("Failed to delete salary record", { description: error.message });
    }
  };

  const getUniqueEmployees = () => {
    const employees = rows.map((s) => s.employeeName || "Unknown");
    return ["All", ...new Set(employees)];
  };

  const columns = [
    {
      key: "employee",
      header: "Employee",
      cell: (salary) => {
        const name =
          salary.employeeName ||
          (salary.employeeId && typeof salary.employeeId === "object"
            ? salary.employeeId.name
            : salary.employeeId) ||
          "Unknown";
        const id =
          salary.employeeId && typeof salary.employeeId === "object"
            ? salary.employeeId._id
            : salary.employeeId;
        return (
          <div className="min-w-0">
            <p className="truncate font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{id}</p>
          </div>
        );
      },
    },
    { key: "month", header: "Month", cell: (salary) => salary.month },
    {
      key: "payment",
      header: "Payment",
      cell: (salary) => (
        <span
          className={`font-semibold ${Number(salary.payment || salary.amount) < 0 ? "text-red-500" : "text-primary"}`}
        >
          {formatPKR(salary.payment || salary.amount)}
        </span>
      ),
    },
    {
      key: "fullSalary",
      header: "Full Salary",
      cell: (salary) => (
        <span className="text-muted-foreground">
          {formatPKR(salary.fullSalary || salary.amount)}
        </span>
      ),
    },
    {
      key: "dueSalary",
      header: "Due Salary",
      cell: (salary) => {
        const due = salary.dueSalary || 0;
        return (
          <span className={`font-semibold ${due > 0 ? "text-red-600" : "text-green-600"}`}>
            {formatPKR(due)}
          </span>
        );
      },
    },
    {
      key: "paidDate",
      header: "Paid On",
      cell: (salary) => (salary.paidDate ? new Date(salary.paidDate).toLocaleDateString() : "-"),
    },
    {
      key: "method",
      header: "Method",
      cell: (salary) => (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
          {salary.method}
        </span>
      ),
    },
    {
      key: "paymentType",
      header: "Type",
      cell: (salary) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
            salary.paymentType === "Deduction"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {salary.paymentType || "Full Salary"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (salary) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            salary.status === "Paid"
              ? "bg-green-100 text-green-700"
              : salary.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : salary.status === "Partially Paid"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700"
          }`}
        >
          {salary.status || "Paid"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (salary) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-lg h-8 w-8"
            onClick={() => setEditingSalary(salary)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <ConfirmDelete
            itemName={`${salary.employeeName || "Unknown"} · ${salary.month}`}
            onConfirm={() => remove(salary)}
          >
            <Button size="icon" variant="ghost" className="rounded-lg h-8 w-8 text-destructive">
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
        title="Salary History"
        subtitle="Record of every salary payment"
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={fetchSalaries}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/employees">
                <Plus className="h-4 w-4" /> Back to Employees
              </Link>
            </Button>
          </>
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by employee name, month, or method..."
        searchKeys={(salary) => {
          const name =
            salary.employeeName ||
            (salary.employeeId && typeof salary.employeeId === "object"
              ? salary.employeeId.name
              : salary.employeeId) ||
            "";
          return `${name} ${salary.month || ""} ${salary.method || ""}`;
        }}
        filters={[
          {
            label: "Employee",
            options: getUniqueEmployees(),
            match: (salary, value) => {
              if (value === "All") return true;
              const name =
                salary.employeeName ||
                (salary.employeeId && typeof salary.employeeId === "object"
                  ? salary.employeeId.name
                  : salary.employeeId) ||
                "";
              return name === value;
            },
          },
          {
            label: "Method",
            options: ["All", "Cash", "Bank Transfer", "Cheque", "Mobile Wallet"],
            match: (salary, value) => (value === "All" ? true : salary.method === value),
          },
          {
            label: "Payment Type",
            options: [
              "All",
              "Full Salary",
              "Partial Salary",
              "Advance",
              "Bonus",
              "Commission",
              "Deduction",
            ],
            match: (salary, value) =>
              value === "All" ? true : (salary.paymentType || "Full Salary") === value,
          },
          {
            label: "Status",
            options: ["All", "Paid", "Pending", "Partially Paid", "Cancelled"],
            match: (salary, value) =>
              value === "All" ? true : (salary.status || "Paid") === value,
          },
        ]}
        emptyTitle="No salary records found"
        onSearch={(value) => setSearchTerm(value)}
        onFilterChange={(value, index) => {
          if (index === 0) setFilterEmployee(value);
          else if (index === 1) setFilterMethod(value);
          else if (index === 2) setFilterType(value);
        }}
      />

      {editingSalary && (
        <EditSalaryDialog
          salary={editingSalary}
          onUpdate={() => {
            setEditingSalary(null);
            fetchSalaries();
          }}
          onClose={() => setEditingSalary(null)}
        />
      )}
    </div>
  );
}
