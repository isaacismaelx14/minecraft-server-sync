import type { ReactElement } from "react";

import { MainLoadingState } from "./main-loading-state";

function SidebarSkeleton(): ReactElement {
  return (
    <aside className="h-full rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-bg-surface)] p-5 flex flex-col gap-4">
      <div className="h-10 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse" />
      <div className="h-16 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse" />
      <div className="h-16 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse" />
      <div className="h-16 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse" />
      <div className="h-16 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse" />
    </aside>
  );
}

function TopBarSkeleton(): ReactElement {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="h-8 w-56 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse" />
      <div className="h-10 w-40 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse" />
    </div>
  );
}

export function AdminRouteLoadingShell(): ReactElement {
  return (
    <div className="grid grid-cols-[240px_minmax(0,1fr)] h-screen p-[32px] gap-[32px] overflow-hidden">
      <SidebarSkeleton />
      <main className="border border-[var(--color-line)] rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] backdrop-blur-[var(--blur-glass)] py-[32px] px-[40px] h-full overflow-hidden grid grid-rows-[auto_1fr] gap-[32px]">
        <TopBarSkeleton />
        <section aria-live="polite">
          <MainLoadingState />
        </section>
      </main>
    </div>
  );
}
