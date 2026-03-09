import { memo, useEffect, useRef } from "react";
import { useToast } from "@minerelay/ui";
import type { ToastMessage } from "../types";

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer = memo(function ToastContainer({
  toasts,
}: ToastContainerProps) {
  const { pushToast } = useToast();
  const shownToastIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const nextIds = new Set<number>();

    for (const toast of toasts) {
      nextIds.add(toast.id);

      if (shownToastIdsRef.current.has(toast.id)) {
        continue;
      }

      pushToast(toast.tone === "error" ? "error" : "info", toast.text);
    }

    shownToastIdsRef.current = nextIds;
  }, [pushToast, toasts]);

  return null;
});
