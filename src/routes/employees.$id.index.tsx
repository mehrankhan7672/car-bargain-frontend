// src/routes/employees.$id.index.tsx
import { useState, useEffect } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import { DetailCard, DetailRow } from "@/components/shared/DetailCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { employeeService } from "@/services/employeeService";

export const Route = createFileRoute("/employees/$id/")({
  component: ViewEmployee,
});

const formatPKR = (amount) => {
  if (!amount) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

function ViewEmployee() {
  const { id } = useParams({ from: "/employees/$id/" });
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allSalaries, setAllSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [balanceInfo, setBalanceInfo] = useState(null);
  const [overallStats, setOverallStats] = useState({
    totalPaid: 0,
    totalDue: 0,
    unpaidMonths: 0,
  });
  const [monthFilter, setMonthFilter] = useState("All");

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployeeById(id);
      setEmployee(data);

      const allRecords = await employeeService.getAllSalaries({ employeeId: id });
      setAllSalaries(allRecords || []);
      setFilteredSalaries(allRecords || []);

      // Active records for stats (exclude Cancelled & Pending)
      const activeRecords = allRecords.filter(
        (r) => r.status === "Paid" || r.status === "Partially Paid",
      );

      let totalPaid = 0;
      const monthMap = new Map();
      activeRecords.forEach((record) => {
        totalPaid += record.payment || record.amount || 0;
        const month = record.month;
        const existing = monthMap.get(month);
        if (!existing || new Date(record.paidDate) > new Date(existing.paidDate)) {
          monthMap.set(month, record);
        }
      });

      // Current month balance
      const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });
      const balance = await employeeService.getEmployeeBalance(id, currentMonth);
      setBalanceInfo(balance);

      // Calculate total due = current month due + other months due
      const currentMonthDue = balance?.dueSalary || 0;
      let otherMonthsDue = 0;
      let unpaidMonths = 0;
      for (const [month, record] of monthMap) {
        if (month === currentMonth) continue;
        const due = record.dueSalary || 0;
        if (due > 0) {
          otherMonthsDue += due;
          unpaidMonths++;
        }
      }
      if (currentMonthDue > 0) unpaidMonths++;

      const totalDue = currentMonthDue + otherMonthsDue;

      setOverallStats({
        totalPaid,
        totalDue,
        unpaidMonths,
      });
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast.error("Failed to load employee details", {
        description: error.message || "Employee not found",
      });
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployeeDetails();
    }
  }, [id]);

  useEffect(() => {
    if (monthFilter === "All") {
      setFilteredSalaries(allSalaries);
    } else {
      setFilteredSalaries(allSalaries.filter((s) => s.month === monthFilter));
    }
  }, [monthFilter, allSalaries]);

  const uniqueMonths = ["All", ...new Set(allSalaries.map((s) => s.month).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return <EmptyState title="Employee not found" />;
  }

  const statusColors = {
    Paid: "text-green-600 bg-green-50",
    Pending: "text-yellow-600 bg-yellow-50",
    "Partially Paid": "text-orange-600 bg-orange-50",
    Cancelled: "text-red-600 bg-red-50",
  };

  const paymentTypeColors = {
    "Full Salary": "text-green-600 bg-green-50",
    "Partial Salary": "text-orange-600 bg-orange-50",
    Advance: "text-blue-600 bg-blue-50",
    Bonus: "text-purple-600 bg-purple-50",
    Commission: "text-indigo-600 bg-indigo-50",
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title={employee.name}
        subtitle={`${employee.role} · joined ${employee.joiningDate}`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/employees">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/employees/$id/edit" params={{ id: employee.id }}>
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
          </>
        }
      />
      <div className="space-y-4">
        <DetailCard title="Employee Information">
          <DetailRow label="Employee Name" value={employee.name} />
          <DetailRow label="Role" value={employee.role} />
          <DetailRow label="Phone Number" value={employee.phone} />
          <DetailRow label="Joining Date" value={employee.joiningDate} />
          <DetailRow label="Monthly Salary" value={formatPKR(employee.salary)} />
          <DetailRow label="Employee ID" value={employee.id} />
          {employee.createdAt && (
            <DetailRow
              label="Created At"
              value={new Date(employee.createdAt).toLocaleDateString()}
            />
          )}
        </DetailCard>

        {/* Overall Summary - 3 cards */}
        <div className="card-soft p-5 border border-border">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Overall Summary (All Months)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-xl font-bold text-primary">{formatPKR(overallStats.totalPaid)}</p>
            </div>
            {/* Total Due Card with breakdown */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-xs text-muted-foreground">Total Due</p>
              <p className="text-xl font-bold text-red-600">{formatPKR(overallStats.totalDue)}</p>
              {overallStats.unpaidMonths > 0 && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  {overallStats.unpaidMonths} month(s) with balance
                </p>
              )}
              {overallStats.totalDue === 0 && (
                <p className="text-xs text-green-600 font-medium mt-1">✓ All clear</p>
              )}
              {/* Breakdown: Current month + Other months */}
              {balanceInfo && balanceInfo.dueSalary !== undefined && (
                <div className="mt-2 pt-2 border-t border-border/50 text-xs space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Current month:</span>
                    <span
                      className={`font-semibold ${balanceInfo.dueSalary > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatPKR(balanceInfo.dueSalary || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Other months:</span>
                    <span className="font-semibold text-red-500">
                      {formatPKR(overallStats.totalDue - (balanceInfo.dueSalary || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-medium text-muted-foreground pt-0.5 border-t border-border/30 mt-0.5">
                    <span>Total:</span>
                    <span className="text-red-600">{formatPKR(overallStats.totalDue)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-muted-foreground">Monthly Salary</p>
              <p className="text-xl font-bold text-blue-600">{formatPKR(employee.salary)}</p>
            </div>
          </div>
        </div>

        {/* Current Month Summary */}
        {balanceInfo && (
          <div className="card-soft p-5 border border-border">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Current Month Summary -{" "}
              {balanceInfo.month ||
                new Date().toLocaleString("default", { month: "long", year: "numeric" })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold text-primary">
                  {formatPKR(balanceInfo.totalPaid || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {balanceInfo.paymentCount || 0} payment(s)
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-muted-foreground">Monthly Salary</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatPKR(balanceInfo.monthlySalary || employee.salary)}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl border ${
                  (balanceInfo.overpaid || 0) > 0
                    ? "bg-yellow-50 border-yellow-200"
                    : (balanceInfo.dueSalary || 0) > 0
                      ? "bg-red-50 border-red-100"
                      : "bg-green-50 border-green-100"
                }`}
              >
                <p className="text-xs text-muted-foreground">
                  {(balanceInfo.overpaid || 0) > 0 ? "Overpaid Amount" : "Due Salary"}
                </p>
                <p
                  className={`text-xl font-bold ${
                    (balanceInfo.overpaid || 0) > 0
                      ? "text-yellow-600"
                      : (balanceInfo.dueSalary || 0) > 0
                        ? "text-red-600"
                        : "text-green-600"
                  }`}
                >
                  {(balanceInfo.overpaid || 0) > 0
                    ? formatPKR(balanceInfo.overpaid)
                    : formatPKR(balanceInfo.dueSalary || 0)}
                </p>
                {(balanceInfo.overpaid || 0) > 0 && (
                  <p className="text-xs text-yellow-600 font-medium mt-1">
                    ⚠️ Employee owes this amount
                  </p>
                )}
                {(balanceInfo.dueSalary || 0) > 0 && (
                  <p className="text-xs text-red-600 font-medium mt-1">⚠️ Due Balance</p>
                )}
                {(balanceInfo.overpaid || 0) === 0 && (balanceInfo.dueSalary || 0) === 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">✓ Fully Paid</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Salary History with Month Filter */}
        <div className="card-soft p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Salary History
            </h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="monthFilter" className="text-xs font-medium text-muted-foreground">
                Filter by Month
              </Label>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="h-8 w-36 text-sm rounded-lg">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link to="/salaries">View All</Link>
              </Button>
            </div>
          </div>
          {filteredSalaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {monthFilter === "All"
                ? "No salary payments yet."
                : `No salary records for ${monthFilter}.`}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Month</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                      Payment
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                      Full Salary
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Due</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                      Method
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.map((payment) => (
                    <tr
                      key={payment.id || payment._id}
                      className="border-b border-border hover:bg-muted/30"
                    >
                      <td className="py-2 px-3 font-medium">{payment.month}</td>
                      <td className="py-2 px-3 text-primary font-semibold">
                        {formatPKR(payment.payment || payment.amount)}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {formatPKR(payment.fullSalary || payment.amount)}
                      </td>
                      <td
                        className={`py-2 px-3 font-semibold ${
                          (payment.dueSalary || 0) > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {formatPKR(payment.dueSalary || 0)}
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                          {payment.method}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            paymentTypeColors[payment.paymentType] || "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {payment.paymentType || "Full Salary"}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[payment.status] || "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {payment.status || "Paid"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
