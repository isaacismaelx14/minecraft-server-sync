"use client";

import type { ReactElement, ReactNode } from "react";
import { cn } from "../cn";

export interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function SectionHeader({
  icon,
  title,
  description,
  className,
}: SectionHeaderProps): ReactElement {
  return (
    <div className={cn("flex items-start gap-3.5", className)}>
      <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-brand-primary/20 bg-brand-primary-ring text-brand-primary shadow-[inset_0_1px_0_var(--color-line-strong)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-base font-semibold leading-tight tracking-tight">
          {title}
        </h3>
        <p className="m-0 mt-1 max-w-[65ch] text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
