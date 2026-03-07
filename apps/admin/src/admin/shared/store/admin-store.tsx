"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type PropsWithChildren,
  type ReactElement,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";

import { authFetch, clearAdminSession, requestJson } from "@/admin/client/http";
import type {
  BootstrapPayload,
  AdminMod,
  AdminResourcePack,
  AdminShaderPack,
  CoreModPolicy,
  DependencyAnalysis,
  FabricVersionsPayload,
  SearchResult,
} from "@/admin/client/types";
import {
  buildPublishSnapshot,
  DEFAULT_EXAROTON,
  DEFAULT_FORM,
  DEFAULT_POLICY,
  DEFAULT_STATUS,
  type ExarotonState,
  type FormState,
  type LoaderOption,
  mapBootstrapToForm,
  mapStatusToExarotonState,
  type PendingInstall,
  type PublishSnapshot,
  type RailState,
  type StatusState,
  type StatusTone,
  samePublishSnapshot,
} from "@/admin/shared/domain/admin-form";
import {
  getAdminPathForView,
  type AdminView,
} from "@/admin/shared/domain/admin-view";
import {
  computeServerModDiffSummary,
  mergeMods,
  sameMods,
} from "@/admin/shared/domain/mods";
import { bumpSemver, normalizeSemver } from "@/admin/shared/domain/release";
import {
  readBootstrapPayload,
  readFabricVersionsPayload,
} from "@/admin/shared/services/bootstrap";

type BusyState = {
  bootstrap: boolean;
  search: boolean;
  publish: boolean;
  install: boolean;
};

