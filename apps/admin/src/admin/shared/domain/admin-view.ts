export type AdminView =
  | "overview"
  | "identity"
  | "assets"
  | "fancy"
  | "servers"
  | "launcher";

const ADMIN_VIEW_PATHS: Record<AdminView, string> = {
  overview: "/",
  identity: "/identity",
  assets: "/assets",
  fancy: "/fancy-menu",
  servers: "/servers",
  launcher: "/launcher",
};

export function getAdminPathForView(view: AdminView): string {
  return ADMIN_VIEW_PATHS[view];
}

export function getAdminViewForPath(
  pathname: string | null | undefined,
): AdminView {
  const normalized = pathname && pathname !== "" ? pathname : "/";
  if (normalized === "/identity") {
    return "identity";
  }
  if (
    normalized === "/assets" ||
    normalized === "/assets/mods" ||
    normalized === "/assets/resourcepacks" ||
    normalized === "/assets/shaderpacks"
  ) {
    return "assets";
  }
  if (normalized === "/fancy-menu") {
    return "fancy";
  }
  if (normalized === "/servers") {
    return "servers";
  }
  if (normalized === "/launcher") {
    return "launcher";
  }
  return "overview";
}
