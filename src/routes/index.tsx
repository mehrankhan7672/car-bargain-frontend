import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, CheckCircle2, Repeat2, Wallet, UserCog, Users, Plus, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { Logo } from "@/components/brand/Logo";
import {
  business,
  cars,
  dealers,
  employees,
  exchanges,
  expenses,
  expenseTrend,
  formatPKR,
  monthlySales,
  recentActivity,
} from "@/data/dummy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Car Bargain Manager" },
      {
        name: "description",
        content:
          "Showroom dashboard with total cars, sold cars, exchanges, expenses, staff and live sales charts.",
      },
      { property: "og:title", content: "Dashboard — Car Bargain Manager" },
      {
        property: "og:description",
        content: "Showroom overview: cars, exchanges, expenses, employees and sales analytics.",
      },
    ],
  }),
  component: Dashboard,
});

const pieColors = ["var(--success)", "var(--gold)", "var(--chart-2)"];

function Dashboard() {
  const sold = cars.filter((c) => c.status === "Sold").length;
  const exchanged = cars.filter((c) => c.status === "Exchanged").length;
  const available = cars.filter((c) => c.status === "Available").length;
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  const pieData = [
    { name: "Available", value: available },
    { name: "Sold", value: sold },
    { name: "Exchanged", value: exchanged },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="card-soft mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-gold/30 bg-gradient-to-r from-gold-soft/60 to-transparent p-5 sm:flex sm:justify-between">
        <Logo size="lg" tone="dark" />
        <Button asChild className="rounded-xl">
          <Link to="/cars/new">
            <Plus className="h-4 w-4" /> Add New Car
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Cars"
          value={cars.length}
          icon={Car}
          hint="In showroom record"
          accent
        />
        <StatCard label="Cars Sold" value={sold} icon={CheckCircle2} hint="This year" />
        <StatCard
          label="Total Exchanges"
          value={exchanges.length}
          icon={Repeat2}
          hint="Deals done"
        />
        <StatCard
          label="Total Expenses"
          value={formatPKR(totalExpense)}
          icon={Wallet}
          hint="All categories"
        />
        <StatCard
          label="Total Employees"
          value={employees.length}
          icon={UserCog}
          hint="Working staff"
        />
        <StatCard
          label="Total Dealers"
          value={dealers.length}
          icon={Users}
          hint="Partner dealers"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card-soft p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Monthly Sales</h2>
              <p className="text-xs text-muted-foreground">Cars sold each month</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
              <TrendingUp className="h-3.5 w-3.5" /> +18%
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="sales" fill="var(--gold)" radius={[8, 8, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-5">
          <h2 className="text-lg font-semibold">Car Status</h2>
          <p className="text-xs text-muted-foreground">Available / Sold / Exchanged</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={4}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} stroke="var(--card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {pieData.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: pieColors[i] }} />
                  {d.name}
                </span>
                <span className="font-semibold">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card-soft p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Expense Trend</h2>
          <p className="mb-4 text-xs text-muted-foreground">Monthly expenses in thousands (PKR)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenseTrend}>
                <defs>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--gold)"
                  strokeWidth={2.5}
                  fill="url(#expenseFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft p-5">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="mb-4 text-xs text-muted-foreground">Latest work in {business.name}</p>
          <ol className="space-y-4">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.meta} · {a.time}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
