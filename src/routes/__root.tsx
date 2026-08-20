import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
  redirect,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider, useAuth, type AuthContextType } from "@/contexts/AuthContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  auth: AuthContextType;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Car Bargain Manager — Dealership Software" },
      {
        name: "description",
        content:
          "Manage cars, exchanges, dealers, expenses, employees and salaries for your car showroom in one simple dashboard.",
      },
      { property: "og:title", content: "Car Bargain Manager — Dealership Software" },
      {
        property: "og:description",
        content: "Simple dealership management for cars, exchanges, dealers, expenses and staff.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.jpg", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouteGuard />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  );
}

/**
 * Single place that gates every page in the app.
 * - Unauthenticated user on a non-/auth page -> redirected to /auth/signin, nothing renders.
 * - Authenticated user on a /auth page -> redirected to /, nothing renders.
 * - While we haven't checked localStorage yet (hydrated === false) -> show a
 *   blank loading screen instead of any real page, so nothing protected is
 *   ever shown to someone who isn't authorized.
 */
function RouteGuard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthRoute = pathname.startsWith("/auth");
  const { isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated && !isAuthRoute) {
      navigate({ to: "/auth/signin", replace: true });
      return;
    }

    if (isAuthenticated && isAuthRoute) {
      navigate({ to: "/", replace: true });
    }
  }, [hydrated, isAuthenticated, isAuthRoute, navigate]);

  // Still checking localStorage — don't show anything yet.
  if (!hydrated) {
    return <FullPageLoader />;
  }

  // Not authorized and not on an auth page — a redirect was just triggered
  // above; render nothing while it happens so no protected page ever flashes.
  if (!isAuthenticated && !isAuthRoute) {
    return <FullPageLoader />;
  }

  // Logged in but sitting on an auth page — same idea, redirect is in flight.
  if (isAuthenticated && isAuthRoute) {
    return <FullPageLoader />;
  }

  return isAuthRoute ? (
    <Outlet />
  ) : (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  );
}
