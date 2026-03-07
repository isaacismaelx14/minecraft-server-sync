import { memo, useEffect, useRef } from "react";

export type CloseModalVariant = "normal" | "playing";

interface CloseModalProps {
  variant: CloseModalVariant;
  onQuit: () => void;
  onKeepInBackground: () => void;
  onCancel: () => void;
}

export const CloseModal = memo(function CloseModal({
  variant,
  onQuit,
  onKeepInBackground,
  onCancel,
}: CloseModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) {
      onCancel();
    }
  }

  if (variant === "playing") {
    return (
      <div
        className="close-modal-overlay"
        ref={overlayRef}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-modal-title"
      >
        <div className="close-modal">
          <div className="close-modal-icon warning" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 id="close-modal-title">Quit while playing?</h2>
          <p>
            Minecraft is currently running. Quitting now could break your game
            session and cause data loss.
          </p>
          <div className="close-modal-actions">
            <button
              ref={primaryBtnRef}
              className="btn ghost"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button className="btn danger" onClick={onQuit}>
              Quit Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="close-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="close-modal-title"
    >
      <div className="close-modal">
        <div className="close-modal-icon info" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
        </div>
        <h2 id="close-modal-title">Close MineRelay?</h2>
        <p>
          You can quit the app completely, or keep it running in the background
          so it stays ready.
        </p>
        <div className="close-modal-actions">
          <button className="btn ghost" onClick={onKeepInBackground}>
            Keep in Background
          </button>
          <button ref={primaryBtnRef} className="btn primary" onClick={onQuit}>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
});
