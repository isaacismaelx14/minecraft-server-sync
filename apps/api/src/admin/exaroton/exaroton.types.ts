import { ProfileLock } from '@minerelay/shared';

export const EXAROTON_INTEGRATION_ID = 'global';
export const EXAROTON_MODS_SYNC_STATE_PATH = 'mods/.minerelay-sync.json';

export type ExarotonSettingsState = {
  modsSyncEnabled: boolean;
  playerCanViewStatus: boolean;
  playerCanViewOnlinePlayers: boolean;
  playerCanModifyStatus: boolean;
  playerCanStartServer: boolean;
  playerCanStopServer: boolean;
  playerCanRestartServer: boolean;
};

export type ExarotonMappedSettings = {
  serverStatusEnabled: true;
  modsSyncEnabled: boolean;
  playerCanViewStatus: boolean;
  playerCanViewOnlinePlayers: boolean;
  playerCanStartServer: boolean;
  playerCanStopServer: boolean;
  playerCanRestartServer: boolean;
};

export type ExarotonMappedServer = {
  id: string;
  name: string;
  address: string;
  motd: string;
  status: number;
  statusLabel: string;
  players: { max: number; count: number };
  software: { id: string; name: string; version: string } | null;
  shared: boolean;
};

export type ExarotonBootstrapState = {
  configured: boolean;
  connected: boolean;
  account: {
    name: string | null;
    email: string | null;
  } | null;
  selectedServer: ExarotonMappedServer | null;
  settings: ExarotonMappedSettings;
  error: string | null;
};

export type ExarotonModsSyncSummary = {
  add: number;
  remove: number;
  keep: number;
};

export type ExarotonModsSyncResult = {
  attempted: boolean;
  success: boolean;
  message: string;
  summary: ExarotonModsSyncSummary;
};

export type ExarotonSyncStateFile = {
  version: 1;
  syncedAt: string;
  files: Array<{
    filename: string;
    sha256: string;
    url?: string;
    projectId?: string;
    versionId?: string;
  }>;
};

export type ServerModDiffSummary = {
  add: number;
  remove: number;
  update: number;
  keep: number;
  hasChanges: boolean;
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

export type SyncModsOptions = {
  onProgress?: (event: PublishProgressEvent) => void;
};

export type ExarotonSyncInput = {
  lock: ProfileLock;
  options?: SyncModsOptions;
};
