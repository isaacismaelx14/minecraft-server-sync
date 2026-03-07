import { Injectable } from '@nestjs/common';
import { ProfileLock } from '@minerelay/shared';
import {
  ExarotonModsSyncResultDto,
  ExarotonServerStatusDto,
  UpdateExarotonSettingsDto,
} from '../admin.dto';
import { ExarotonCredentialService } from './exaroton-credential.service';
import { ExarotonModsSyncService } from './exaroton-mods-sync.service';
import { ExarotonPlayerAccessService } from './exaroton-player-access.service';
import { ExarotonServerControlService } from './exaroton-server-control.service';
import { PublishProgressEvent, ServerModDiffSummary } from './exaroton.types';

@Injectable()
export class AdminExarotonContextService {
  constructor(
    private readonly credentials: ExarotonCredentialService,
    private readonly control: ExarotonServerControlService,
    private readonly playerAccess: ExarotonPlayerAccessService,
    private readonly modsSync: ExarotonModsSyncService,
  ) {}

  connect(apiKey: string) {
    return this.credentials.connect(apiKey);
  }

  disconnect() {
    return this.credentials.disconnect();
  }

  getStatus() {
    return this.credentials.getBootstrapState();
  }

  listServers() {
    return this.control.listServers();
  }

  selectServer(serverId: string) {
    return this.control.selectServer(serverId);
  }

  serverAction(action: 'start' | 'stop' | 'restart') {
    return this.control.serverAction(action);
  }

  updateSettings(input: UpdateExarotonSettingsDto) {
    return this.credentials.updateSettings(input);
  }

  syncModsNow(): Promise<ExarotonModsSyncResultDto> {
    return this.modsSync.syncModsNow();
  }

  openStatusStream(handlers: {
    onStatus: (server: ExarotonServerStatusDto) => void;
    onError: (message: string) => void;
  }): Promise<() => void> {
    return this.control.openStatusStream(handlers);
  }

  getLauncherPlayerServerStatus() {
    return this.playerAccess.getLauncherPlayerServerStatus();
  }

  runLauncherPlayerServerAction(action: 'start' | 'stop' | 'restart') {
    return this.playerAccess.runLauncherPlayerServerAction(action);
  }

  openLauncherPlayerStatusStream(handlers: {
    onStatus: (server: ExarotonServerStatusDto) => void;
    onError: (message: string) => void;
  }): Promise<() => void> {
    return this.playerAccess.openLauncherPlayerStatusStream(handlers);
  }

  getExarotonBootstrapState() {
    return this.credentials.getBootstrapState();
  }

  ensurePublishAllowedForServerModChanges(
    serverModSummary: ServerModDiffSummary,
  ) {
    return this.modsSync.ensurePublishAllowedForServerModChanges(
      serverModSummary,
    );
  }

  trySyncExarotonMods(
    lock: ProfileLock,
    options?: { onProgress?: (event: PublishProgressEvent) => void },
  ) {
    return this.modsSync.trySyncExarotonMods(lock, options);
  }
}
