"use client";

import { ModalShell } from "@/admin/shared/ui/modal-shell";
import { statusClass } from "@/admin/shared/ui/status";

import { useAssetsPageModel } from "../hooks/use-assets-page-model";

function PopularAssetModal({
  type,
  popular,
  loading,
  installingId,
  onClose,
  onInstall,
}: {
  type: "resourcepack" | "shaderpack";
  popular: Array<{
    projectId: string;
    title: string;
    author: string;
    description: string;
    iconUrl?: string;
  }>;
  loading: boolean;
  installingId: string | null;
  onClose: () => void;
  onInstall: (projectId: string) => Promise<void>;
}) {
  const title = type === "resourcepack" ? "Add Resourcepack" : "Add Shaderpack";

  return (
    <ModalShell onClose={onClose} cardClassName="modal-card wide">
      <div
        className="modal-head"
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button
          className="modal-close-icon"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div style={{ padding: "16px 20px" }}>
        <p className="hint" style={{ marginTop: 0 }}>
          Top 10 popular on Modrinth.
        </p>

        {loading ? (
          <p className="hint">Loading...</p>
        ) : popular.length === 0 ? (
          <p className="hint">No popular items found.</p>
        ) : (
          <div className="list">
            {popular.map((entry) => (
              <div key={entry.projectId} className="list-row">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "1px solid var(--line)",
                      background: "rgba(255,255,255,.04)",
                      flexShrink: 0,
                    }}
                  >
                    {entry.iconUrl ? (
                      <img
                        src={entry.iconUrl}
                        alt={`${entry.title} icon`}
                        width={42}
                        height={42}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : null}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{entry.title}</div>
                    <div className="hint">by {entry.author}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => void onInstall(entry.projectId)}
                  disabled={installingId === entry.projectId}
                >
                  {installingId === entry.projectId ? "Adding..." : "Add"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function AssetIcon({
  src,
  alt,
  fallback,
  size = 24,
}: {
  src?: string;
  alt: string;
  fallback: string;
  size?: number;
}) {
  return (
    <div
      className="asset-icon"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(12, Math.round(size * 0.5))}px`,
      }}
      aria-hidden="true"
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

function EmptyAssetState({ text }: { text: string }) {
  return <p className="assets-empty">{text}</p>;
}

export function AssetsPage() {
  const {
    status,
    selectedMods,
    selectedResources,
    selectedShaders,
    openModsManager,
    modalType,
    popular,
    loadingPopular,
    installingId,
    openPopularModal,
    closePopularModal,
    installFromPopular,
    removeResource,
    removeShader,
  } = useAssetsPageModel();

  const modPreview = selectedMods.slice(0, 6);
  const hiddenMods = Math.max(selectedMods.length - modPreview.length, 0);

  return (
    <section className="section">
      <header className="section-head">
        <div>
          <h2>Assets</h2>
          <p className="hint">
            Manage user-side assets. Mods, resourcepacks, and shaderpacks are
            tracked here.
          </p>
        </div>
      </header>

      <div className={statusClass(status.tone)}>{status.text}</div>

      <div className="assets-board">
        <section className="assets-section assets-section-full">
          <div className="assets-section-head">
            <div className="assets-head-meta">
              <h3>Mods</h3>
              <span className="assets-count">
                Installed: {selectedMods.length}
              </span>
            </div>
            <button type="button" className="btn" onClick={openModsManager}>
              Open Mods Manager
            </button>
          </div>

          <div className="assets-list-shell">
            {modPreview.length === 0 ? (
              <EmptyAssetState text="No mods installed yet." />
            ) : (
              <div className="assets-list">
                {modPreview.map((entry) => (
                  <div
                    key={`${entry.projectId ?? entry.sha256}-${entry.versionId ?? "latest"}`}
                    className="assets-row"
                  >
                    <div className="assets-row-meta">
                      <AssetIcon
                        src={entry.iconUrl}
                        alt={`${entry.name} icon`}
                        fallback="M"
                      />
                      <div className="assets-row-text">
                        <strong>{entry.name}</strong>
                        <span>
                          {entry.side === "both" ? "user + server" : entry.side}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={openModsManager}
                    >
                      Managed in Mods Manager
                    </button>
                  </div>
                ))}
              </div>
            )}
            {hiddenMods > 0 ? (
              <p className="assets-more">
                +{hiddenMods} more mod(s) in Mods Manager.
              </p>
            ) : null}
          </div>
        </section>

        <section className="assets-section">
          <div className="assets-section-head">
            <div className="assets-head-meta">
              <h3>Resourcepacks</h3>
              <span className="assets-count">
                Installed: {selectedResources.length}
              </span>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => void openPopularModal("resourcepack")}
            >
              Add Resourcepack
            </button>
          </div>

          <div className="assets-list-shell">
            {selectedResources.length === 0 ? (
              <EmptyAssetState text="No resourcepacks installed." />
            ) : (
              <div className="assets-list">
                {selectedResources.map((entry) => (
                  <div key={entry.sha256} className="assets-row">
                    <div className="assets-row-meta">
                      <AssetIcon
                        src={entry.iconUrl}
                        alt={`${entry.name} icon`}
                        fallback="R"
                      />
                      <div className="assets-row-text">
                        <strong>{entry.name}</strong>
                        <span>
                          {entry.slug ?? entry.projectId ?? "custom pack"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() =>
                        removeResource(entry.projectId, entry.sha256)
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="assets-section">
          <div className="assets-section-head">
            <div className="assets-head-meta">
              <h3>Shaderpacks</h3>
              <span className="assets-count">
                Installed: {selectedShaders.length}
              </span>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => void openPopularModal("shaderpack")}
            >
              Add Shaderpack
            </button>
          </div>

          <div className="assets-list-shell">
            {selectedShaders.length === 0 ? (
              <EmptyAssetState text="No shaderpacks installed." />
            ) : (
              <div className="assets-list">
                {selectedShaders.map((entry) => (
                  <div key={entry.sha256} className="assets-row">
                    <div className="assets-row-meta">
                      <AssetIcon
                        src={entry.iconUrl}
                        alt={`${entry.name} icon`}
                        fallback="S"
                      />
                      <div className="assets-row-text">
                        <strong>{entry.name}</strong>
                        <span>
                          {entry.slug ?? entry.projectId ?? "custom shader"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() =>
                        removeShader(entry.projectId, entry.sha256)
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {modalType ? (
        <PopularAssetModal
          type={modalType}
          popular={popular}
          loading={loadingPopular}
          installingId={installingId}
          onClose={closePopularModal}
          onInstall={installFromPopular}
        />
      ) : null}
    </section>
  );
}
