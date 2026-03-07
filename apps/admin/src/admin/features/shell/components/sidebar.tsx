"use client";

import { memo } from "react";

import { MineRelayLogo } from "@/admin/shared/ui/minerelay-logo";
import { useAdminStore } from "@/admin/shared/store/admin-store";

const NAV_ITEMS = [
  { view: "overview", label: "Overview", icon: "dashboard" },
  { view: "identity", label: "Identity", icon: "fingerprint" },
  { view: "assets", label: "Assets", icon: "deployed_code" },
  { view: "fancy", label: "Fancy Menu", icon: "auto_awesome" },
  { view: "servers", label: "Servers", icon: "dns" },
  { view: "launcher", label: "Launcher", icon: "rocket_launch" },
] as const;

const STAT_ITEMS = [
  { key: "mods", icon: "extension", label: "Mods" },
  { key: "resources", icon: "texture", label: "Resources" },
  { key: "shaders", icon: "blur_on", label: "Shaders" },
] as const;

export const Sidebar = memo(function Sidebar() {
  const {
    view,
    setView,
    rail,
    selectedMods,
    selectedResources,
    selectedShaders,
    hasPendingPublish,
    isBusy,
  } = useAdminStore();

  const counts: Record<string, number> = {
    mods: selectedMods.length,
    resources: selectedResources.length,
    shaders: selectedShaders.length,
  };

  return (
    <aside className="border border-[var(--color-line)] rounded-[var(--radius-xl)] bg-[var(--color-bg-surface)] backdrop-blur-[var(--blur-glass)] p-5 grid grid-rows-[auto_1fr_auto] gap-6 animate-[fadeIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-line)]">
        <div className="relative shrink-0">
          <div className="absolute -inset-1.5 rounded-xl bg-[#51C878]/15 blur-lg" />
          <MineRelayLogo size={34} className="relative" />
        </div>
        <div className="grid gap-0.5 min-w-0">
          <h1 className="m-0 text-sm font-bold bg-gradient-to-br from-white via-white to-emerald-300 text-transparent bg-clip-text leading-tight truncate">
            MineRelay
          </h1>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--color-text-muted)] font-medium leading-tight">
            Admin Panel
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="grid content-start gap-1" aria-label="Sections">
        {NAV_ITEMS.map((item) => {
          const active = view === item.view;
          return (
            <button
              key={item.view}
              className={[
                "group relative flex items-center gap-3 w-full rounded-[var(--radius-md)] px-3 py-2.5 text-[0.85rem] font-medium text-left cursor-pointer transition-all duration-150 ease-out border border-transparent",
                active
                  ? "bg-gradient-to-r from-[rgba(99,102,241,0.15)] to-[rgba(99,102,241,0.03)] border-[rgba(99,102,241,0.2)] text-white font-semibold"
                  : "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] hover:text-white",
                "before:absolute before:left-0 before:top-1/4 before:bottom-1/4 before:w-[3px] before:rounded-r before:bg-[var(--color-brand-primary)] before:transition-transform before:duration-150",
                active
                  ? "before:scale-y-100"
                  : "before:scale-y-0 hover:before:scale-y-50",
              ].join(" ")}
              type="button"
              onClick={() => setView(item.view)}
            >
              <span
                className={[
                  "material-symbols-outlined text-[20px] transition-colors duration-150",
                  active
                    ? "text-[var(--color-brand-accent)]"
                    : "text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-accent)]",
                ].join(" ")}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Runtime Stats ── */}
      <div className="grid gap-2">
        {isBusy.bootstrap ? (
          <>
            {/* Version skeleton */}
            <div className="bg-black/20 border border-[var(--color-line)] rounded-[var(--radius-md)] p-3 grid gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-white/[0.06] animate-pulse shrink-0" />
                <div className="h-3.5 w-24 rounded bg-white/[0.06] animate-pulse" />
              </div>
              <div className="h-px bg-[var(--color-line)]" />
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-white/[0.06] animate-pulse shrink-0" />
                <div className="h-3.5 w-28 rounded bg-white/[0.06] animate-pulse" />
              </div>
            </div>
            {/* Asset counts skeleton */}
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-black/20 border border-[var(--color-line)] rounded-[var(--radius-sm)] py-2 px-1 grid place-items-center gap-1"
                >
                  <div className="w-4 h-4 rounded bg-white/[0.06] animate-pulse" />
                  <div className="w-5 h-3.5 rounded bg-white/[0.06] animate-pulse" />
                  <div className="w-10 h-2 rounded bg-white/[0.06] animate-pulse" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Version info */}
            <div className="bg-black/20 border border-[var(--color-line)] rounded-[var(--radius-md)] p-3 grid gap-2">
              <div className="flex items-center gap-2 text-[0.78rem]">
                <span className="material-symbols-outlined text-[14px] text-[var(--color-text-muted)]">
                  sports_esports
                </span>
                <span className="text-[var(--color-text-primary)] font-mono font-medium">
                  {rail.minecraft}
                </span>
              </div>
              <div className="h-px bg-[var(--color-line)]" />
              <div className="flex items-center gap-2 text-[0.78rem]">
                <span className="material-symbols-outlined text-[14px] text-[var(--color-text-muted)]">
                  memory
                </span>
                <span className="text-[var(--color-text-primary)] font-mono font-medium">
                  {rail.fabric}
                </span>
              </div>
            </div>

            {/* Asset counts */}
            <div className="grid grid-cols-3 gap-1.5">
              {STAT_ITEMS.map((s) => (
                <div
                  key={s.key}
                  className="bg-black/20 border border-[var(--color-line)] rounded-[var(--radius-sm)] py-2 px-1 grid place-items-center gap-0.5 overflow-hidden"
                >
                  <span className="material-symbols-outlined text-[16px] text-[var(--color-text-muted)]">
                    {s.icon}
                  </span>
                  <span className="text-[0.8rem] font-semibold text-[var(--color-text-primary)] leading-none">
                    {counts[s.key]}
                  </span>
                  <span className="text-[0.55rem] text-[var(--color-text-muted)] uppercase tracking-tight leading-none truncate max-w-full">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Pending publish warning */}
            {hasPendingPublish && (
              <div className="flex items-center gap-2 text-[0.78rem] font-semibold rounded-[var(--radius-sm)] px-3 py-2 bg-amber-500/5 border border-amber-500/20 text-amber-400">
                <span className="material-symbols-outlined text-[16px]">
                  publish
                </span>
                Requires Publish
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
});
