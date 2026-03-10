"use client";

import type { ReactElement, ReactNode } from "react";
import { cn } from "../cn";

export interface SettingRowProps {
  title: string;
  description: string;
  control: ReactNode;
  className?: string;
}

export function SettingRow({
  title,
  description,
  control,
  className,
}: SettingRowProps): ReactElement {
  return (
    <div
      className={cn(
        `mt-1 grid gap-4 rounded-md border border-line bg-surface-deep-20 p-4 shadow-[inset_0_1px_0_var(--color-line-subtle)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center`,
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <span className="max-w-[60ch] text-xs leading-5 text-text-secondary">
          {description}
        </span>
      </div>
      <div className="justify-self-start sm:justify-self-end">{control}</div>
    </div>
  );
}
