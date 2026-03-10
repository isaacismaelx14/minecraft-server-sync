import { Card, Details, ProgressBar } from "@minerelay/ui";
import { ServerControlBar } from "../ServerControlBar";
import { bytesToHuman, formatEta } from "../../utils";
import type { DesktopWorkspaceCore, DesktopWorkspacePageStyles } from "./types";
export function OverviewPage({
  core,
  styles,
}: {
  core: DesktopWorkspaceCore;
  styles: DesktopWorkspacePageStyles;
}) {
  const {
    blockClass,
    subtitleClass,
    paneGridClass,
    panelCardClass,
    h3Class,
    dataListClass,
    dataItemClass,
    dataLabelClass,
    dataValueClass,
    summaryGridClass,
    summaryItemClass,
    summaryValueClass,
    summaryLabelClass,
    overviewListClass,
    overviewChipClass,
    detailsClass,
    metricsClass,
    actionsRowClass,
    ghostButtonClass,
    primaryButtonClass,
  } = styles;

  const {
    screen,
    sync,
    hasSyncTotal,
    progressPercent,
    syncHasUnknownTotal,
    syncBytesLabel,
    sessionStatus,
    catalog,
    isApiSourceMode,
    launcherServerControls,
    isServerActionBusy,
    runLauncherServerAction,
    sessionActive,
    hasFancyMenuMod,
    fancyMenuMode,
    hasFancyMenuCustomBundle,
    isChecking,
    sourceLabel,
    settings,
    versionReadiness,
    instance,
    isActionBusy,
    diskConflictReport,
    checkDiskConflicts,
    fixDiskConflicts,
    dismissDiskConflictReport,
    fixConflictsResult,
    dismissFixConflictsResult,
  } = core;

  if (screen === "booting") {
    return (
      <div className={blockClass}>
        <h2 className="text-[1.4rem] font-semibold tracking-[0.01em] text-white">
          Checking Server State
        </h2>
        <p className={subtitleClass}>
          Loading remote profile lock, comparing local manifest, and evaluating
          updates.
        </p>
      </div>
    );
  }

  if (screen === "syncing") {
    return (
      <div className={blockClass}>
        <h2 className="text-[1.4rem] font-semibold tracking-[0.01em] text-white">
          Applying Sync
        </h2>
        <p className={subtitleClass}>
          {sync.phase === "committing"
            ? "Committing changes..."
            : "Downloading mods..."}
        </p>
        <ProgressBar
          value={progressPercent}
          indeterminate={syncHasUnknownTotal}
          ariaValueText={
            syncHasUnknownTotal ? "Download progress total unknown" : undefined
          }
        />
        <div className={metricsClass}>
          <span>{syncBytesLabel}</span>
          <span>{bytesToHuman(sync.speedBps)}/s</span>
          <span>ETA {formatEta(sync.etaSec)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={blockClass}>
      <div className="flex items-center justify-between gap-3 max-[1080px]:flex-col-reverse max-[1080px]:items-start">
        <h2 className="text-[1.4rem] font-semibold tracking-[0.01em] text-white">
          {sessionStatus.phase === "playing"
            ? "Playing"
            : catalog?.hasUpdates
              ? "Updates Detected"
              : "Instance Up to Date"}
        </h2>
        {isApiSourceMode && launcherServerControls ? (
          <div className="shrink-0 max-[1080px]:w-full">
            <ServerControlBar
              launcherServerControls={launcherServerControls}
              isServerActionBusy={isServerActionBusy}
              runLauncherServerAction={runLauncherServerAction}
              variant="desktop"
            />
          </div>
        ) : null}
      </div>
      <p className={subtitleClass}>
        {sessionActive
          ? `Live session active in ${sessionStatus.liveMinecraftDir ?? "Minecraft directory"}.`
          : catalog?.hasUpdates
            ? "New server changes were detected. Run Sync to apply updates now."
            : "All mods/resourcepacks/shaders/configs match server profile."}
      </p>
      {catalog?.fancyMenuEnabled && !hasFancyMenuMod ? (
        <p
          className="text-[0.9rem] leading-[1.5] text-[var(--color-text-secondary)]"
          style={{ color: "#b84e4e" }}
        >
          Profile has no FancyMenu mod. Play-only menu customization will not be
          active.
        </p>
      ) : null}
      {catalog?.fancyMenuEnabled &&
      hasFancyMenuMod &&
      fancyMenuMode === "custom" &&
      !hasFancyMenuCustomBundle ? (
        <p
          className="text-[0.9rem] leading-[1.5] text-[var(--color-text-secondary)]"
          style={{ color: "#b84e4e" }}
        >
          FancyMenu custom mode is enabled, but the custom bundle is missing.
        </p>
      ) : null}
      {isChecking ? (
        <p className="text-[0.9rem] leading-[1.5] text-[var(--color-text-secondary)]">
          Checking server changes...
        </p>
      ) : null}

      <ul className={summaryGridClass}>
        <li className={summaryItemClass}>
          <strong className={summaryValueClass}>
            {catalog?.summary.add ?? 0}
          </strong>
          <span className={summaryLabelClass}>Add</span>
        </li>
        <li className={summaryItemClass}>
          <strong className={summaryValueClass}>
            {catalog?.summary.remove ?? 0}
          </strong>
          <span className={summaryLabelClass}>Remove</span>
        </li>
        <li className={summaryItemClass}>
          <strong className={summaryValueClass}>
            {catalog?.summary.update ?? 0}
          </strong>
          <span className={summaryLabelClass}>Update</span>
        </li>
        <li className={summaryItemClass}>
          <strong className={summaryValueClass}>
            {catalog?.summary.keep ?? 0}
          </strong>
          <span className={summaryLabelClass}>Keep</span>
        </li>
      </ul>

      {/* Fix Conflicts action row */}
      <div className={actionsRowClass}>
        <button
          className={ghostButtonClass}
          onClick={() => void checkDiskConflicts()}
          disabled={
            isActionBusy("disk:checkConflicts") ||
            isActionBusy("disk:fixConflicts")
          }
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {isActionBusy("disk:checkConflicts")
            ? "Scanning..."
            : "Check Conflicts"}
        </button>
      </div>

      {/* Disk conflict report panel */}
      {diskConflictReport ? (
        <Card className={panelCardClass}>
          <div className="flex items-start justify-between gap-3">
            <h3 className={h3Class}>
              {diskConflictReport.hasConflicts
                ? "Conflicts Detected"
                : "No Conflicts Found"}
            </h3>
            <button
              onClick={dismissDiskConflictReport}
              aria-label="Dismiss conflict report"
              className="shrink-0 rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {!diskConflictReport.hasConflicts ? (
            <p
              className={subtitleClass}
              style={{ color: "var(--color-success)" }}
            >
              All mods on disk match the server profile. No extra or missing
              files detected.
            </p>
          ) : null}

          {diskConflictReport.extraFiles.length > 0 ? (
            <div>
              <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-[#e0a84a]">
                Extra files ({diskConflictReport.extraFiles.length}) — may be
                from a different Minecraft/Fabric/Forge version
              </p>
              <div className={overviewListClass}>
                {diskConflictReport.extraFiles.map((f) => (
                  <span
                    key={f.filename}
                    className="rounded-[8px] border border-[rgba(224,168,74,0.3)] bg-[rgba(224,168,74,0.08)] px-2.5 py-1.5 font-mono text-[0.78rem] text-[#e0a84a]"
                  >
                    {f.filename}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {diskConflictReport.missingFiles.length > 0 ? (
            <div>
              <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-[#b84e4e]">
                Missing files ({diskConflictReport.missingFiles.length}) —
                required by server profile
              </p>
              <div className={overviewListClass}>
                {diskConflictReport.missingFiles.map((f) => (
                  <span
                    key={f.filename}
                    className="rounded-[8px] border border-[rgba(184,78,78,0.3)] bg-[rgba(184,78,78,0.08)] px-2.5 py-1.5 font-mono text-[0.78rem] text-[#e07a7a]"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {diskConflictReport.hasConflicts ? (
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                className={primaryButtonClass}
                onClick={() => void fixDiskConflicts()}
                disabled={
                  isActionBusy("disk:fixConflicts") ||
                  isActionBusy("disk:checkConflicts")
                }
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {isActionBusy("disk:fixConflicts")
                  ? "Fixing..."
                  : `Fix Conflicts${diskConflictReport.extraFiles.length > 0 ? ` (move ${diskConflictReport.extraFiles.length} extra to _mvl_orphaned)` : ""}${diskConflictReport.missingFiles.length > 0 ? " + sync missing" : ""}`}
              </button>
            </div>
          ) : null}
        </Card>
      ) : null}

      {/* Fix conflicts result notification */}
      {fixConflictsResult ? (
        <Card className={panelCardClass}>
          <div className="flex items-start justify-between gap-3">
            <h3 className={h3Class}>Conflicts Fixed</h3>
            <button
              onClick={dismissFixConflictsResult}
              aria-label="Dismiss fix result"
              className="shrink-0 rounded-md p-1 text-text-muted transition-colors hover:bg-line-muted hover:text-white"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {fixConflictsResult.movedCount > 0 ? (
            <p
              className={subtitleClass}
              style={{ color: "var(--color-success)" }}
            >
              Moved {fixConflictsResult.movedCount} file
              {fixConflictsResult.movedCount !== 1 ? "s" : ""} to{" "}
              <span className="font-mono">
                {fixConflictsResult.orphanedDir}
              </span>
            </p>
          ) : (
            <p
              className={subtitleClass}
              style={{ color: "var(--color-success)" }}
            >
              No extra files to move.
            </p>
          )}
          {fixConflictsResult.missingCount > 0 ? (
            <p className={subtitleClass}>
              {fixConflictsResult.missingCount} missing file
              {fixConflictsResult.missingCount !== 1 ? "s" : ""} — syncing from
              server profile&hellip;
            </p>
          ) : null}
        </Card>
      ) : null}

      <div className={paneGridClass}>
        <Card className={panelCardClass}>
          <h3 className={h3Class}>Server Profile</h3>
          <div className={dataListClass}>
            <div className={dataItemClass}>
              <span className={dataLabelClass}>Endpoint</span>
              <div className={dataValueClass}>
                {catalog?.serverAddress ?? "--"}
              </div>
            </div>
            <div className={dataItemClass}>
              <span className={dataLabelClass}>Source</span>
              <div className={dataValueClass}>{sourceLabel}</div>
            </div>
          </div>
        </Card>

        <Card className={panelCardClass}>
          <h3 className={h3Class}>Environment</h3>
          <div className={dataListClass}>
            <div className={dataItemClass}>
              <span className={dataLabelClass}>Active Launcher</span>
              <div className={dataValueClass}>
                {settings?.selectedLauncherId ?? "--"}
              </div>
            </div>

            <Details className={detailsClass} summary="Technical Paths">
              <div className={dataItemClass}>
                <span className={dataLabelClass}>Live Minecraft</span>
                <div className={dataValueClass}>
                  {versionReadiness?.liveMinecraftRoot ?? "--"}
                </div>
              </div>
              <div className={dataItemClass}>
                <span className={dataLabelClass}>Managed Sync</span>
                <div className={dataValueClass}>
                  {instance?.minecraftDir ?? "--"}
                </div>
              </div>
              {settings?.customLauncherPath ? (
                <div className={dataItemClass}>
                  <span className={dataLabelClass}>Custom Bin Path</span>
                  <div className={dataValueClass}>
                    {settings.customLauncherPath}
                  </div>
                </div>
              ) : null}
            </Details>
          </div>
        </Card>

        <Card className={panelCardClass}>
          <h3 className={h3Class}>Mods ({catalog?.mods.length ?? 0})</h3>
          <div className={overviewListClass}>
            {(catalog?.mods ?? []).map((item) => (
              <span key={item} className={overviewChipClass}>
                {item}
              </span>
            ))}
          </div>
        </Card>

        <Card className={panelCardClass}>
          <h3 className={h3Class}>
            Resourcepacks ({catalog?.resourcepacks.length ?? 0})
          </h3>
          <div className={overviewListClass}>
            {(catalog?.resourcepacks ?? []).map((item) => (
              <span key={item} className={overviewChipClass}>
                {item}
              </span>
            ))}
          </div>
        </Card>

        <Card className={panelCardClass}>
          <h3 className={h3Class}>
            Shaders ({catalog?.shaderpacks.length ?? 0})
          </h3>
          <div className={overviewListClass}>
            {(catalog?.shaderpacks ?? []).map((item) => (
              <span key={item} className={overviewChipClass}>
                {item}
              </span>
            ))}
          </div>
        </Card>

        <Card className={panelCardClass}>
          <h3 className={h3Class}>Configs ({catalog?.configs.length ?? 0})</h3>
          <div className={overviewListClass}>
            {(catalog?.configs ?? []).map((item) => (
              <span key={item} className={overviewChipClass}>
                {item}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
