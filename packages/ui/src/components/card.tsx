"use client";

import type { PropsWithChildren, ReactElement } from "react";
import { cn } from "../cn";

export interface CardProps {
  className?: string;
  hoverable?: boolean;
}

export function Card({
  children,
  className,
  hoverable,
}: PropsWithChildren<CardProps>): ReactElement {
  return (
    <article
      className={cn(
        "relative overflow-hidden bg-bg-card border border-line rounded-[var(--radius-lg)] p-5 md:p-6 flex flex-col gap-4 transition-all duration-200 shadow-[0_16px_40px_var(--color-shadow-panel)] backdrop-blur-[var(--blur-soft)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,var(--color-line-strongest),transparent)] before:content-['']",
        hoverable &&
          "hover:bg-bg-card-hover hover:border-line-strong hover:-translate-y-px hover:shadow-[0_22px_48px_var(--color-shadow-xl)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-bg-card-tint),transparent_40%)] opacity-80" />
      <div className="relative flex flex-col gap-4">{children}</div>
    </article>
  );
}
