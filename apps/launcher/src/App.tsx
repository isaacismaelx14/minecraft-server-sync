import { lazy, Suspense } from "react";
import { ToastContainer } from "./components/ToastContainer";
import { CloseModal } from "./components/CloseModal";
import { CompactWindow } from "./components/CompactWindow";
import { useAppCore } from "./hooks/useAppCore";

const SetupWizard = lazy(() =>
  import("./components/SetupWizard").then((m) => ({ default: m.SetupWizard })),
);
const DesktopWorkspace = lazy(() =>
  import("./components/DesktopWorkspace").then((m) => ({
    default: m.DesktopWorkspace,
  })),
);

export default function App() {
  const core = useAppCore();
  const {
    isCompactWindow,
    isSetupWindow,
    wizardActive,
    toasts,
    APP_NAME,
    isApiSourceMode,
    launcherStreamStatus,
    launcherStreamRetryCount,
    launcherStreamRetryCountdownSec,
    retryLauncherServerStreamNow,
    contextMenu,
    handleContextMenuRefresh,
    closeModalOpen,
    closeModalVariant,
    handleCloseModalQuit,
    handleCloseModalKeepInBackground,
    handleCloseModalCancel,
  } = core;

  const showLauncherStreamBadge =
    isApiSourceMode && launcherStreamStatus !== "connected";

  if (isCompactWindow) {
    return (
      <>
        <CompactWindow core={core} />
        {showLauncherStreamBadge ? (
          <div
            className="launcher-stream-indicator"
            role="status"
            aria-live="polite"
          >
            <span
              className="launcher-stream-indicator-dot"
              aria-hidden="true"
            />
            <span className="launcher-stream-indicator-text">
              {launcherStreamStatus === "retrying"
                ? `Lost connection · retrying in ${launcherStreamRetryCountdownSec}s (${launcherStreamRetryCount}/3)`
                : "Lost connection · auto retry stopped"}
            </span>
            {launcherStreamStatus === "disconnected" ? (
              <button
                className="launcher-stream-indicator-btn"
                onClick={() => retryLauncherServerStreamNow()}
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}
        <ToastContainer toasts={toasts} />
        {contextMenu ? (
          <div
            className="app-context-menu"
            role="menu"
            style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          >
            <button
              className="app-context-menu-item"
              role="menuitem"
              onClick={() => handleContextMenuRefresh()}
            >
              Refresh
            </button>
          </div>
        ) : null}
        {closeModalOpen ? (
          <CloseModal
            variant={closeModalVariant}
            onQuit={handleCloseModalQuit}
            onKeepInBackground={handleCloseModalKeepInBackground}
            onCancel={handleCloseModalCancel}
          />
        ) : null}
      </>
    );
  }

  if (isSetupWindow && wizardActive) {
    return (
      <main className="setup-onboarding-shell">
        <header className="setup-onboarding-head">
          <p className="eyebrow">First-time setup</p>
          <h1>{APP_NAME}</h1>
          <p className="small-dark">Complete onboarding to continue.</p>
        </header>

        <Suspense>
          <SetupWizard core={core} />
        </Suspense>

        {showLauncherStreamBadge ? (
          <div
            className="launcher-stream-indicator"
            role="status"
            aria-live="polite"
          >
            <span
              className="launcher-stream-indicator-dot"
              aria-hidden="true"
            />
            <span className="launcher-stream-indicator-text">
              {launcherStreamStatus === "retrying"
                ? `Lost connection · retrying in ${launcherStreamRetryCountdownSec}s (${launcherStreamRetryCount}/3)`
                : "Lost connection · auto retry stopped"}
            </span>
            {launcherStreamStatus === "disconnected" ? (
              <button
                className="launcher-stream-indicator-btn"
                onClick={() => retryLauncherServerStreamNow()}
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}
        <ToastContainer toasts={toasts} />
        {contextMenu ? (
          <div
            className="app-context-menu"
            role="menu"
            style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          >
            <button
              className="app-context-menu-item"
              role="menuitem"
              onClick={() => handleContextMenuRefresh()}
            >
              Refresh
            </button>
          </div>
        ) : null}
        {closeModalOpen ? (
          <CloseModal
            variant={closeModalVariant}
            onQuit={handleCloseModalQuit}
            onKeepInBackground={handleCloseModalKeepInBackground}
            onCancel={handleCloseModalCancel}
          />
        ) : null}
      </main>
    );
  }

  return (
    <>
      <Suspense>
        <DesktopWorkspace core={core} />
      </Suspense>
      {showLauncherStreamBadge ? (
        <div
          className="launcher-stream-indicator"
          role="status"
          aria-live="polite"
        >
          <span className="launcher-stream-indicator-dot" aria-hidden="true" />
          <span className="launcher-stream-indicator-text">
            {launcherStreamStatus === "retrying"
              ? `Lost connection · retrying in ${launcherStreamRetryCountdownSec}s (${launcherStreamRetryCount}/3)`
              : "Lost connection · auto retry stopped"}
          </span>
          {launcherStreamStatus === "disconnected" ? (
            <button
              className="launcher-stream-indicator-btn"
              onClick={() => retryLauncherServerStreamNow()}
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}
      <ToastContainer toasts={toasts} />
      {contextMenu ? (
        <div
          className="app-context-menu"
          role="menu"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          <button
            className="app-context-menu-item"
            role="menuitem"
            onClick={() => handleContextMenuRefresh()}
          >
            Refresh
          </button>
        </div>
      ) : null}
      {closeModalOpen ? (
        <CloseModal
          variant={closeModalVariant}
          onQuit={handleCloseModalQuit}
          onKeepInBackground={handleCloseModalKeepInBackground}
          onCancel={handleCloseModalCancel}
        />
      ) : null}
    </>
  );
}
