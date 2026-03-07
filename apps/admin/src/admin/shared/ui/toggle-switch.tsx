"use client";

import type { ReactElement } from "react";

export function ToggleSwitch({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}): ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
        enabled
          ? "bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)]/60 shadow-[0_0_12px_rgba(99,102,241,0.35)]"
          : "bg-white/10 border-white/[0.08]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}
