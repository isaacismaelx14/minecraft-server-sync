import { ProfileLock } from '@minerelay/shared';

export type ExarotonModsSyncResult = {
  attempted: boolean;
  success: boolean;
  message: string;
  summary: {
    add: number;
    remove: number;
    keep: number;
  };
};

export type PublishSummary = {
  add: number;
  remove: number;
  update: number;
  keep: number;
};

export type ServerModDiffSummary = PublishSummary & {
  hasChanges: boolean;
};

export type PublishProfileResult = {
  version: number;
  releaseVersion: string;
  bumpType: 'major' | 'minor' | 'patch';
  lockUrl: string;
  summary: PublishSummary;
  serverModSummary: ServerModDiffSummary;
  exarotonSync?: ExarotonModsSyncResult;
};

export type PublishProgressStage =
  | 'detecting-mod-changes'
  | 'getting-mods'
  | 'syncing-mods'
  | 'done';

export type PublishProgressEvent = {
  stage: PublishProgressStage;
  message: string;
};

export type PublishSession = {
  createdAt: number;
  done: boolean;
  events: PublishProgressEvent[];
  result: PublishProfileResult | null;
  error: string | null;
  listeners: Set<
    (event: { type: 'progress' | 'done' | 'error'; data: unknown }) => void
  >;
};

export type BumpType = 'major' | 'minor' | 'patch';

export type SemverParts = {
  major: number;
  minor: number;
  patch: number;
};

export type LockPayloadInput = {
  profileId?: string;
  version: number;
  serverName: string;
  serverAddress: string;
  minecraftVersion: string;
  loaderVersion: string;
  mods: Array<{
    kind: 'mod';
    name: string;
    provider: 'modrinth' | 'direct';
    side: 'client' | 'server' | 'both';
    clientSide?: 'required' | 'optional' | 'unsupported';
    serverSide?: 'required' | 'optional' | 'unsupported';
    projectId?: string;
    versionId?: string;
    url: string;
    sha256: string;
    iconUrl?: string;
    slug?: string;
  }>;
  resources: Array<{
    kind: 'resourcepack';
    name: string;
    provider: 'modrinth' | 'direct';
    projectId?: string;
    versionId?: string;
    url: string;
    sha256: string;
    iconUrl?: string;
    slug?: string;
  }>;
  shaders: Array<{
    kind: 'shaderpack';
    name: string;
    provider: 'modrinth' | 'direct';
    projectId?: string;
    versionId?: string;
    url: string;
    sha256: string;
    iconUrl?: string;
    slug?: string;
  }>;
  fancyMenu: {
    enabled?: boolean;
    mode?: 'simple' | 'custom';
    playButtonLabel?: string;
    hideSingleplayer?: boolean;
    hideMultiplayer?: boolean;
    hideRealms?: boolean;
    customLayoutUrl?: string;
    customLayoutSha256?: string;
  };
  branding?: {
    logoUrl?: string;
    backgroundUrl?: string;
    newsUrl?: string;
  };
  previousLockJson?: unknown;
};

export type BuiltLockPayload = {
  lock: ProfileLock;
};
