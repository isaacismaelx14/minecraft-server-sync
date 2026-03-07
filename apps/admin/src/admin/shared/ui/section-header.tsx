"use client";

import type { ReactElement, ReactNode } from "react";

export function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}): ReactElement {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5 w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 grid place-items-center text-[var(--color-brand-primary)]">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-tight tracking-tight m-0">
          {title}
        </h3>
        <p className="m-0 mt-1 text-sm text-[var(--color-text-muted)] leading-snug">
          {description}
        </p>
      </div>
    </div>
  );
}
