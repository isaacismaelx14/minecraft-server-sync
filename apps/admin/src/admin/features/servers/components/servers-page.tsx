"use client";

import { useState } from "react";

import type { ExarotonServerPayload } from "@/admin/client/types";
import { Button } from "@/admin/shared/ui/button";
import { ExarotonLogo } from "@/admin/shared/ui/exaroton-logo";
import { TextInput } from "@/admin/shared/ui/form-controls";
import { ModalShell } from "@/admin/shared/ui/modal-shell";
import { SectionHeader } from "@/admin/shared/ui/section-header";
import { exarotonStatusClass, statusClass } from "@/admin/shared/ui/status";
import { ui } from "@/admin/shared/ui/styles";
import { ToggleSwitch } from "@/admin/shared/ui/toggle-switch";

import { useServersPageModel } from "../hooks/use-servers-page-model";

/* ------------------------------------------------------------------ */
/*  Setting toggle row                                                */
/* ------------------------------------------------------------------ */

function SettingRow({
  label,
  description,
  enabled,
  onChange,
  disabled,
  locked,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  locked?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-[var(--radius-sm)] px-3 py-2.5 transition-colors ${locked ? "opacity-60" : "hover:bg-white/[0.03]"}`}
    >
      <div className="min-w-0">
        <span className="text-sm text-[var(--color-text-primary)]">
          {label}
        </span>
        {description ? (
          <p className="m-0 text-xs text-[var(--color-text-muted)] mt-0.5">
            {description}
          </p>
        ) : null}
      </div>
      <ToggleSwitch
        enabled={enabled}
        onChange={onChange}
        disabled={disabled ?? locked}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Integration Landing                                               */
/* ------------------------------------------------------------------ */

function IntegrationLanding({
  onSelect,
  connectedIntegration,
}: {
  onSelect: (id: string) => void;
  connectedIntegration?: string | null;
}) {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <SectionHeader
        icon={
          <span className="material-symbols-outlined text-[18px]">hub</span>
        }
        title="Select Integration"
        description="Choose a hosting service to manage your game servers."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          className={`group rounded-[var(--radius-md)] border p-5 text-left cursor-pointer transition-all duration-200 flex flex-col gap-4 ${
            connectedIntegration === "exaroton"
              ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
              : "border-[var(--color-line)] bg-black/20 hover:bg-black/30 hover:border-[var(--color-line-strong)]"
          }`}
          onClick={() => onSelect("exaroton")}
          type="button"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-black/30 grid place-items-center">
              <ExarotonLogo iconOnly style={{ height: 22, width: 22 }} />
            </div>
            {connectedIntegration === "exaroton" ? (
              <span className="text-[0.7rem] uppercase tracking-widest font-bold bg-emerald-500/10 text-emerald-400 py-1 px-2.5 rounded-full border border-emerald-500/20">
                Connected
              </span>
            ) : null}
          </div>
          <div>
            <h4 className="m-0 text-sm font-semibold text-white mb-1">
              Exaroton
            </h4>
            <p className="m-0 text-xs text-[var(--color-text-muted)] leading-relaxed">
              {connectedIntegration === "exaroton"
                ? "Account connected. Click to manage."
                : "Connect your Exaroton account to manage servers directly."}
            </p>
          </div>
        </button>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-black/20 p-5 flex flex-col gap-4 opacity-40 cursor-not-allowed">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-black/30 grid place-items-center">
            <span className="material-symbols-outlined text-[20px] text-[var(--color-text-muted)]">
              more_horiz
            </span>
          </div>
          <div>
            <h4 className="m-0 text-sm font-semibold text-white mb-1">
              Coming Soon
            </h4>
            <p className="m-0 text-xs text-[var(--color-text-muted)] leading-relaxed">
              More integrations are on the way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exaroton Setup Flow (API Key → Server Select → Success)           */
/* ------------------------------------------------------------------ */

function ExarotonSetupFlow({
  exaroton,
  setExarotonApiKey,
  connectExaroton,
  setExarotonStep,
  listExarotonServers,
  selectExarotonServer,
  onBack,
  onFinish,
}: {
  exaroton: ReturnType<typeof useServersPageModel>["exaroton"];
  setExarotonApiKey: (key: string) => void;
  connectExaroton: () => Promise<void>;
  setExarotonStep: (step: "idle" | "key" | "servers" | "success") => void;
  listExarotonServers: () => Promise<void>;
  selectExarotonServer: (id: string) => Promise<void>;
  onBack: () => void;
  onFinish: () => void;
}) {
  const isKeyStep = !exaroton.connected && exaroton.connectionStep === "key";
  const isServersStep =
    (exaroton.connectionStep === "servers" || !exaroton.selectedServer) &&
    exaroton.connected;
  const isSuccessStep =
    exaroton.connectionStep === "success" && exaroton.connected;

  const stepIndex = !exaroton.connected ? 0 : !exaroton.selectedServer ? 1 : 2;

  const steps = ["API Key", "Select Server", "Connected"];

  return (
    <article className={ui.panel}>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center gap-2 flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                i <= stepIndex
                  ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/20"
                  : "bg-white/[0.03] text-[var(--color-text-muted)] border border-white/[0.06]"
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[0.65rem] font-bold ${
                  i < stepIndex
                    ? "bg-[var(--color-brand-primary)] text-white"
                    : i === stepIndex
                      ? "bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)]"
                      : "bg-white/[0.06] text-[var(--color-text-muted)]"
                }`}
              >
                {i < stepIndex ? "✓" : i + 1}
              </span>
              {label}
            </div>
            {i < steps.length - 1 ? (
              <div
                className={`w-6 h-px shrink-0 ${i < stepIndex ? "bg-[var(--color-brand-primary)]/40" : "bg-white/[0.06]"}`}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Step 1: API Key */}
      {isKeyStep ? (
        <div className="flex flex-col gap-5 mt-2">
          <SectionHeader
            icon={
              <span className="material-symbols-outlined text-[18px]">key</span>
            }
            title="Connect Exaroton Account"
            description="Enter your API key to link your Exaroton account."
          />

          <div className="rounded-[var(--radius-sm)] bg-emerald-500/5 border border-emerald-500/15 p-3 text-xs text-emerald-300/90 leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined text-emerald-400 text-[16px] mt-px shrink-0">
              shield
            </span>
            <span>
              <strong className="text-emerald-400">
                Your key stays protected.
              </strong>{" "}
              It is encrypted at rest and only decrypted for authorized API
              calls. We never expose it in the UI after saving.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className={ui.dataLabel}>Exaroton API Key</label>
            <input
              className="font-mono text-sm border border-[var(--color-line)] rounded-[var(--radius-md)] bg-black/30 py-3 px-4 text-[var(--color-text-primary)] w-full transition-all duration-150 ease-out outline-none focus:border-[var(--color-brand-primary)] focus:bg-black/40 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
              type="password"
              placeholder="Paste your secret API key here..."
              value={exaroton.apiKeyInput}
              onChange={(event) => setExarotonApiKey(event.target.value)}
            />
            <p className="m-0 text-xs text-[var(--color-text-muted)]">
              Get your key from{" "}
              <a
                href="https://exaroton.com/account/settings/"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-brand-accent)] underline decoration-[var(--color-brand-accent)]/40 underline-offset-2 hover:text-white"
              >
                exaroton.com/account/settings
              </a>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button variant="ghost" size="md" onClick={onBack}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!exaroton.apiKeyInput || exaroton.busy}
              onClick={() => void connectExaroton()}
            >
              {exaroton.busy ? "Connecting..." : "Connect Account"}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Step 2: Server Selection */}
      {isServersStep ? (
        <div className="flex flex-col gap-5 mt-2">
          <SectionHeader
            icon={
              <span className="material-symbols-outlined text-[18px]">dns</span>
            }
            title="Select Server"
            description="Choose the server you want to manage within the client."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exaroton.servers.map((server: ExarotonServerPayload) => (
              <button
                key={server.id}
                className={`rounded-[var(--radius-md)] border p-4 text-left cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                  exaroton.selectedServer?.id === server.id
                    ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
                    : "border-[var(--color-line)] bg-black/20 hover:bg-black/30 hover:border-[var(--color-line-strong)]"
                }`}
                onClick={() => void selectExarotonServer(server.id)}
                disabled={exaroton.busy}
                type="button"
              >
                <div className="flex justify-between items-center gap-3 w-full">
                  <strong className="text-sm font-semibold text-white truncate">
                    {server.name}
                  </strong>
                  <span className={exarotonStatusClass(server.status)}>
                    {server.statusLabel}
                  </span>
                </div>
                <p className="m-0 font-mono text-xs text-[var(--color-text-muted)]">
                  {server.address}
                </p>
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-accent)] shadow-[0_0_6px_var(--color-brand-accent-glow)]" />
                  {server.players.count}/{server.players.max} players
                </span>
              </button>
            ))}
          </div>

          {!exaroton.servers.length ? (
            <div className={`${ui.statusBase} ${ui.statusIdle}`}>
              No servers found. Create one on Exaroton first.
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                if (!exaroton.connected) {
                  setExarotonStep("key");
                } else {
                  onBack();
                }
              }}
            >
              Back
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={
                <span className="material-symbols-outlined text-[16px]">
                  refresh
                </span>
              }
              onClick={() => void listExarotonServers()}
            >
              Refresh
            </Button>
          </div>
        </div>
      ) : null}

      {/* Step 3: Success */}
      {isSuccessStep ? (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 grid place-items-center">
            <span className="material-symbols-outlined text-emerald-400 text-[32px]">
              check_circle
            </span>
          </div>
          <div className="text-center">
            <h3 className="m-0 mb-2 text-lg font-semibold text-white">
              Successfully Connected
            </h3>
            <p className="m-0 text-sm text-[var(--color-text-muted)]">
              <strong className="text-white">
                {exaroton.selectedServer?.name}
              </strong>{" "}
              is now integrated with MineRelay.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={onFinish}>
            Go to Dashboard
          </Button>
        </div>
      ) : null}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Connected Dashboard                                               */
