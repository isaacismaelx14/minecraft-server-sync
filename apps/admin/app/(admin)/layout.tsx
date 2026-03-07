import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminConsolePage } from "@/admin/client/admin.client";
import { readServerBootstrapPayload } from "@/admin/server/bootstrap.server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const hasAdminSessionCookie =
    cookieStore.has("mvl_admin_access") || cookieStore.has("mvl_admin_refresh");

  if (!hasAdminSessionCookie) {
    redirect("/login");
  }

  const initialBootstrap = await readServerBootstrapPayload();

  return (
    <>
      <AdminConsolePage initialBootstrap={initialBootstrap}>
        {children}
      </AdminConsolePage>
    </>
  );
}
