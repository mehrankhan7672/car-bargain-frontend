import { cn } from "@/lib/utils";
import { business } from "@/data/dummy";

export function Logo({
  className,
  showText = true,
  tone = "light",
  size = "md",
  title,
  subtitle,
  initials,
  imageUrl,
}: {
  className?: string;
  showText?: boolean;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  /** Overrides the business name, e.g. the logged-in user's bargain name. */
  title?: string;
  /** Overrides the small tagline under the name. */
  subtitle?: string;
  /** Overrides the initials shown when there's no logo image. */
  initials?: string;
  /** Real uploaded logo image URL. When set, this replaces the initials box. */
  imageUrl?: string;
}) {
  const box =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";

  const displayName = title || business.name;
  const displaySubtitle = subtitle || business.tagline;
  const displayInitials = initials || business.logoText;

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={displayName}
          className={cn("shrink-0 rounded-xl border border-gold/40 object-cover", box)}
        />
      ) : (
        <div
          className={cn(
            "grid shrink-0 place-items-center rounded-xl border border-gold/40 bg-gradient-to-br from-gold/25 to-transparent font-display font-bold tracking-tight text-gold",
            box,
          )}
        >
          {displayInitials}
        </div>
      )}
      {showText && (
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-display font-semibold leading-tight",
              size === "lg" ? "text-xl" : "text-sm",
              tone === "light" ? "text-sidebar-foreground" : "text-foreground",
            )}
          >
            {displayName}
          </p>
          <p className="truncate text-[11px] uppercase tracking-[0.18em] text-gold">
            {displaySubtitle}
          </p>
        </div>
      )}
    </div>
  );
}
