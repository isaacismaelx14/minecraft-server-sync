import React from "react";
import { ModalShell } from "./modal-shell";

interface DiscoverModalProps {
  title: string;
  icon?: React.ReactNode;
  searchPlaceholder: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onClose: () => void;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function DiscoverModal({
  title,
  icon,
  searchPlaceholder,
  searchQuery,
  onSearchQueryChange,
  onClose,
  sidebar,
  footer,
  children,
}: DiscoverModalProps) {
  return (
    <ModalShell onClose={onClose} wide>
      <div className="flex items-center justify-between border-b border-[var(--color-line)] p-[16px_20px] shrink-0">
        <h3 className="m-0 flex items-center gap-2 text-lg">
          {icon ? (
            <span className="material-symbols-outlined text-[var(--color-brand-primary)]">
              {icon}
            </span>
          ) : null}
          {title}
        </h3>
        <button
          className="bg-transparent border-none text-[var(--color-text-muted)] cursor-pointer text-[1.2rem] flex items-center justify-center w-[32px] h-[32px] rounded-[var(--radius-sm)] transition-all duration-200 hover:bg-white/10 hover:text-white"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="p-5 border-b border-[var(--color-line)] bg-black/10 shrink-0">
        <input
          type="text"
          className="w-full px-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-line)] rounded-lg focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] text-sm transition-all text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>

      <div
        className="flex gap-[24px] min-h-[50vh] max-h-[70vh]"
        style={{ flex: 1, minHeight: 0 }}
      >
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {sidebar ? (
          <div className="w-[320px] overflow-y-auto border-l border-[var(--color-line)] p-5 bg-black/5">
            {sidebar}
          </div>
        ) : null}
      </div>

      {footer ? (
        <div className="py-[16px] px-[20px] border-t border-[var(--color-line)] flex justify-between items-center shrink-0 bg-[var(--color-bg-card)]">
          {footer}
        </div>
      ) : null}
    </ModalShell>
  );
}
