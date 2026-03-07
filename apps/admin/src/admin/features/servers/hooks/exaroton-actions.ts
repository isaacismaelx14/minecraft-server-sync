import { requestJson } from "@/admin/client/http";
import type { ExarotonActionPayload } from "@/admin/client/types";
import type {
  ExarotonState,
  StatusState,
} from "@/admin/shared/domain/admin-form";

export async function executeExarotonServerAction(
  action: "start" | "stop" | "restart",
  setExaroton: (updater: (current: ExarotonState) => ExarotonState) => void,
  setStatus: (
    name: keyof StatusState,
    text: string,
    tone?: "idle" | "ok" | "error",
  ) => void,
): Promise<void> {
  setExaroton((current) => ({ ...current, busy: true }));
  setStatus("exaroton", `Sending ${action} action...`);
  try {
    const payload = await requestJson<ExarotonActionPayload>(
      "/v1/admin/exaroton/server/action",
      "POST",
      { action },
    );
    setExaroton((current) => ({
      ...current,
      busy: false,
      selectedServer: payload.selectedServer,
    }));
    setStatus("exaroton", `Server ${action} action sent.`, "ok");
  } catch (error) {
    setExaroton((current) => ({
      ...current,
      busy: false,
      error: (error as Error).message || `Failed to ${action} server.`,
    }));
    setStatus(
      "exaroton",
      (error as Error).message || `Failed to ${action} server.`,
      "error",
    );
  }
}
