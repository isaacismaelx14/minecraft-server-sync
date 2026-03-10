import { memo, useCallback } from "react";
import {
  ServerControlBar as UiServerControlBar,
  type ServerControlBarVariant,
  type ServerControlTone,
} from "@minerelay/ui";
import type { LauncherServerControlsState } from "../types";

type Props = {
  launcherServerControls: LauncherServerControlsState;
  isServerActionBusy: boolean;
  runLauncherServerAction: (
    action: "start" | "stop" | "restart",
  ) => Promise<void>;
  variant?: ServerControlBarVariant;
};

export const ServerControlBar = memo(function ServerControlBar({
  launcherServerControls,
  isServerActionBusy,
  runLauncherServerAction,
  variant = "desktop",
}: Props) {
  const handleStart = useCallback(
    () => void runLauncherServerAction("start"),
    [runLauncherServerAction],
  );
  const handleRestart = useCallback(
    () => void runLauncherServerAction("restart"),
    [runLauncherServerAction],
  );
  const handleStop = useCallback(
    () => void runLauncherServerAction("stop"),
    [runLauncherServerAction],
  );

  const statusTone: ServerControlTone = (() => {
    if (!launcherServerControls?.enabled) {
      return "disabled";
    }

    const status = launcherServerControls.selectedServer?.status;
    if (status === 1) return "online";
    if (status === 0) return "offline";
    if (status === 7) return "error";
    if ([2, 3, 4, 5, 6, 8, 9, 10].includes(status ?? -1)) return "busy";
    return "unknown";
  })();

  const launcherServerStatus = launcherServerControls?.selectedServer?.status;
  const disableStartByStatus = [1, 2, 3, 4, 6].includes(
    launcherServerStatus ?? -1,
  );
  const disableStopByStatus = [0, 2, 3, 4, 6].includes(
    launcherServerStatus ?? -1,
  );
  const disableRestartByStatus = [0, 2, 3, 4, 6].includes(
    launcherServerStatus ?? -1,
  );

  const statusText = launcherServerControls.reason
    ? launcherServerControls.reason
    : launcherServerControls.permissions.canViewOnlinePlayers &&
        launcherServerControls.selectedServer
      ? `${launcherServerControls.selectedServer.players.count}/${launcherServerControls.selectedServer.players.max} online`
      : undefined;

  const statusLabel =
    launcherServerControls.selectedServer?.statusLabel ??
    (launcherServerControls.enabled ? "Unknown" : "Unavailable");

  return (
    <UiServerControlBar
      variant={variant}
      statusLabel={statusLabel}
      statusTone={statusTone}
      statusText={statusText}
      isActionBusy={isServerActionBusy}
      canStart={launcherServerControls.permissions.canStartServer}
      canRestart={launcherServerControls.permissions.canRestartServer}
      canStop={launcherServerControls.permissions.canStopServer}
      disableStart={disableStartByStatus}
      disableRestart={disableRestartByStatus}
      disableStop={disableStopByStatus}
      onStart={handleStart}
      onRestart={handleRestart}
      onStop={handleStop}
    />
  );
});
