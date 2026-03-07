"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from "react";

import { AdminShell } from "@/admin/features/shell/components/admin-shell";
import {
  AdminProvider,
  getAdminViewForPath,
  type AdminView,
} from "./admin-context";

export function AdminConsolePage({
  children,
}: PropsWithChildren): ReactElement {
  const pathname = usePathname();
  const [initialView, setInitialView] = useState<AdminView>("overview");

  useEffect(() => {
    setInitialView(getAdminViewForPath(pathname));
  }, [pathname]);

  return (
    <AdminProvider initialView={initialView}>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
