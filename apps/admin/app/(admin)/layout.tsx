import type { ReactNode } from "react";

import { AdminConsolePage } from "@/admin/client/admin.client";
import { readServerBootstrapPayload } from "@/admin/server/bootstrap.server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const initialBootstrap = await readServerBootstrapPayload();

  return (
    <>
      <AdminConsolePage initialBootstrap={initialBootstrap}>
        {children}
      </AdminConsolePage>
    </>
  );
}
