import { cn } from "@/lib/utils";
import { business } from "@/data/dummy";

export function Logo({
  className,
  showText = true,
  tone = "light",
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "grid shrink-0 place-items-center rounded-xl border border-gold/40 bg-gradient-to-br from-gold/25 to-transparent font-display font-bold tracking-tight text-gold",
          box,
        )}
      >
        {business.logoText}
      </div>
      {showText && (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-display font-semibold leading-tight",
              size === "lg" ? "text-xl" : "text-sm",
              tone === "light" ? "text-sidebar-foreground" : "text-foreground",
            )}
          >
            {business.name}
          </p>
          <p className="truncate text-[11px] uppercase tracking-[0.18em] text-gold">
            {business.tagline}
          </p>
        </div>
      )}
    </div>
  );
}
