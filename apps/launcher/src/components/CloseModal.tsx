import { memo } from "react";
import { Button, Modal } from "@minerelay/ui";

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
  if (variant === "playing") {
    return (
      <Modal
        onClose={onCancel}
        cardClassName="w-full max-w-[calc(100vw-32px)] min-w-0 p-(--space-4) gap-(--space-3)"
      >
        <div
          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-warning-bg text-warning-bright"
          aria-hidden="true"
        >
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
        <h2 className="m-0 text-[1.2rem] leading-tight font-semibold text-white">
          Quit while playing?
        </h2>
        <p className="m-0 text-[0.92rem] leading-normal text-text-muted">
          Minecraft is currently running. Quitting now could break your game
          session and cause data loss.
        </p>
        <div className="mt-1 flex gap-2 self-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onQuit}>
            Quit Anyway
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      onClose={onCancel}
      cardClassName="w-full max-w-[calc(100vw-32px)] min-w-0 p-(--space-4) gap-(--space-3)"
    >
      <div
        className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand-primary/15 text-brand-primary"
        aria-hidden="true"
      >
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
      <h2 className="m-0 text-[1.2rem] leading-tight font-semibold text-white">
        Close MineRelay?
      </h2>
      <p className="m-0 text-[0.92rem] leading-normal text-text-muted">
        You can quit the app completely, or keep it running in the background so
        it stays ready.
      </p>
      <div className="mt-1 flex gap-2 self-end">
        <Button variant="outline" size="sm" onClick={onKeepInBackground}>
          Keep in Background
        </Button>
        <Button variant="primary" effect="glass" size="sm" onClick={onQuit}>
          Quit
        </Button>
      </div>
    </Modal>
  );
});
