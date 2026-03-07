"use client";

import { useEffect, useRef, useState } from "react";

import { requestJson } from "@/admin/client/http";
import type { AdminMod, SearchResult } from "@/admin/client/types";
import { useTopBarModel } from "@/admin/features/shell/hooks/use-top-bar-model";
import { ModalShell } from "@/admin/shared/ui/modal-shell";
import { statusClass } from "@/admin/shared/ui/status";

import { useModManagerPageModel } from "../hooks/use-mod-manager-page-model";

function runtimeChip(label: string, value: string) {
  return (
    <div className="mods-toolbar-chip" key={label}>
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

function InstalledModRow({
  mod,
  isCore,
  exarotonConnected,
  versionOptions,
  onRemove,
  onLoadVersions,
  onApplyVersion,
  onSetTarget,
}: {
  mod: AdminMod;
  isCore: boolean;
  exarotonConnected: boolean;
  versionOptions: Array<{
    id: string;
    name: string;
    versionType: "release" | "beta" | "alpha";
    publishedAt: string;
  }>;
  onRemove: (mod: AdminMod) => void;
  onLoadVersions: (projectId: string) => Promise<void>;
  onApplyVersion: (projectId: string, versionId: string) => Promise<void>;
  onSetTarget: (
    projectId: string,
    target: "client" | "server" | "both",
    sha256?: string,
  ) => void;
}) {
  const projectId = mod.projectId ?? "";
  const selectedVersion = versionOptions.some(
    (entry) => entry.id === mod.versionId,
  )
    ? (mod.versionId ?? "")
    : "";
  const iconSrc =
    mod.iconUrl ||
    (projectId
      ? `https://cdn.modrinth.com/data/${projectId}/icon.png`
      : "https://modrinth.com/favicon.ico");

  return (
    <div className={`mods-installed-row${isCore ? " core" : ""}`}>
      <div className="mods-installed-main">
        <img
          src={iconSrc}
          alt={mod.name}
          className="mods-installed-icon"
          onError={(event) => {
            event.currentTarget.src = "https://modrinth.com/favicon.ico";
          }}
        />
        <div className="mods-installed-copy">
          <div className="mods-installed-title">
            <strong>{mod.name}</strong>
            {mod.versionId ? (
              <span className="mods-version-badge">{mod.versionId}</span>
            ) : null}
            {isCore ? <span className="mods-core-badge">Core</span> : null}
          </div>
          <p>
            {mod.slug ?? mod.projectId ?? "custom package"} •{" "}
            {mod.side === "both" ? "user + server" : mod.side}
          </p>
        </div>
      </div>

      <div className="mods-installed-actions">
        {exarotonConnected ? (
          <select
            className="mods-inline-select"
            value={mod.side || "client"}
            disabled={isCore}
            onChange={(event) =>
              onSetTarget(
                projectId,
                event.currentTarget.value as "client" | "server" | "both",
                mod.sha256,
              )
            }
          >
            <option value="client">User</option>
            <option value="both">User + Server</option>
            <option value="server">Server</option>
          </select>
        ) : null}

        {projectId ? (
          <button
            type="button"
            className="btn ghost"
            onClick={() => void onLoadVersions(projectId)}
          >
            Versions
          </button>
        ) : null}

        {projectId && versionOptions.length > 0 ? (
          <select
            className="mods-inline-select"
            value={selectedVersion}
            disabled={isCore}
            onChange={(event) =>
              void onApplyVersion(projectId, event.currentTarget.value)
            }
          >
            <option value="">Select version</option>
            {versionOptions.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name} ({entry.versionType})
              </option>
            ))}
          </select>
        ) : null}

        <button
          type="button"
          className="btn danger"
          disabled={isCore}
          onClick={() => onRemove(mod)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function DiscoverCard({
  result,
  installed,
  installing,
  onInstall,
}: {
  result: SearchResult;
  installed: boolean;
  installing: boolean;
  onInstall: (projectId: string) => Promise<void>;
}) {
  return (
    <article className={`mods-discovery-card${installed ? " installed" : ""}`}>
      <div className="mods-discovery-top">
        <img
          src={result.iconUrl || "https://modrinth.com/favicon.ico"}
          alt={result.title}
          className="mods-discovery-icon"
          onError={(event) => {
            event.currentTarget.src = "https://modrinth.com/favicon.ico";
          }}
        />
        <div className="mods-discovery-badges">
          {result.latestVersion ? (
            <span className="mods-mini-badge">{result.latestVersion}</span>
          ) : null}
          {installed ? (
            <span className="mods-mini-badge success">Installed</span>
          ) : null}
        </div>
      </div>

      <div className="mods-discovery-body">
        <h4>{result.title}</h4>
        <p>{result.description || "No description available."}</p>
        <div className="mods-discovery-meta">
          <span>{result.author ? `by ${result.author}` : "Modrinth"}</span>
          {result.categories?.slice(0, 2).map((category) => (
            <span key={category} className="mods-category-badge">
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="mods-discovery-actions">
        {result.slug ? (
          <a
            href={`https://modrinth.com/mod/${result.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn ghost"
          >
            Open
          </a>
        ) : null}
        <button
          type="button"
          className="btn"
          disabled={installed || installing}
          onClick={() => void onInstall(result.projectId)}
        >
          {installed ? "Installed" : installing ? "Installing..." : "Install"}
        </button>
      </div>
    </article>
  );
}

export function CentralModsManagerPage() {
  const { saveDraft } = useTopBarModel();
  const {
    form,
    exaroton,
    isBusy,
    statuses,
    searchResults,
    selectedMods,
    coreModPolicy,
    modVersionOptions,
    setSearchQuery,
    searchMods,
    requestAndConfirmInstall,
    removeMod,
    setModInstallTarget,
    loadModVersions,
    applyModVersion,
    syncExarotonMods,
  } = useModManagerPageModel();
  const [query, setQuery] = useState("");
  const [popularResults, setPopularResults] = useState<SearchResult[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [installingProjectId, setInstallingProjectId] = useState<string | null>(
    null,
  );
  const [removeTarget, setRemoveTarget] = useState<AdminMod | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runtimeVersion = form.minecraftVersion.trim();
  const loaderVersion = form.loaderVersion.trim();
  const installedIds = new Set(
    selectedMods.map((entry) => entry.projectId).filter(Boolean) as string[],
  );
  const coreIds = new Set(coreModPolicy.lockedProjectIds);
  const visibleResults = query.trim() ? searchResults : popularResults;

  async function loadPopularMods() {
    if (!runtimeVersion) {
      return;
    }

    setLoadingPopular(true);
    try {
      const results = await requestJson<SearchResult[]>(
        `/v1/admin/mods/search?query=&minecraftVersion=${encodeURIComponent(runtimeVersion)}`,
        "GET",
      );
      setPopularResults(Array.isArray(results) ? results : []);
    } catch (error) {
      setPopularResults([]);
      console.error("[mods-manager] failed to load popular mods", error);
    } finally {
      setLoadingPopular(false);
    }
  }

  useEffect(() => {
    if (!query.trim()) {
      void loadPopularMods();
    }
  }, [runtimeVersion]);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setSearchQuery(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      void loadPopularMods();
      return;
    }

    debounceRef.current = setTimeout(() => {
      void searchMods();
    }, 350);
  };

  const handleInstall = async (projectId: string) => {
    setInstallingProjectId(projectId);
    try {
      await requestAndConfirmInstall(projectId);
    } finally {
      setInstallingProjectId(null);
    }
  };

  const installedCountLabel = `${selectedMods.length} Active`;

  return (
    <>
      <section className="mods-manager-page">
        <header className="mods-page-hero">
          <div>
            <span className="mods-page-kicker">Central Mods Management</span>
            <h2>Mods Manager</h2>
            <p>
              Manage installed profile mods and discover compatible Modrinth
              packages without leaving the admin console.
            </p>
          </div>

          <div className="mods-page-runtime">
            {runtimeChip("Minecraft", runtimeVersion || "Set in Identity")}
            {runtimeChip("Loader", loaderVersion || "Set in Identity")}
            {runtimeChip("Installed", String(selectedMods.length))}
          </div>
        </header>

        <div className="mods-page-toolbar">
          <label className="mods-search-box">
            <span>Search Modrinth</span>
            <input
              value={query}
              onChange={(event) =>
                handleSearchChange(event.currentTarget.value)
              }
              placeholder="Search mods, utilities, optimization..."
            />
          </label>

          <div className="mods-toolbar-group">
            <div className="mods-toolbar-chip subtle">
              <span>Source</span>
              <strong>Modrinth</strong>
            </div>
            {exaroton.connected ? (
              <button
                type="button"
                className="btn ghost"
                onClick={() => void syncExarotonMods()}
              >
                Sync Server Mods
              </button>
            ) : null}
          </div>
        </div>

        <div className={statusClass(statuses.mods.tone)}>
          {statuses.mods.text}
        </div>

        <div className="mods-manager-layout">
          <section className="mods-surface">
            <div className="mods-section-head">
              <div>
                <h3>Installed Mods</h3>
                <p>
                  Current profile content, including managed core dependencies.
                </p>
              </div>
              <span className="mods-section-count">{installedCountLabel}</span>
            </div>

            {selectedMods.length === 0 ? (
              <p className="mods-empty-state">
                No mods installed yet. Use the discovery section to add
                compatible mods from Modrinth.
              </p>
            ) : (
              <div className="mods-installed-list">
                {selectedMods.map((mod) => (
                  <InstalledModRow
                    key={`${mod.projectId ?? mod.sha256}-${mod.versionId ?? "latest"}`}
                    mod={mod}
                    isCore={coreIds.has(mod.projectId ?? "")}
                    exarotonConnected={exaroton.connected}
                    versionOptions={
                      modVersionOptions[mod.projectId ?? ""] ?? []
                    }
                    onRemove={setRemoveTarget}
                    onLoadVersions={loadModVersions}
                    onApplyVersion={applyModVersion}
                    onSetTarget={setModInstallTarget}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mods-surface">
            <div className="mods-section-head">
              <div>
                <h3>{query.trim() ? "Search Results" : "Popular Mods"}</h3>
                <p>
                  {query.trim()
                    ? "Install matching mods directly into the current draft."
                    : "Top Modrinth packages to seed the profile quickly."}
                </p>
              </div>
              <span className="mods-section-count">
                {loadingPopular && !query.trim()
                  ? "Loading"
                  : `${visibleResults.length} Results`}
              </span>
            </div>

            {loadingPopular && !query.trim() ? (
              <p className="mods-empty-state">Loading popular mods...</p>
            ) : visibleResults.length === 0 ? (
              <p className="mods-empty-state">
                {query.trim()
                  ? "No mods matched that search. Try a broader term."
                  : "No popular mods available for this runtime."}
              </p>
            ) : (
              <div className="mods-discovery-grid">
                {visibleResults.map((result) => (
                  <DiscoverCard
                    key={result.projectId}
                    result={result}
                    installed={installedIds.has(result.projectId)}
                    installing={
                      installingProjectId === result.projectId || isBusy.install
                    }
                    onInstall={handleInstall}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      {removeTarget ? (
        <ModalShell onClose={() => setRemoveTarget(null)}>
          <div className="modal-head">
            <h3 style={{ margin: 0 }}>Remove {removeTarget.name}?</h3>
            <button
              className="modal-close-icon"
              type="button"
              aria-label="Close"
              onClick={() => setRemoveTarget(null)}
            >
              X
            </button>
          </div>
          <p className="warning">
            This mod will be removed from the current draft and will require a
            publish before it reaches players.
          </p>
          <div
            className="row"
            style={{ justifyContent: "flex-end", marginTop: 8 }}
          >
            <button
              className="btn ghost"
              type="button"
              onClick={() => setRemoveTarget(null)}
            >
              Cancel
            </button>
            <button
              className="btn danger"
              type="button"
              onClick={() => {
                removeMod(removeTarget.projectId ?? "", removeTarget.sha256);
                setRemoveTarget(null);
                void saveDraft();
              }}
            >
              Confirm Remove
            </button>
          </div>
        </ModalShell>
      ) : null}
    </>
  );
}