type AdminStoreValue = {
  view: AdminView;
  setView: (view: AdminView) => void;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  setTextFieldFromEvent: (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  setSearchQuery: (query: string) => void;
  selectedMods: AdminMod[];
  setSelectedMods: Dispatch<SetStateAction<AdminMod[]>>;
  selectedResources: AdminResourcePack[];
  setSelectedResources: Dispatch<SetStateAction<AdminResourcePack[]>>;
  selectedShaders: AdminShaderPack[];
  setSelectedShaders: Dispatch<SetStateAction<AdminShaderPack[]>>;
  coreModPolicy: CoreModPolicy;
  setCoreModPolicy: Dispatch<SetStateAction<CoreModPolicy>>;
  effectiveCorePolicy: CoreModPolicy;
  searchResults: SearchResult[];
  setSearchResults: Dispatch<SetStateAction<SearchResult[]>>;
  dependencyMap: Record<string, DependencyAnalysis>;
  setDependencyMap: Dispatch<
    SetStateAction<Record<string, DependencyAnalysis>>
  >;
  pendingInstall: PendingInstall | null;
  setPendingInstall: Dispatch<SetStateAction<PendingInstall | null>>;
  modVersionOptions: Record<
    string,
    Array<{
      id: string;
      name: string;
      versionType: "release" | "beta" | "alpha";
      publishedAt: string;
    }>
  >;
  setModVersionOptions: Dispatch<
    SetStateAction<
      Record<
        string,
        Array<{
          id: string;
          name: string;
          versionType: "release" | "beta" | "alpha";
          publishedAt: string;
        }>
      >
    >
  >;
  loaderOptions: LoaderOption[];
  setLoaderOptions: Dispatch<SetStateAction<LoaderOption[]>>;
  statuses: StatusState;
  setStatus: (name: keyof StatusState, text: string, tone?: StatusTone) => void;
  exaroton: ExarotonState;
  setExaroton: Dispatch<SetStateAction<ExarotonState>>;
  sessionState: "pending" | "active";
  setSessionState: Dispatch<SetStateAction<"pending" | "active">>;
  hasSavedDraft: boolean;
  setHasSavedDraft: Dispatch<SetStateAction<boolean>>;
  isBusy: BusyState;
  setBusy: (name: keyof BusyState, value: boolean) => void;
  baselineMods: AdminMod[];
  setBaselineMods: Dispatch<SetStateAction<AdminMod[]>>;
  baselineResources: AdminResourcePack[];
  setBaselineResources: Dispatch<SetStateAction<AdminResourcePack[]>>;
  baselineShaders: AdminShaderPack[];
  setBaselineShaders: Dispatch<SetStateAction<AdminShaderPack[]>>;
  baselineRuntime: {
    minecraftVersion: string;
    loaderVersion: string;
  };
  setBaselineRuntime: Dispatch<
    SetStateAction<{
      minecraftVersion: string;
      loaderVersion: string;
    }>
  >;
  lastPublishedSnapshot: PublishSnapshot | null;
  setLastPublishedSnapshot: Dispatch<SetStateAction<PublishSnapshot | null>>;
  rail: RailState;
  summaryStats: {
    add: number;
    remove: number;
    update: number;
    keep: number;
  };
  hasPendingPublish: boolean;
  hasPendingServerModChanges: boolean;
  publishBlockReason: string | null;
  loadBootstrap: (force?: boolean) => Promise<void>;
  loadFabricVersions: (
    minecraftVersionInput: string,
    force?: boolean,
  ) => Promise<void>;
  ensureCoreMods: (
    mods: AdminMod[],
    fancyEnabled: boolean,
    minecraftVersion: string,
  ) => Promise<AdminMod[]>;
  logout: () => Promise<void>;
};

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

function normalizeCoreModPolicy(
  value: Partial<CoreModPolicy> | null | undefined,
): CoreModPolicy {
  const merged = {
    ...DEFAULT_POLICY,
    ...(value ?? {}),
    rules: {
      ...DEFAULT_POLICY.rules,
      ...(value?.rules ?? {}),
    },
  } as CoreModPolicy;

  const nonRemovable = new Set([
    ...(merged.nonRemovableProjectIds ?? []),
    merged.fabricApiProjectId,
    merged.modMenuProjectId,
  ]);
  const locked = new Set([
    ...(merged.lockedProjectIds ?? []),
    merged.fabricApiProjectId,
    merged.modMenuProjectId,
  ]);

  return {
    ...merged,
    nonRemovableProjectIds: Array.from(nonRemovable).filter(Boolean),
    lockedProjectIds: Array.from(locked).filter(Boolean),
  };
}

function buildInitialState(initialBootstrap: BootstrapPayload | null) {
  if (!initialBootstrap) {
    return {
      form: DEFAULT_FORM,
      selectedMods: [] as AdminMod[],
      selectedResources: [] as AdminResourcePack[],
      selectedShaders: [] as AdminShaderPack[],
      coreModPolicy: DEFAULT_POLICY,
      exaroton: DEFAULT_EXAROTON,
      baselineMods: [] as AdminMod[],
      baselineResources: [] as AdminResourcePack[],
      baselineShaders: [] as AdminShaderPack[],
      baselineRuntime: {
        minecraftVersion: "",
        loaderVersion: "",
      },
      sessionState: "pending" as const,
      hasSavedDraft: false,
      loaderOptions: [] as LoaderOption[],
      hasBootstrapped: false,
      lastPublishedSnapshot: null as PublishSnapshot | null,
    };
  }

  const form = mapBootstrapToForm(initialBootstrap);
  const selectedMods = initialBootstrap.latestProfile.mods ?? [];
  const selectedResources = initialBootstrap.latestProfile.resources ?? [];
  const selectedShaders = initialBootstrap.latestProfile.shaders ?? [];

  return {
    form,
    selectedMods,
    selectedResources,
    selectedShaders,
    coreModPolicy: normalizeCoreModPolicy(
      initialBootstrap.latestProfile.coreModPolicy,
    ),
    exaroton: mapStatusToExarotonState(
      initialBootstrap.exaroton,
      DEFAULT_EXAROTON,
    ),
    baselineMods: selectedMods,
    baselineResources: selectedResources,
    baselineShaders: selectedShaders,
    baselineRuntime: {
      minecraftVersion: initialBootstrap.latestProfile.minecraftVersion ?? "",
      loaderVersion: initialBootstrap.latestProfile.loaderVersion ?? "",
    },
    sessionState: "active" as const,
    hasSavedDraft:
      initialBootstrap.hasSavedDraft ?? initialBootstrap.draft !== null,
    loaderOptions: initialBootstrap.fabricVersions?.loaders ?? [],
    hasBootstrapped: true,
    lastPublishedSnapshot: buildPublishSnapshot(
      form,
      selectedMods,
      selectedResources,
      selectedShaders,
    ),
  };
}

export function AdminStoreProvider({
  children,
  initialView = "overview",
  initialBootstrap = null,
}: PropsWithChildren<{
  initialView?: AdminView;
  initialBootstrap?: BootstrapPayload | null;
}>): ReactElement {
  const initialState = useMemo(
    () => buildInitialState(initialBootstrap),
    [initialBootstrap],
  );
  const router = useRouter();
  const [view, setCurrentView] = useState<AdminView>(initialView);
  const [form, setForm] = useState<FormState>(initialState.form);
  const [selectedMods, setSelectedMods] = useState<AdminMod[]>(
    initialState.selectedMods,
  );
  const [selectedResources, setSelectedResources] = useState<
    AdminResourcePack[]
  >(initialState.selectedResources);
  const [selectedShaders, setSelectedShaders] = useState<AdminShaderPack[]>(
    initialState.selectedShaders,
  );
  const [coreModPolicy, setCoreModPolicy] = useState<CoreModPolicy>(
    initialState.coreModPolicy,
  );
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [dependencyMap, setDependencyMap] = useState<
    Record<string, DependencyAnalysis>
  >({});
  const [pendingInstall, setPendingInstall] = useState<PendingInstall | null>(
    null,
  );
  const [modVersionOptions, setModVersionOptions] = useState<
    Record<
      string,
      Array<{
        id: string;
        name: string;
        versionType: "release" | "beta" | "alpha";
        publishedAt: string;
      }>
    >
  >({});
  const [loaderOptions, setLoaderOptions] = useState<LoaderOption[]>(
    initialState.loaderOptions,
  );
  const [sessionState, setSessionState] = useState<"pending" | "active">(
    initialState.sessionState,
  );
  const [statuses, setStatuses] = useState<StatusState>(DEFAULT_STATUS);
  const [exaroton, setExaroton] = useState<ExarotonState>(
    initialState.exaroton,
  );
  const [hasSavedDraft, setHasSavedDraft] = useState(
    initialState.hasSavedDraft,
  );
  const [isBusy, setBusyState] = useState<BusyState>({
    bootstrap: false,
    search: false,
    publish: false,
    install: false,
  });
  const [baselineMods, setBaselineMods] = useState<AdminMod[]>(
    initialState.baselineMods,
  );
  const [baselineResources, setBaselineResources] = useState<
    AdminResourcePack[]
  >(initialState.baselineResources);
  const [baselineShaders, setBaselineShaders] = useState<AdminShaderPack[]>(
    initialState.baselineShaders,
  );
  const [baselineRuntime, setBaselineRuntime] = useState(
    initialState.baselineRuntime,
  );
  const [lastPublishedSnapshot, setLastPublishedSnapshot] =
    useState<PublishSnapshot | null>(initialState.lastPublishedSnapshot);
  const [hasBootstrapped, setHasBootstrapped] = useState(
    initialState.hasBootstrapped,
  );

  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  const setView = useCallback(
    (nextView: AdminView) => {
      setCurrentView(nextView);
      const nextPath = getAdminPathForView(nextView);
      if (
        typeof window !== "undefined" &&
        window.location.pathname === nextPath
      ) {
        return;
      }
      startTransition(() => {
        router.push(nextPath);
      });
    },
    [router],
  );

  const setStatus = useCallback(
    (name: keyof StatusState, text: string, tone: StatusTone = "idle") => {
      setStatuses((current) => ({
        ...current,
        [name]: { text, tone },
      }));
    },
    [],
  );

  const setBusy = useCallback((name: keyof BusyState, value: boolean) => {
    setBusyState((current) => ({ ...current, [name]: value }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setForm((current) => ({ ...current, searchQuery: query }));
  }, []);

  const setTextFieldFromEvent = useCallback(
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const target = event.currentTarget;
      const key = target.name as keyof FormState;
      setForm((current) => ({
        ...current,
        [key]: target.value,
      }));
    },
    [],
  );

  const loadFabricVersions = useCallback(
    async (minecraftVersionInput: string, force = false) => {
      const minecraftVersion = minecraftVersionInput.trim();
      if (!minecraftVersion) {
        setStatus("settings", "Set Minecraft version first.", "error");
        return;
      }

      setStatus("settings", "Loading Fabric versions...");
      try {
        const payload: FabricVersionsPayload = await readFabricVersionsPayload(
          minecraftVersion,
          force,
        );

        const options = payload.loaders ?? [];
        setLoaderOptions(options);
        setForm((current) => {
          const hasCurrent = options.some(
            (entry) => entry.version === current.loaderVersion,
          );
          if (hasCurrent) {
            return current;
          }

          const nextLoader =
            payload.latestStable ??
            options[0]?.version ??
            current.loaderVersion;
          return {
            ...current,
            loaderVersion: nextLoader,
          };
        });
        setStatus("settings", "Fabric versions updated.", "ok");
      } catch (error) {
        setStatus(
          "settings",
          (error as Error).message || "Failed loading Fabric versions.",
          "error",
        );
      }
    },
    [setStatus],
  );

  const ensureCoreMods = useCallback(
    async (
      mods: AdminMod[],
      fancyEnabled: boolean,
      minecraftVersion: string,
    ) => {
      const cleanVersion = minecraftVersion.trim();
      if (!cleanVersion) {
        return mods;
      }

      let next = [...mods];
      if (!fancyEnabled) {
        next = next.filter(
          (mod) => mod.projectId !== coreModPolicy.fancyMenuProjectId,
        );
      }

      const resolveProject = async (projectId: string): Promise<AdminMod> =>
        requestJson<AdminMod>(
          `/v1/admin/mods/resolve?projectId=${encodeURIComponent(projectId)}&minecraftVersion=${encodeURIComponent(cleanVersion)}`,
          "GET",
        );

      const fabricProjectId = coreModPolicy.fabricApiProjectId?.trim();
      const fancyProjectId = coreModPolicy.fancyMenuProjectId?.trim();
      const modMenuProjectId = coreModPolicy.modMenuProjectId?.trim();

      const hasFabric = fabricProjectId
        ? next.some((mod) => mod.projectId === fabricProjectId)
        : true;
      if (!hasFabric) {
        try {
          if (!fabricProjectId) {
            throw new Error("Missing Fabric API projectId in core policy");
          }
          const fabric = await resolveProject(fabricProjectId);
          next = mergeMods(next, [fabric]);
        } catch {
          setStatus("mods", "Could not auto-sync Fabric API.", "error");
        }
      }

      if (fancyEnabled) {
        const hasFancy = fancyProjectId
          ? next.some((mod) => mod.projectId === fancyProjectId)
          : true;
        if (!hasFancy) {
          try {
            if (!fancyProjectId) {
              throw new Error("Missing FancyMenu projectId in core policy");
            }
            const fancy = await resolveProject(fancyProjectId);
            next = mergeMods(next, [fancy]);
          } catch {
            setStatus("mods", "Could not auto-sync FancyMenu mod.", "error");
          }
        }
      }

      const hasModMenu = modMenuProjectId
        ? next.some((mod) => mod.projectId === modMenuProjectId)
        : true;
      if (!hasModMenu) {
        try {
          if (!modMenuProjectId) {
            throw new Error("Missing Mod Menu projectId in core policy");
          }
          const modMenu = await resolveProject(modMenuProjectId);
          next = mergeMods(next, [modMenu]);
        } catch (error) {
          console.warn("[admin] failed to auto-sync Mod Menu", {
            minecraftVersion: cleanVersion,
            projectId: modMenuProjectId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return next;
    },
    [
      coreModPolicy.fabricApiProjectId,
      coreModPolicy.fancyMenuProjectId,
      coreModPolicy.modMenuProjectId,
      setStatus,
    ],
  );

  const loadBootstrap = useCallback(
    async (force = false) => {
      setBusy("bootstrap", true);
      setStatus("bootstrap", "Loading bootstrap...");

      try {
        const payload = await readBootstrapPayload(force);
        const nextForm = mapBootstrapToForm(payload);
        setForm(nextForm);
        setExaroton((current) =>
          mapStatusToExarotonState(payload.exaroton, current),
        );
        setCoreModPolicy(
          normalizeCoreModPolicy(payload.latestProfile.coreModPolicy),
        );
        setSelectedMods(payload.latestProfile.mods ?? []);
        setSelectedResources(payload.latestProfile.resources ?? []);
        setSelectedShaders(payload.latestProfile.shaders ?? []);
        setBaselineMods(payload.latestProfile.mods ?? []);
        setBaselineResources(payload.latestProfile.resources ?? []);
        setBaselineShaders(payload.latestProfile.shaders ?? []);
        setBaselineRuntime({
          minecraftVersion: payload.latestProfile.minecraftVersion ?? "",
          loaderVersion: payload.latestProfile.loaderVersion ?? "",
        });
        setSessionState("active");
        setHasSavedDraft(payload.hasSavedDraft ?? payload.draft !== null);
        setStatus("bootstrap", "Bootstrap loaded.", "ok");
        if (payload.fabricVersions) {
          const options = payload.fabricVersions.loaders ?? [];
          setLoaderOptions(options);
          setForm((current) => {
            const hasCurrent = options.some(
              (entry) => entry.version === current.loaderVersion,
            );
            if (hasCurrent) {
              return current;
            }

            const nextLoader =
              payload.fabricVersions?.latestStable ??
              options[0]?.version ??
              current.loaderVersion;
            return {
              ...current,
              loaderVersion: nextLoader,
            };
          });
        } else {
          await loadFabricVersions(nextForm.minecraftVersion);
        }
        setLastPublishedSnapshot(
          buildPublishSnapshot(
            nextForm,
            payload.latestProfile.mods ?? [],
            payload.latestProfile.resources ?? [],
            payload.latestProfile.shaders ?? [],
          ),
        );
      } catch (error) {
        setStatus(
          "bootstrap",
          (error as Error).message || "Bootstrap failed.",
          "error",
        );
      } finally {
        setBusy("bootstrap", false);
      }
    },
    [loadFabricVersions, setBusy, setStatus],
  );

  useEffect(() => {
    if (hasBootstrapped) {
      return;
    }
    setHasBootstrapped(true);
    void loadBootstrap();
  }, [hasBootstrapped, loadBootstrap]);

  const selectedModsRef = useRef(selectedMods);
  useEffect(() => {
    selectedModsRef.current = selectedMods;
  }, [selectedMods]);

  const runtimeSignatureRef = useRef<string | null>(null);
  useEffect(() => {
    if (sessionState !== "active") {
      return;
    }
    const nextSignature = `${form.fancyMenuEnabled}:${form.minecraftVersion.trim()}`;
    if (runtimeSignatureRef.current === null) {
      runtimeSignatureRef.current = nextSignature;
      return;
    }
    if (runtimeSignatureRef.current === nextSignature) {
      return;
    }
    runtimeSignatureRef.current = nextSignature;

    void (async () => {
      const currentMods = selectedModsRef.current;
      const synced = await ensureCoreMods(
        currentMods,
        form.fancyMenuEnabled === "true",
        form.minecraftVersion,
      );
      if (!sameMods(synced, currentMods)) {
        setSelectedMods(synced);
      }
    })();
  }, [
    ensureCoreMods,
    form.fancyMenuEnabled,
    form.minecraftVersion,
    sessionState,
  ]);

  const effectiveCorePolicy = useMemo<CoreModPolicy>(() => {
    const nonRemovable = new Set(coreModPolicy.nonRemovableProjectIds);
    const locked = new Set(coreModPolicy.lockedProjectIds);
    if (form.fancyMenuEnabled === "true") {
      nonRemovable.add(coreModPolicy.fancyMenuProjectId);
      locked.add(coreModPolicy.fancyMenuProjectId);
    } else {
      nonRemovable.delete(coreModPolicy.fancyMenuProjectId);
      locked.delete(coreModPolicy.fancyMenuProjectId);
    }

    return {
      ...coreModPolicy,
      lockedProjectIds: Array.from(locked),
      nonRemovableProjectIds: Array.from(nonRemovable),
      rules: {
        ...coreModPolicy.rules,
        fancyMenuEnabled: form.fancyMenuEnabled === "true",
      },
    };
  }, [coreModPolicy, form.fancyMenuEnabled]);

  const rail = useMemo<RailState>(() => {
    let bumpType: "major" | "minor" | "patch" = "patch";
    if (
      baselineRuntime.minecraftVersion.trim() !==
        form.minecraftVersion.trim() ||
      baselineRuntime.loaderVersion.trim() !== form.loaderVersion.trim()
    ) {
      bumpType = "major";
    } else if (!sameMods(selectedMods, baselineMods)) {
      bumpType = "minor";
    }
    const currentRelease = normalizeSemver(form.currentReleaseVersion);
    const nextRelease = bumpSemver(currentRelease, bumpType);
    return {
      minecraft: `MC: ${form.minecraftVersion.trim() || "-"}`,
      fabric: `Fabric: ${form.loaderVersion.trim() || "-"}`,
      nextRelease: `Next release: ${nextRelease} (${bumpType})`,
    };
  }, [baselineMods, baselineRuntime, form, selectedMods]);

  const summaryStats = useMemo(() => {
    const baselineMap = new Map<string, AdminMod>();
    for (const mod of baselineMods) {
      baselineMap.set(mod.projectId || mod.name, mod);
    }

    const currentMap = new Map<string, AdminMod>();
    for (const mod of selectedMods) {
      currentMap.set(mod.projectId || mod.name, mod);
    }

    let add = 0;
    let remove = 0;
    let update = 0;
    let keep = 0;

    for (const [id, mod] of currentMap) {
      const base = baselineMap.get(id);
      if (!base) {
        add += 1;
      } else if (
        base.versionId !== mod.versionId ||
        base.sha256 !== mod.sha256
      ) {
        update += 1;
      } else {
        keep += 1;
      }
    }

    for (const id of baselineMap.keys()) {
      if (!currentMap.has(id)) {
        remove += 1;
      }
    }

    return { add, remove, update, keep };
  }, [baselineMods, selectedMods]);

  const serverModSummary = useMemo(
    () => computeServerModDiffSummary(selectedMods, baselineMods),
    [baselineMods, selectedMods],
  );

  const hasPendingServerModChanges = serverModSummary.hasChanges;

  const publishBlockReason = useMemo<string | null>(() => {
    if (!hasPendingServerModChanges) {
      return null;
    }
    if (!exaroton.connected || !exaroton.selectedServer) {
      return null;
    }
    if (!exaroton.settings.modsSyncEnabled) {
      return null;
    }

    const status = exaroton.selectedServer.status;
    if (![0, 7].includes(status)) {
      return "Cannot publish pending server mod changes while Exaroton server is running. Stop the server first.";
    }
    return null;
  }, [
    exaroton.connected,
    exaroton.selectedServer,
    exaroton.settings.modsSyncEnabled,
    hasPendingServerModChanges,
  ]);

  const hasPendingPublish = useMemo(() => {
    if (sessionState !== "active") {
      return false;
    }
    const nextSnapshot = buildPublishSnapshot(
      form,
      selectedMods,
      selectedResources,
      selectedShaders,
    );
    return (
      !samePublishSnapshot(lastPublishedSnapshot, nextSnapshot) ||
      !sameMods(nextSnapshot.mods, lastPublishedSnapshot?.mods ?? [])
    );
  }, [
    form,
    lastPublishedSnapshot,
    selectedMods,
    selectedResources,
    selectedShaders,
    sessionState,
  ]);

  const logout = useCallback(async () => {
    try {
      await authFetch("/v1/admin/auth/logout", { method: "POST" });
    } finally {
      clearAdminSession();
      window.location.href = "/login";
    }
  }, []);

  const value = useMemo<AdminStoreValue>(
    () => ({
      view,
      setView,
      form,
      setForm,
      setTextFieldFromEvent,
      setSearchQuery,
      selectedMods,
      setSelectedMods,
      selectedResources,
      setSelectedResources,
      selectedShaders,
      setSelectedShaders,
      coreModPolicy,
      setCoreModPolicy,
      effectiveCorePolicy,
      searchResults,
      setSearchResults,
      dependencyMap,
      setDependencyMap,
      pendingInstall,
      setPendingInstall,
      modVersionOptions,
      setModVersionOptions,
      loaderOptions,
      setLoaderOptions,
      statuses,
      setStatus,
      exaroton,
      setExaroton,
      sessionState,
      setSessionState,
      hasSavedDraft,
      setHasSavedDraft,
      isBusy,
      setBusy,
      baselineMods,
      setBaselineMods,
      baselineResources,
      setBaselineResources,
      baselineShaders,
      setBaselineShaders,
      baselineRuntime,
      setBaselineRuntime,
      lastPublishedSnapshot,
      setLastPublishedSnapshot,
      rail,
      summaryStats,
      hasPendingPublish,
      hasPendingServerModChanges,
      publishBlockReason,
      loadBootstrap,
      loadFabricVersions,
      ensureCoreMods,
      logout,
    }),
    [
      baselineMods,
      baselineResources,
      baselineShaders,
      baselineRuntime,
      coreModPolicy,
      dependencyMap,
      effectiveCorePolicy,
      exaroton,
      form,
      hasPendingPublish,
      hasPendingServerModChanges,
      hasSavedDraft,
      isBusy,
      lastPublishedSnapshot,
      loadBootstrap,
      loadFabricVersions,
      loaderOptions,
      logout,
      modVersionOptions,
      pendingInstall,
      publishBlockReason,
      rail,
      searchResults,
      selectedMods,
      selectedResources,
      selectedShaders,
      sessionState,
      setBusy,
      setSearchQuery,
      setStatus,
      setTextFieldFromEvent,
      setView,
      statuses,
      summaryStats,
      ensureCoreMods,
      view,
    ],
  );

  return (
    <AdminStoreContext.Provider value={value}>
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore(): AdminStoreValue {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error("useAdminStore must be used inside AdminStoreProvider");
  }
  return context;
}
