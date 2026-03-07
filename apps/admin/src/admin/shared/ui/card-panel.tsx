"use client";

import type { PropsWithChildren, ReactElement } from "react";

export function CardPanel({
  children,
  className,
}: PropsWithChildren<{ className?: string }>): ReactElement {
  return (
    <article
      className={`bg-[var(--color-bg-card)] border border-[var(--color-line)] rounded-[var(--radius-lg)] p-[24px] flex flex-col gap-[16px] transition-all duration-150${className ? ` ${className}` : ""}`}
    >
      {children}
    </article>
  );
}
