import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";

export function AppScreen({
  title,
  subtitle,
  back = "/home",
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-brand sticky top-0 z-20 rounded-b-3xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 pt-[max(0.9rem,env(safe-area-inset-top))] pb-5">
          <Link
            to={back}
            className="press flex size-10 shrink-0 items-center justify-center rounded-full bg-[oklch(1_0_0/0.16)] text-primary-foreground"
            aria-label="Voltar"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-extrabold text-primary-foreground">{title}</h1>
            {subtitle && (
              <p className="truncate text-xs text-[oklch(1_0_0/0.75)]">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 pt-5 pb-[max(7rem,calc(6rem+env(safe-area-inset-bottom)))]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border-0 bg-card px-4 py-3.5 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/35 transition";
