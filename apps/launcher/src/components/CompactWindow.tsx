import clsx from "clsx";
import { useCallback, useMemo } from "react";
import { Button, CompactStat, Select } from "@minerelay/ui";
import type { useAppCore } from "../hooks/useAppCore";
import { formatTime } from "../utils";
import { ServerControlBar } from "./ServerControlBar";

const compactServerBadgeToneClasses = {
  online: "border-success-border bg-success-bg text-success-bright",
  offline: "border-line bg-surface-subtle text-text-muted",
  busy: "border-warning-border bg-warning-bg text-warning-bright",
  error: "border-danger-border bg-danger-bg text-danger-soft-text",
  disabled: "border-danger-border bg-danger-bg text-danger-soft-text",
  unknown: "border-line bg-surface-subtle text-text-secondary",
} as const;

export function CompactWindow({
  core,
}: {
  core: ReturnType<typeof useAppCore>;
}) {
  const {
    APP_NAME,
    SERVER_ID,
    catalog,
    sessionStatus,
    lastCheckAt,
    isChecking,
    launcherAppVersion,
    canRenderLogo,
    markLogoAsBroken,
    serverInitial,
    compactPlaying,
    runSyncCycle,
    openLauncherFromCompact,
    openSetupWindow,
    cancelSession,
    settings,
    launchers,
    updateLauncherSelection,
    isApiSourceMode,
    launcherServerControls,
    isServerActionBusy,
    runLauncherServerAction,
    isActionBusy,
  } = core;

  const filteredLaunchers = useMemo(
    () => launchers.filter((candidate) => candidate.id !== "custom"),
    [launchers],
  );
  const launcherOptions = useMemo(
    () => [
      { value: "", label: "Select Launcher" },
      ...filteredLaunchers.map((candidate) => ({
        value: candidate.id,
        label: candidate.name,
      })),
      { value: "custom", label: "Custom path..." },
    ],
    [filteredLaunchers],
  );

  const handleLauncherChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      void updateLauncherSelection(value);
      if (value === "custom") {
        void openSetupWindow();
      }
    },
    [updateLauncherSelection, openSetupWindow],
  );

  const compactHasServerInfo = catalog !== null;
  const compactNeedsConnect = !compactHasServerInfo;
  const isLaunching = isActionBusy("launcher:open");
  const isOpeningOverview = isActionBusy("window:openSetup");
  const isCancellingLaunch = isActionBusy("session:cancel");
  const isAwaiting = sessionStatus.phase === "awaiting_game_start";
  const statusTitle = isAwaiting
    ? "Awaiting Launch"
    : compactPlaying
      ? "Playing"
      : compactNeedsConnect
        ? "Disconnected"
        : "Ready";
  const statusSubtitle = isAwaiting
    ? "Waiting for the game process to be detected..."
    : compactPlaying
      ? "Game session is currently active."
      : compactNeedsConnect
        ? "Server info unavailable. Connect to refresh profile data."
        : `Server ${catalog?.serverName ?? SERVER_ID} is synced and ready.`;
  const canRenderLauncherStatus =
    isApiSourceMode &&
    launcherServerControls !== null &&
    launcherServerControls.permissions.canViewStatus;
  const compactCoreClassName = clsx(
    "relative flex min-h-0 flex-1 flex-col items-center justify-start gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface-deep-20 px-4 pb-[92px] pt-4 text-center",
    compactPlaying &&
      "border-success-border-strong bg-success-bg shadow-[inset_0_0_30px_var(--color-success-shadow-soft)] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_top,var(--color-success-shadow-soft),transparent_72%)] after:content-[''] after:animate-[pulseGlow_3s_infinite]",
    isAwaiting &&
      "border-info-border bg-info-tint shadow-[inset_0_0_30px_var(--color-info-tint)] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_top,var(--color-info-tint),transparent_72%)] after:content-[''] after:animate-[pulseGlow_1.5s_infinite]",
    compactNeedsConnect && "border-warning-border bg-warning-bg",
  );

  return (
    <main className="flex h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--color-brand-primary-ring),transparent_48%),radial-gradient(circle_at_bottom_right,var(--color-info-tint),transparent_55%),var(--color-bg-base)] p-2.5">
      <div className="flex h-full max-h-full w-full max-w-[406px] flex-col gap-3.5 rounded-[var(--radius-xl)] border border-line-strong bg-bg-surface p-4 shadow-[0_24px_60px_var(--color-shadow-xl),inset_0_1px_1px_var(--color-line-strong)] backdrop-blur-[20px]">
        <header className="flex shrink-0 flex-col items-stretch gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {canRenderLogo ? (
              <img
                className="h-[52px] w-[52px] shrink-0 rounded-[12px] border border-line-strong bg-bg-card object-cover shadow-[0_4px_12px_var(--color-shadow-lg)]"
                src={catalog?.logoUrl}
                alt={`${catalog?.serverName ?? SERVER_ID} logo`}
                onError={() => markLogoAsBroken(catalog?.logoUrl)}
              />
            ) : (
              <img
                className="h-[52px] w-[52px] shrink-0 rounded-[12px] border border-line-strong bg-bg-card object-cover shadow-[0_4px_12px_var(--color-shadow-lg)]"
                src="/minerelay-logo.svg"
                alt={`${APP_NAME} logo`}
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-brand-accent">
                  {APP_NAME}
                </p>
                {settings && launchers.length > 0 && (
                  <Select
                    name="compact-launcher"
                    variant="compact"
                    className="max-w-[11rem] shrink-0"
                    value={settings?.selectedLauncherId ?? ""}
                    options={launcherOptions}
                    onChange={handleLauncherChange}
                  />
                )}
              </div>
              <p
                className="overflow-hidden text-ellipsis whitespace-nowrap text-[1.15rem] leading-[1.1] font-bold text-white"
                title={catalog?.serverName ?? `Server ${SERVER_ID}`}
              >
                {catalog?.serverName ?? `Server ${SERVER_ID}`}
              </p>
              <p
                className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[0.75rem] text-text-muted"
                title={`App v${launcherAppVersion ?? "--"} · MC ${catalog?.minecraftVersion ?? "--"} · ${catalog?.loader ?? "fabric"} ${catalog?.loaderVersion ?? "--"}`}
              >
                App v{launcherAppVersion ?? "--"} · MC{" "}
                {catalog?.minecraftVersion ?? "--"} ·{" "}
                {catalog?.loader ?? "fabric"} {catalog?.loaderVersion ?? "--"}
              </p>
            </div>
          </div>
        </header>

        <section className={compactCoreClassName}>
          <div className="relative z-10 my-auto flex w-full flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2">
              <span
                className={clsx(
                  "relative h-2.5 w-2.5 rounded-full",
                  compactPlaying &&
                    "bg-success shadow-[0_0_8px_var(--color-success)] animate-[pulseGlow_2s_infinite]",
                  isAwaiting &&
                    "bg-brand-accent shadow-[0_0_8px_var(--color-brand-accent-glow)] animate-[pulseGlow_1.5s_infinite]",
                  compactNeedsConnect &&
                    "bg-warning shadow-[0_0_8px_var(--color-warning)] animate-[pulseGlow_3s_infinite]",
                  !compactPlaying &&
                    !isAwaiting &&
                    !compactNeedsConnect &&
                    "bg-brand-accent shadow-[0_0_8px_var(--color-brand-accent-glow)]",
                )}
              ></span>
              <h2>{statusTitle}</h2>
            </div>
            <p className="m-0 text-[0.8rem] leading-[1.3] text-text-secondary">
              {statusSubtitle}
            </p>
            <div className="mt-1 flex w-full flex-col items-center justify-center gap-2">
              {isAwaiting ? (
                <Button
                  variant="danger"
                  size="md"
                  className="w-full text-[0.95rem]"
                  onClick={() => void cancelSession()}
                  disabled={isCancellingLaunch}
                >
                  {isCancellingLaunch ? "Cancelling..." : "Cancel Launch"}
                </Button>
              ) : (
                <Button
                  variant={compactNeedsConnect ? "success" : "primary"}
                  effect="glass"
                  size="md"
                  className="w-full text-[0.95rem]"
                  onClick={() =>
                    compactNeedsConnect
                      ? void runSyncCycle(false)
                      : void openLauncherFromCompact()
                  }
                  disabled={
                    compactNeedsConnect
                      ? isChecking
                      : compactPlaying || isLaunching
                  }
                >
                  {compactNeedsConnect
                    ? isChecking
                      ? "Connecting..."
                      : "Connect"
                    : isLaunching
                      ? "Launching..."
                      : compactPlaying
                        ? "Playing"
                        : "Play"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="md"
                className="w-full text-[0.95rem]"
                onClick={() => void openSetupWindow()}
                disabled={isOpeningOverview}
              >
                {isOpeningOverview ? "Opening..." : "Overview"}
              </Button>
            </div>
          </div>
          {canRenderLauncherStatus ? (
            <div className="absolute inset-x-4 bottom-3 z-10">
              <ServerControlBar
                launcherServerControls={launcherServerControls}
                isServerActionBusy={isServerActionBusy}
                runLauncherServerAction={runLauncherServerAction}
                shellClassName="relative rounded-[12px] border border-dashed border-brand-indigo-border px-2 pb-2 pt-2.5"
                labelClassName="absolute left-3 top-[-9px] bg-bg-surface px-2 text-[0.66rem] font-medium uppercase tracking-[0.08em] text-brand-accent"
                controlsClassName="flex min-w-0 items-center justify-start gap-2.5 rounded-full px-2 py-2"
                statusBadgeClassName="inline-flex shrink-0 rounded-full border px-2 py-1 text-[0.75rem] leading-none"
                statusBadgeToneClassNames={compactServerBadgeToneClasses}
                statusTextClassName="min-w-0 truncate text-[0.72rem] leading-none text-text-muted"
                iconActionsClassName="ml-auto inline-flex items-center gap-1.5 border-l border-line pl-2"
                iconButtonClassName="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border border-line bg-surface-deep-20 text-[0.8rem] leading-none text-text-secondary transition-colors hover:not-disabled:border-brand-accent hover:not-disabled:text-white disabled:cursor-default disabled:opacity-50"
              />
            </div>
          ) : null}
        </section>

        <section className="grid shrink-0 grid-cols-4 gap-2">
          <CompactStat
            label="Keep"
            value={catalog?.summary.keep ?? 0}
            className="[&_strong]:text-brand-accent"
          />
          <CompactStat
            label="Add"
            value={catalog?.summary.add ?? 0}
            className="[&_strong]:text-brand-accent"
          />
          <CompactStat
            label="Remove"
            value={catalog?.summary.remove ?? 0}
            className="[&_strong]:text-brand-accent"
          />
          <CompactStat
            label="Update"
            value={catalog?.summary.update ?? 0}
            className="[&_strong]:text-brand-accent"
          />
        </section>

        <footer className="flex shrink-0 items-center justify-between gap-2 font-mono text-[0.75rem] text-text-muted">
          <p>Session: {sessionStatus.phase.replaceAll("_", " ")}</p>
          <p>Last check: {formatTime(lastCheckAt)}</p>
        </footer>
      </div>
    </main>
  );
}
