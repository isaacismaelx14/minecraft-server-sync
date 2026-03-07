"use client";

import { memo } from "react";

/* ── Primitives ──────────────────────────────────────────────────── */

const bar =
  "rounded-[var(--radius-lg)] bg-white/5 border border-[var(--color-line)] animate-pulse";
const pill =
  "rounded-[var(--radius-md)] bg-white/5 border border-[var(--color-line)] animate-pulse";
const card =
  "rounded-[var(--radius-lg)] bg-white/5 border border-[var(--color-line)] animate-pulse p-6 flex flex-col gap-4";

function Lines({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`h-3 rounded bg-white/[0.04] animate-pulse ${i === count - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/* ── Overview ────────────────────────────────────────────────────── */

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${pill} h-24`} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className={card}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] animate-pulse" />
              <div className="h-4 w-28 rounded bg-white/[0.04] animate-pulse" />
            </div>
            <Lines count={3} />
          </div>
        ))}
      </div>
      <div className={card}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] animate-pulse" />
          <div className="h-4 w-24 rounded bg-white/[0.04] animate-pulse" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] animate-pulse shrink-0" />
            <div className="h-3 flex-1 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Identity ────────────────────────────────────────────────────── */

function IdentitySkeleton() {
  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map((i) => (
          <div key={i} className={card}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-white/[0.04] animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-32 rounded bg-white/[0.04] animate-pulse" />
                <div className="h-2.5 w-48 rounded bg-white/[0.04] animate-pulse" />
              </div>
            </div>
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex flex-col gap-1.5">
                <div className="h-2.5 w-24 rounded bg-white/[0.04] animate-pulse" />
                <div className={`${pill} h-11`} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={card}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-white/[0.04] animate-pulse" />
          <div className="h-4 w-36 rounded bg-white/[0.04] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className={`${pill} h-28`} />
          <div className={`${pill} h-28`} />
        </div>
      </div>
    </div>
  );
}

/* ── Assets ──────────────────────────────────────────────────────── */

function AssetsSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-24 rounded bg-white/[0.04] animate-pulse" />
        <div className="h-3 w-72 rounded bg-white/[0.04] animate-pulse" />
      </div>
      <div className={`${pill} h-11`} />
      {["Mods", "Resourcepacks", "Shaderpacks"].map((s) => (
        <div key={s} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-20 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-5 w-16 rounded-full bg-white/[0.04] animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-3 px-4 rounded-xl border border-white/[0.04]"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] animate-pulse shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3.5 w-28 rounded bg-white/[0.04] animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-white/[0.04] animate-pulse" />
              </div>
              <div className="h-7 w-32 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Fancy Menu ──────────────────────────────────────────────────── */

function FancyMenuSkeleton() {
  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={card}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-white/[0.04] animate-pulse" />
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-28 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-2.5 w-56 rounded bg-white/[0.04] animate-pulse" />
            </div>
          </div>
          <div className={`${pill} h-14`} />
          <div className={`${pill} h-11`} />
        </div>
        <div className={card}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-white/[0.04] animate-pulse" />
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-36 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-2.5 w-48 rounded bg-white/[0.04] animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`${pill} h-20`} />
            <div className={`${pill} h-20`} />
          </div>
        </div>
      </div>
      <div className={card}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-white/[0.04] animate-pulse" />
          <div className="h-4 w-32 rounded bg-white/[0.04] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-28 rounded bg-white/[0.04] animate-pulse" />
            <div className={`${pill} h-11`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-24 rounded bg-white/[0.04] animate-pulse" />
            <div className={`${pill} h-11`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Servers ─────────────────────────────────────────────────────── */

function ServersSkeleton() {
  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={card}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-white/[0.04] animate-pulse" />
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-36 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-2.5 w-52 rounded bg-white/[0.04] animate-pulse" />
            </div>
          </div>
          <div className={`${pill} h-16`} />
        </div>
        <div className={card}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-white/[0.04] animate-pulse" />
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-32 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-2.5 w-44 rounded bg-white/[0.04] animate-pulse" />
            </div>
          </div>
          <div className={`${pill} h-16`} />
        </div>
      </div>
      <div className={card}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-white/[0.04] animate-pulse" />
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-40 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-2.5 w-56 rounded bg-white/[0.04] animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className={`${pill} h-14`} />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`${pill} h-10`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Launcher ────────────────────────────────────────────────────── */

function LauncherSkeleton() {
  return (
    <div className="grid gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 rounded bg-white/[0.04] animate-pulse" />
        <div className="h-3 w-80 rounded bg-white/[0.04] animate-pulse" />
      </div>
      <div className={card}>
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-line)]">
          <div className="h-5 w-32 rounded bg-white/[0.04] animate-pulse" />
          <div className="h-9 w-20 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse" />
        </div>
        <div className="h-3 w-96 rounded bg-white/[0.04] animate-pulse" />
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-36 rounded bg-white/[0.04] animate-pulse" />
          <div className={`${pill} h-11`} />
        </div>
        <div className="flex gap-4 pt-2">
          <div className="h-11 w-48 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse" />
          <div className="h-11 w-40 rounded-[var(--radius-md)] bg-white/[0.04] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ── Dispatcher ──────────────────────────────────────────────────── */

type AdminView =
  | "overview"
  | "identity"
  | "assets"
  | "fancy"
  | "servers"
  | "launcher";

export const MainLoadingState = memo(function MainLoadingState({
  view,
}: {
  view?: AdminView;
}) {
  return (
    <div
      className="animate-[fadeIn_0.2s_ease-out]"
      role="status"
      aria-live="polite"
    >
      {view === "overview" && <OverviewSkeleton />}
      {view === "identity" && <IdentitySkeleton />}
      {view === "assets" && <AssetsSkeleton />}
      {view === "fancy" && <FancyMenuSkeleton />}
      {view === "servers" && <ServersSkeleton />}
      {view === "launcher" && <LauncherSkeleton />}
      {!view && <OverviewSkeleton />}
    </div>
  );
});
