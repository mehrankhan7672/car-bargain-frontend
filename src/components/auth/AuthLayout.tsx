import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 lg:flex">
        <Logo size="lg" />
        <div>
          <h2 className="max-w-sm font-display text-3xl font-bold text-sidebar-foreground">
            Run your car showroom without any tension.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-sidebar-foreground/70">
            Cars, exchanges, dealers, expenses, staff and salaries — all in one simple dashboard.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© 2026 Car Bargain Manager</p>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo size="lg" tone="dark" />
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}
