"use client";

import { useRef } from "react";

import { Button } from "@/admin/shared/ui/button";
import { SelectInput, TextInput } from "@/admin/shared/ui/form-controls";
import { statusClass } from "@/admin/shared/ui/status";
import { ui } from "@/admin/shared/ui/styles";

import { useFancyMenuPageModel } from "../hooks/use-fancy-menu-page-model";

/* ------------------------------------------------------------------ */
/*  Reusable section header (matches identity-page pattern)           */
/* ------------------------------------------------------------------ */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5 w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 grid place-items-center text-[var(--color-brand-primary)]">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-tight tracking-tight m-0">
          {title}
        </h3>
        <p className="m-0 mt-1 text-sm text-[var(--color-text-muted)] leading-snug">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle switch                                                     */
/* ------------------------------------------------------------------ */

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200 ${
        enabled
          ? "bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)]/60 shadow-[0_0_12px_rgba(99,102,241,0.35)]"
          : "bg-white/10 border-white/[0.08]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export function FancyMenuPage() {
  const {
    form,
    setTextFieldFromEvent,
    statuses,
    uploadFancyBundle,
    setFancyMenuEnabled,
    setFancyMenuMode,
  } = useFancyMenuPageModel();
  const bundleUploadRef = useRef<HTMLInputElement | null>(null);

  const isEnabled = form.fancyMenuEnabled === "true";

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── Activation Card ─────────────────────────────── */}
        <article className={ui.panel}>
          <SectionHeader
            icon={
              <span className="material-symbols-outlined text-[18px]">
                auto_awesome
              </span>
            }
            title="FancyMenu"
            description="Override the default Minecraft main menu with a premium brand experience."
          />

          <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line)] bg-black/20 p-4 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {isEnabled
                  ? "Core mods and config files included in profile."
                  : "Standard Minecraft menu will be used."}
              </span>
            </div>
            <ToggleSwitch
              enabled={isEnabled}
              onChange={(next) => setFancyMenuEnabled(next)}
            />
          </div>

          <div className={`${statusClass(statuses.fancy.tone)} mt-auto`}>
            {statuses.fancy.text}
          </div>
        </article>

        {/* ── Mode Selection Card ─────────────────────────── */}
        <article
          className={`${ui.panel} ${!isEnabled ? "opacity-40 pointer-events-none" : ""}`}
        >
          <SectionHeader
            icon={
              <span className="material-symbols-outlined text-[18px]">
                tune
              </span>
            }
            title="Customization Mode"
            description="Choose how to build your main menu experience."
          />

          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              type="button"
              onClick={() => setFancyMenuMode("simple")}
              className={`rounded-[var(--radius-md)] border p-4 text-left cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                form.fancyMenuMode === "simple"
                  ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
                  : "border-[var(--color-line)] bg-black/20 hover:bg-black/30 hover:border-[var(--color-line-strong)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[var(--color-brand-primary)]">
                  bolt
                </span>
                <span className="text-sm font-semibold text-white">
                  Simple Form
                </span>
              </div>
              <p className="m-0 text-xs text-[var(--color-text-muted)] leading-relaxed">
                Set logo, background, and button labels via quick fields.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFancyMenuMode("custom")}
              className={`rounded-[var(--radius-md)] border p-4 text-left cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                form.fancyMenuMode === "custom"
                  ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
                  : "border-[var(--color-line)] bg-black/20 hover:bg-black/30 hover:border-[var(--color-line-strong)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[var(--color-brand-primary)]">
                  inventory_2
                </span>
                <span className="text-sm font-semibold text-white">
                  Custom Bundle
                </span>
              </div>
              <p className="m-0 text-xs text-[var(--color-text-muted)] leading-relaxed">
                Upload a full FancyMenu .zip with layouts and animations.
              </p>
            </button>
          </div>
        </article>

        {/* ── Configuration Card (full width) ─────────────── */}
        {isEnabled ? (
          <article className={`${ui.panel} md:col-span-2`}>
            <SectionHeader
              icon={
                <span className="material-symbols-outlined text-[18px]">
                  settings
                </span>
              }
              title={
                form.fancyMenuMode === "simple"
                  ? "Simple Configuration"
                  : "Custom Bundle"
              }
              description={
                form.fancyMenuMode === "simple"
                  ? "Configure branding assets and menu button visibility."
                  : "Provide or upload a FancyMenu bundle export."
              }
            />

            {form.fancyMenuMode === "simple" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                <TextInput
                  name="playButtonLabel"
                  label="Play Button Label"
                  value={form.playButtonLabel}
                  placeholder="START"
                  onChange={setTextFieldFromEvent}
                />
                <TextInput
                  name="brandingLogoUrl"
                  label="Brand Logo URL"
                  value={form.brandingLogoUrl}
                  placeholder="https://..."
                  onChange={setTextFieldFromEvent}
                />
                <TextInput
                  name="brandingBackgroundUrl"
                  label="Brand Background URL"
                  value={form.brandingBackgroundUrl}
                  placeholder="https://..."
                  onChange={setTextFieldFromEvent}
                />
                <div />
                <SelectInput
                  name="hideSingleplayer"
                  label="Hide Singleplayer"
                  value={form.hideSingleplayer}
                  onChange={setTextFieldFromEvent}
                  options={[
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]}
                />
                <SelectInput
                  name="hideMultiplayer"
                  label="Hide Multiplayer"
                  value={form.hideMultiplayer}
                  onChange={setTextFieldFromEvent}
                  options={[
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-1">
                <div className="p-3 rounded-[var(--radius-sm)] bg-amber-500/5 border border-amber-500/15 text-xs text-amber-300/90 leading-relaxed">
                  <strong className="text-amber-400">Note:</strong> Your .zip
                  must contain a valid FancyMenu export structure (usually
                  including a{" "}
                  <code className="bg-white/5 px-1 py-0.5 rounded text-[0.7rem]">
                    customization
                  </code>{" "}
                  folder).
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInput
                    name="fancyMenuCustomLayoutUrl"
                    label="Bundle Download URL"
                    value={form.fancyMenuCustomLayoutUrl}
                    placeholder="https://.../bundle.zip"
                    onChange={setTextFieldFromEvent}
                  />
                  <TextInput
                    name="fancyMenuCustomLayoutSha256"
                    label="Bundle SHA256"
                    value={form.fancyMenuCustomLayoutSha256}
                    placeholder="hex sha256"
                    onChange={setTextFieldFromEvent}
                  />
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full"
                    onClick={() => bundleUploadRef.current?.click()}
                    icon={
                      <span className="material-symbols-outlined text-[18px]">
                        upload_file
                      </span>
                    }
                  >
                    Upload New Bundle .zip
                  </Button>
                  <input
                    ref={bundleUploadRef}
                    type="file"
                    accept=".zip"
                    hidden
                    onChange={(event) => {
                      void uploadFancyBundle(
                        event.currentTarget.files?.[0] ?? null,
                      );
                      event.currentTarget.value = "";
                    }}
                  />
                </div>
              </div>
            )}
          </article>
        ) : null}
      </div>
    </div>
  );
}
