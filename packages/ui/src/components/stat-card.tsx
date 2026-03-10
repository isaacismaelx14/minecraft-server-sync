"use client";

import type { ReactElement } from "react";
import { cn } from "../cn";

const toneClasses = {
  emerald: {
    bg: "bg-[linear-gradient(135deg,var(--color-success-bg),transparent)]",
    text: "text-success-bright",
    border: "border-success-border-strong",
    glow: "shadow-[0_10px_30px_var(--color-success-shadow-soft)]",
    accent: "bg-success-bright",
  },
  red: {
    bg: "bg-[linear-gradient(135deg,var(--color-danger-bg),transparent)]",
    text: "text-danger-bright",
    border: "border-danger-border-strong",
    glow: "shadow-[0_10px_30px_var(--color-danger-shadow-soft)]",
    accent: "bg-danger-bright",
  },
  amber: {
    bg: "bg-[linear-gradient(135deg,var(--color-warning-bg),transparent)]",
    text: "text-warning-bright",
    border: "border-warning-border-strong",
    glow: "shadow-[0_10px_30px_var(--color-warning-shadow-soft)]",
    accent: "bg-warning-bright",
  },
  indigo: {
    bg: "bg-[linear-gradient(135deg,var(--color-brand-indigo-bg),transparent)]",
    text: "text-brand-indigo",
    border: "border-brand-indigo-border",
    glow: "shadow-[0_10px_30px_var(--color-brand-indigo-shadow)]",
    accent: "bg-brand-indigo",
  },
} as const;

export type StatCardTone = keyof typeof toneClasses;

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  tone: StatCardTone;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  tone,
  className,
}: StatCardProps): ReactElement {
  const classes = toneClasses[tone];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border p-5 text-left transition-all duration-200 hover:-translate-y-px hover:shadow-[0_18px_36px_var(--color-shadow-xl)]",
        classes.border,
        classes.bg,
        classes.glow,
        className,
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1 opacity-80",
          classes.accent,
        )}
      />
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          classes.bg,
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.16em] opacity-80",
              classes.text,
            )}
          >
            {label}
          </span>
          <div className="mt-3 flex items-end gap-3">
            <span className="font-mono text-[2.2rem] font-bold leading-none tracking-tight text-white tabular-nums sm:text-[2.45rem]">
              {value}
            </span>
          </div>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line bg-surface-soft shadow-[inset_0_1px_0_var(--color-line-strong)]">
          <span
            className={cn(
              "material-symbols-outlined text-[22px] opacity-80",
              classes.text,
            )}
          >
            {icon}
          </span>
        </div>
      </div>
      <div className="relative mt-4 h-px w-full bg-line-subtle" />
      <p className="relative text-sm leading-6 text-text-secondary">
        Live package metric surface for shared dashboards.
      </p>
    </div>
  );
}
