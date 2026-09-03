import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PCT } from "@/lib/analytics";

export function Panel({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("panel overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            {title && (
              <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
            )}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function ShareBar({ pct }: { pct: number }) {
  return (
    <span className="flex items-center justify-end gap-2">
      <span className="hidden h-1 w-16 overflow-hidden rounded-full bg-secondary sm:block">
        <span
          className="block h-full rounded-full bg-primary"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </span>
      <span className="num w-12 text-right text-muted-foreground">{PCT(pct)}</span>
    </span>
  );
}

export function Rank({ i }: { i: number }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
        i === 0
          ? "border-gold/40 bg-gold/15 text-gold"
          : i < 3
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-secondary text-muted-foreground",
      )}
    >
      {i + 1}
    </span>
  );
}

export function ClassBadge({ classe }: { classe: "A" | "B" | "C" }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded px-1.5 text-[10px] font-bold",
        classe === "A"
          ? "bg-primary/15 text-primary"
          : classe === "B"
            ? "bg-gold/15 text-gold"
            : "bg-secondary text-muted-foreground",
      )}
    >
      {classe}
    </span>
  );
}