/* ------------------------------------------------------------------ */

function ConnectedDashboard({
  exaroton,
  statuses,
  exarotonAction,
  updateExarotonSettings,
  listExarotonServers,
  setExarotonStep,
  onDisconnect,
}: {
  exaroton: ReturnType<typeof useServersPageModel>["exaroton"];
  statuses: ReturnType<typeof useServersPageModel>["statuses"];
  exarotonAction: (action: "start" | "stop" | "restart") => Promise<void>;
  updateExarotonSettings: (payload: Record<string, boolean>) => Promise<void>;
  listExarotonServers: () => Promise<void>;
  setExarotonStep: (step: "idle" | "key" | "servers" | "success") => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* ── Account Card ─────────────────────────── */}
      <article className={ui.panel}>
        <SectionHeader
          icon={
            <span className="material-symbols-outlined text-[18px]">
              account_circle
            </span>
          }
          title="Connected Account"
          description="Exaroton account linked to this instance."
        />
        <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-black/20 p-4 mt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 grid place-items-center shrink-0">
              <ExarotonLogo iconOnly style={{ height: 20, width: 20 }} />
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm font-semibold text-white truncate">
                {exaroton.accountName}
              </p>
              <p className="m-0 text-xs text-[var(--color-text-muted)] truncate">
                {exaroton.accountEmail}
              </p>
            </div>
          </div>
          <Button variant="danger-ghost" size="sm" onClick={onDisconnect}>
            Disconnect
          </Button>
        </div>
      </article>

      {/* ── Selected Server Card ─────────────────── */}
      {exaroton.selectedServer ? (
        <article className={ui.panel}>
          <div className="flex items-start justify-between gap-2">
            <SectionHeader
              icon={
                <span className="material-symbols-outlined text-[18px]">
                  dns
                </span>
              }
              title="Selected Server"
              description="Currently managed game server."
            />
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setExarotonStep("servers");
                void listExarotonServers();
              }}
            >
              Change
            </Button>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-brand-primary)]/20 bg-[var(--color-brand-primary)]/5 p-4 flex items-center justify-between gap-4 mt-1">
            <div className="min-w-0">
              <p className="m-0 text-sm font-semibold text-white">
                {exaroton.selectedServer.name}
              </p>
              <p className="m-0 text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                {exaroton.selectedServer.address}
              </p>
            </div>
            <span
              className={exarotonStatusClass(exaroton.selectedServer.status)}
            >
              {exaroton.selectedServer.statusLabel}
            </span>
          </div>
        </article>
      ) : null}

      {/* ── Server Controls Card (full width) ────── */}
      <article className={`${ui.panel} md:col-span-2`}>
        <SectionHeader
          icon={
            <span className="material-symbols-outlined text-[18px]">tune</span>
          }
          title="Controls & Settings"
          description="Server actions, sync options, and player permissions."
        />

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="success"
            size="sm"
            disabled={exaroton.busy}
            icon={
              <span className="material-symbols-outlined text-[16px]">
                play_arrow
              </span>
            }
            onClick={() => void exarotonAction("start")}
          >
            Start
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={exaroton.busy}
            icon={
              <span className="material-symbols-outlined text-[16px]">
                refresh
              </span>
            }
            onClick={() => void exarotonAction("restart")}
          >
            Restart
          </Button>
          <Button
            variant="danger-ghost"
            size="sm"
            disabled={exaroton.busy}
            icon={
              <span className="material-symbols-outlined text-[16px]">
                stop
              </span>
            }
            onClick={() => void exarotonAction("stop")}
          >
            Stop
          </Button>
          {exaroton.busy ? (
            <span className="text-xs text-[var(--color-text-muted)] ml-2">
              Processing...
            </span>
          ) : null}
        </div>

        {/* Settings Sections */}
        <fieldset disabled={exaroton.busy} className="border-0 p-0 m-0 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Core Settings */}
            <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-black/20 p-4 flex flex-col gap-1">
              <h4 className="m-0 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                Core
              </h4>
              <SettingRow
                label="Server status"
                description="Required, cannot be disabled."
                enabled
                onChange={() => {}}
                locked
              />
              <SettingRow
                label="Mods sync"
                description="Auto-sync mods to Exaroton."
                enabled={exaroton.settings.modsSyncEnabled}
                onChange={(next) =>
                  void updateExarotonSettings({ modsSyncEnabled: next })
                }
              />
            </div>

            {/* Player Access */}
            <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-black/20 p-4 flex flex-col gap-1">
              <h4 className="m-0 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                Player Access
              </h4>
              <SettingRow
                label="View status"
                enabled={exaroton.settings.playerCanViewStatus}
                disabled={
                  exaroton.settings.playerCanStartServer ||
                  exaroton.settings.playerCanStopServer ||
                  exaroton.settings.playerCanRestartServer
                }
                onChange={(next) =>
                  void updateExarotonSettings({ playerCanViewStatus: next })
                }
              />
              <SettingRow
                label="View online players"
                enabled={exaroton.settings.playerCanViewOnlinePlayers}
                disabled={!exaroton.settings.playerCanViewStatus}
                onChange={(next) =>
                  void updateExarotonSettings({
                    playerCanViewOnlinePlayers: next,
                  })
                }
              />
              <SettingRow
                label="Start server"
                enabled={exaroton.settings.playerCanStartServer}
                onChange={(next) =>
                  void updateExarotonSettings({ playerCanStartServer: next })
                }
              />
              <SettingRow
                label="Stop server"
                enabled={exaroton.settings.playerCanStopServer}
                onChange={(next) =>
                  void updateExarotonSettings({ playerCanStopServer: next })
                }
              />
              <SettingRow
                label="Restart server"
                enabled={exaroton.settings.playerCanRestartServer}
                onChange={(next) =>
                  void updateExarotonSettings({
                    playerCanRestartServer: next,
                  })
                }
              />
            </div>
          </div>
        </fieldset>

        <div className={`${statusClass(statuses.exaroton.tone)} mt-auto`}>
          {statuses.exaroton.text}
        </div>
      </article>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export function ServersPage() {
  const {
    exaroton,
    statuses,
    setExarotonStep,
    setExarotonApiKey,
    connectExaroton,
    disconnectExaroton,
    listExarotonServers,
    selectExarotonServer,
    exarotonAction,
    updateExarotonSettings,
  } = useServersPageModel();
  const [confirmDisconnect, setConfirmDisconnect] = useState("");
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null,
  );

  const isSetupFlow = selectedIntegration === "exaroton" && !exaroton.connected;
  const isServerPick =
    (exaroton.connectionStep === "servers" || !exaroton.selectedServer) &&
    exaroton.connected;
  const isSuccessStep =
    exaroton.connectionStep === "success" && exaroton.connected;
  const showDashboard =
    exaroton.connected &&
    exaroton.selectedServer &&
    !isServerPick &&
    !isSuccessStep;

  /* Not configured error */
  if (!exaroton.configured) {
    return (
      <article className={`${ui.panel} max-w-7xl mx-auto w-full`}>
        <SectionHeader
          icon={
            <span className="material-symbols-outlined text-[18px] text-red-400">
              error
            </span>
          }
          title="Integration Not Configured"
          description="Server hosting integration cannot be used yet."
        />
        <div className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/15 p-3 text-xs text-red-300/90 leading-relaxed mt-1">
          Set{" "}
          <code className="bg-white/5 px-1 py-0.5 rounded text-[0.7rem]">
            EXAROTON_ENCRYPTION_KEY
          </code>{" "}
          on the API server to enable this feature.
        </div>
      </article>
    );
  }

  /* Landing — pick integration */
  if (!exaroton.connected && !selectedIntegration) {
    return (
      <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
        <IntegrationLanding
          onSelect={(id) => {
            if (id === "exaroton") {
              setSelectedIntegration("exaroton");
              if (!exaroton.connected) setExarotonStep("key");
            } else {
              setSelectedIntegration(id);
            }
          }}
          connectedIntegration={exaroton.connected ? "exaroton" : null}
        />
        <div className={statusClass(statuses.exaroton.tone)}>
          {statuses.exaroton.text}
        </div>
      </div>
    );
  }

  /* Setup flow (key → servers → success) */
  if (isSetupFlow || isServerPick || isSuccessStep) {
    return (
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-5">
        <ExarotonSetupFlow
          exaroton={exaroton}
          setExarotonApiKey={setExarotonApiKey}
          connectExaroton={connectExaroton}
          setExarotonStep={setExarotonStep}
          listExarotonServers={listExarotonServers}
          selectExarotonServer={selectExarotonServer}
          onBack={() => {
            setExarotonStep("idle");
            setSelectedIntegration(null);
          }}
          onFinish={() => setExarotonStep("idle")}
        />
        <div className={statusClass(statuses.exaroton.tone)}>
          {statuses.exaroton.text}
        </div>
      </div>
    );
  }

  /* Connected dashboard */
  if (showDashboard) {
    return (
      <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
        <ConnectedDashboard
          exaroton={exaroton}
          statuses={statuses}
          exarotonAction={exarotonAction}
          updateExarotonSettings={updateExarotonSettings}
          listExarotonServers={listExarotonServers}
          setExarotonStep={setExarotonStep}
          onDisconnect={() => setConfirmDisconnect("PENDING")}
        />

        {confirmDisconnect ? (
          <ModalShell onClose={() => setConfirmDisconnect("")}>
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="m-0 text-lg font-semibold text-white mb-2">
                  Confirm Disconnection
                </h3>
                <p className="m-0 text-sm text-[var(--color-text-muted)]">
                  Type the server name{" "}
                  <strong className="text-white">
                    {exaroton.selectedServer?.name}
                  </strong>{" "}
                  to confirm.
                </p>
              </div>
              <TextInput
                name="confirm"
                label="Server name"
                value={confirmDisconnect === "PENDING" ? "" : confirmDisconnect}
                onChange={(event) =>
                  setConfirmDisconnect(event.currentTarget.value)
                }
                placeholder={exaroton.selectedServer?.name}
              />
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setConfirmDisconnect("")}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  disabled={confirmDisconnect !== exaroton.selectedServer?.name}
                  onClick={() => {
                    void disconnectExaroton();
                    setConfirmDisconnect("");
                  }}
                >
                  Confirm Disconnect
                </Button>
              </div>
            </div>
          </ModalShell>
        ) : null}

        {exaroton.error ? (
          <div className="rounded-[var(--radius-sm)] bg-red-500/5 border border-red-500/15 p-3 text-xs text-red-300/90 leading-relaxed mt-4">
            {exaroton.error}
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}
