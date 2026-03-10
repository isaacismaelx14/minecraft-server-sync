"use client";

import type { ReactElement } from "react";

export interface InfoRowProps {
  label: string;
  value: string | number;
  highlight?: "success" | "warning";
}

export function InfoRow({
  label,
  value,
  highlight,
}: InfoRowProps): ReactElement {
  return (
    <div className="grid gap-2 rounded-[var(--radius-md)] border border-line bg-surface-deep-20 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
        {label}
      </span>
      <span
        className={`text-sm font-medium truncate text-right ${
          highlight === "success"
            ? "text-success-bright"
            : highlight === "warning"
              ? "text-warning-bright"
              : "text-text-primary"
        }`}
      >
        {value || "-"}
      </span>
    </div>
  );
}
