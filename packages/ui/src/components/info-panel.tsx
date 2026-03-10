"use client";

import type { ReactElement, ReactNode } from "react";
import { Button } from "./button";
import { cn } from "../cn";

export interface InfoPanelProps {
  icon: string;
  title: string;
  iconClassName?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  className?: string;
}

export function InfoPanel({
  icon,
  title,
  iconClassName,
  actionLabel,
  onAction,
  children,
  className,
}: InfoPanelProps): ReactElement {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-lg)] border border-line bg-bg-card-strong p-5 md:p-6 flex flex-col gap-5 transition-all duration-200 shadow-[0_16px_40px_var(--color-shadow-panel)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,var(--color-line-strongest),transparent)] before:content-[''] hover:border-line-hover hover:shadow-[0_20px_44px_var(--color-shadow-xl)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-bg-card-tint),transparent_42%)] opacity-90" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-line bg-surface-soft shadow-[inset_0_1px_0_var(--color-line-strong)]",
              iconClassName,
            )}
          >
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </div>
          <div className="min-w-0">
            <h3 className="m-0 truncate text-base font-semibold text-white">
              {title}
            </h3>
            <p className="m-0 mt-1 text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
              Shared system panel
            </p>
          </div>
        </div>
        {actionLabel && onAction ? (
          <Button variant="outline" size="xs" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
      <div className="relative flex flex-col gap-3">{children}</div>
    </article>
  );
}
