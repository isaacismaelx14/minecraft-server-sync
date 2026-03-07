"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type {
  AdminResourcePack,
  AdminShaderPack,
  SearchResult,
} from "@/admin/client/types";
import { mergeAssets } from "@/admin/shared/domain/mods";
import { useAdminStore } from "@/admin/shared/store/admin-store";

type AssetType = "resourcepack" | "shaderpack";
type ModrinthSearchResponse = {
  hits: Array<{
    project_id: string;
    slug: string;
    title: string;
    description: string;
    author: string;
    icon_url?: string;
    categories?: string[];
    latest_version?: string;
  }>;
};
type ModrinthProject = {
  id: string;
  slug: string;
  title: string;
  icon_url?: string;
};
type ModrinthVersion = {
  id: string;
  version_type: "release" | "beta" | "alpha";
  date_published: string;
  game_versions: string[];
  files: Array<{ url: string; primary?: boolean }>;
};

function shaTypeRank(value: ModrinthVersion["version_type"]) {
  if (value === "release") return 0;
  if (value === "beta") return 1;
  return 2;
}

async function sha256HexFromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download asset for hash (${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function resolvePackFromModrinth(
  projectId: string,
  minecraftVersion: string,
  type: AssetType,
): Promise<AdminResourcePack | AdminShaderPack> {
  const [projectResponse, versionsResponse] = await Promise.all([
    fetch(
      `https://api.modrinth.com/v2/project/${encodeURIComponent(projectId)}`,
    ),
    fetch(
      `https://api.modrinth.com/v2/project/${encodeURIComponent(projectId)}/version`,
    ),
  ]);

  if (!projectResponse.ok) {
    throw new Error(`Failed to fetch project (${projectResponse.status})`);
  }
  if (!versionsResponse.ok) {
    throw new Error(
      `Failed to fetch project versions (${versionsResponse.status})`,
    );
  }

  const project = (await projectResponse.json()) as ModrinthProject;
  const versions = (await versionsResponse.json()) as ModrinthVersion[];
  const compatible = versions
    .filter((entry) => entry.game_versions.includes(minecraftVersion))
    .sort((left, right) => {
      const rank =
        shaTypeRank(left.version_type) - shaTypeRank(right.version_type);
      if (rank !== 0) {
        return rank;
      }
      return Date.parse(right.date_published) - Date.parse(left.date_published);
    });

  const selected = compatible[0];
  if (!selected) {
    throw new Error(
      `No compatible ${type} version found for Minecraft ${minecraftVersion}`,
    );
  }
  const file =
    selected.files.find((entry) => entry.primary) ?? selected.files[0];
  if (!file) {
    throw new Error("No downloadable file found for selected version");
  }
  const sha256 = await sha256HexFromUrl(file.url);

  return {
    kind: type,
    name: project.title,
    provider: "modrinth",
    projectId: project.id,
    versionId: selected.id,
    url: file.url,
    sha256,
    iconUrl: project.icon_url,
    slug: project.slug,
  };
}

async function fetchPopularFromModrinth(
  type: AssetType,
  minecraftVersion: string,
): Promise<SearchResult[]> {
  const facets = JSON.stringify([
    [`project_type:${type === "resourcepack" ? "resourcepack" : "shader"}`],
    [`versions:${minecraftVersion}`],
  ]);
  const modrinthUrl = `https://api.modrinth.com/v2/search?query=&index=follows&limit=10&facets=${encodeURIComponent(facets)}`;
  const response = await fetch(modrinthUrl);
  if (!response.ok) {
    throw new Error(`Failed loading popular ${type}s (${response.status})`);
  }

  const json = (await response.json()) as ModrinthSearchResponse;
  return (json.hits ?? []).map((hit) => ({
    projectId: hit.project_id,
    title: hit.title,
    description: hit.description,
    iconUrl: hit.icon_url,
    slug: hit.slug,
    author: hit.author,
    categories: hit.categories,
    latestVersion: hit.latest_version,
  }));
}

export function useAssetsPageModel() {
  const router = useRouter();
  const store = useAdminStore();
  const [modalType, setModalType] = useState<AssetType | null>(null);
  const [popular, setPopular] = useState<SearchResult[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const openPopularModal = async (type: AssetType) => {
    const minecraftVersion = store.form.minecraftVersion.trim();
    if (!minecraftVersion) {
      store.setStatus("mods", "Set Minecraft version first.", "error");
      return;
    }

    setModalType(type);
    setLoadingPopular(true);
    try {
      const payload = await fetchPopularFromModrinth(type, minecraftVersion);
      setPopular(payload ?? []);
      store.setStatus(
        "mods",
        `Loaded popular ${type === "resourcepack" ? "resourcepacks" : "shaderpacks"}.`,
        "ok",
      );
    } catch (error) {
      setPopular([]);
      store.setStatus(
        "mods",
        (error as Error).message || "Failed to load popular assets.",
        "error",
      );
    } finally {
      setLoadingPopular(false);
    }
  };

  const closePopularModal = () => {
    setModalType(null);
    setPopular([]);
    setInstallingId(null);
  };

  const installFromPopular = async (projectId: string) => {
    if (!modalType) {
      return;
    }

    const minecraftVersion = store.form.minecraftVersion.trim();
    if (!minecraftVersion) {
      store.setStatus("mods", "Set Minecraft version first.", "error");
      return;
    }

    setInstallingId(projectId);
    try {
      if (modalType === "resourcepack") {
        const resolved = (await resolvePackFromModrinth(
          projectId,
          minecraftVersion,
          "resourcepack",
        )) as AdminResourcePack;
        const next = mergeAssets(store.selectedResources, [resolved]);
        store.setSelectedResources(next);
      } else {
        const resolved = (await resolvePackFromModrinth(
          projectId,
          minecraftVersion,
          "shaderpack",
        )) as AdminShaderPack;
        const next = mergeAssets(store.selectedShaders, [resolved]);
        store.setSelectedShaders(next);
      }

      store.setStatus("mods", "Asset installed.", "ok");
      closePopularModal();
    } catch (error) {
      console.error("[assets] failed to install asset from Modrinth", {
        projectId,
        minecraftVersion,
        modalType,
        error,
      });
      store.setStatus(
        "mods",
        (error as Error).message || "Failed installing asset.",
        "error",
      );
    } finally {
      setInstallingId(null);
    }
  };

  const removeResource = (projectId?: string, sha256?: string) => {
    const next = store.selectedResources.filter((entry) => {
      if (projectId && entry.projectId === projectId) return false;
      if (sha256 && entry.sha256 === sha256) return false;
      return true;
    });
    store.setSelectedResources(next);
    store.setStatus("mods", "Resourcepack removed.", "ok");
  };

  const removeShader = (projectId?: string, sha256?: string) => {
    const next = store.selectedShaders.filter((entry) => {
      if (projectId && entry.projectId === projectId) return false;
      if (sha256 && entry.sha256 === sha256) return false;
      return true;
    });
    store.setSelectedShaders(next);
    store.setStatus("mods", "Shaderpack removed.", "ok");
  };

  return {
    status: store.statuses.mods,
    selectedMods: store.selectedMods,
    selectedResources: store.selectedResources,
    selectedShaders: store.selectedShaders,
    openModsManager: () => router.push("/assets/mods"),
    modalType,
    popular,
    loadingPopular,
    installingId,
    openPopularModal,
    closePopularModal,
    installFromPopular,
    removeResource,
    removeShader,
  };
}
