import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProfileLock, ProfileLockSchema } from '@minerelay/shared';
import { PrismaService } from '../../db/prisma.service';
import { AdminHttpClientService } from '../common/admin-http-client.service';
import {
  AdminErrorCode,
  createAdminHttpException,
} from '../common/admin-error-catalog';
import { ExarotonApiClient } from './exaroton-api.client';
import { ExarotonCredentialService } from './exaroton-credential.service';
import {
  EXAROTON_INTEGRATION_ID,
  EXAROTON_MODS_SYNC_STATE_PATH,
  ExarotonModsSyncResult,
  ExarotonModsSyncSummary,
  ExarotonSyncStateFile,
  PublishProgressEvent,
  ServerModDiffSummary,
  SyncModsOptions,
} from './exaroton.types';

@Injectable()
export class ExarotonModsSyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly http: AdminHttpClientService,
    private readonly exarotonClient: ExarotonApiClient,
    private readonly credentials: ExarotonCredentialService,
  ) {}

  async syncModsNow(): Promise<ExarotonModsSyncResult> {
    const serverId = this.getServerId();
    const latest = await this.prisma.profileVersion.findFirst({
      where: { serverId },
      orderBy: { version: 'desc' },
    });

    if (!latest) {
      throw createAdminHttpException(
        AdminErrorCode.PROFILE_VERSION_NOT_FOUND,
        `No profile version found for server '${serverId}'`,
      );
    }

    const lock = ProfileLockSchema.parse(latest.lockJson);
    return this.trySyncExarotonMods(lock);
  }

  async ensurePublishAllowedForServerModChanges(
    serverModSummary: ServerModDiffSummary,
  ) {
    if (!serverModSummary.hasChanges) {
      return;
    }

    const integration = await this.prisma.exarotonIntegration.findUnique({
      where: { id: EXAROTON_INTEGRATION_ID },
    });
    if (!integration) {
      return;
    }

    const settings = this.credentials.readSettings(integration);
    if (!settings.modsSyncEnabled) {
      return;
    }

    const selectedServerId = integration.selectedServerId?.trim();
    if (!selectedServerId) {
      return;
    }

    const { apiKey } = await this.credentials.requireConnection();
    const selectedServer = await this.exarotonClient.getServer(
      apiKey,
      selectedServerId,
    );

    const isRunning = ![0, 7].includes(selectedServer.status);
    if (isRunning) {
      throw createAdminHttpException(
        AdminErrorCode.INVALID_INPUT,
        'Cannot publish pending server mod changes while server is running. Stop the Exaroton server first.',
      );
    }
  }

  async trySyncExarotonMods(
    lock: ProfileLock,
    options?: SyncModsOptions,
  ): Promise<ExarotonModsSyncResult> {
    const zero: ExarotonModsSyncSummary = { add: 0, remove: 0, keep: 0 };
    const onProgress = options?.onProgress;

    try {
      const integration = await this.prisma.exarotonIntegration.findUnique({
        where: { id: EXAROTON_INTEGRATION_ID },
      });
      if (!integration) {
        return {
          attempted: false,
          success: false,
          message: 'Exaroton account is not connected.',
          summary: zero,
        };
      }

      const settings = this.credentials.readSettings(integration);
      if (!settings.modsSyncEnabled) {
        return {
          attempted: false,
          success: false,
          message: 'Exaroton mods sync is disabled in settings.',
          summary: zero,
        };
      }

      const selectedServerId = integration.selectedServerId?.trim();
      if (!selectedServerId) {
        return {
          attempted: false,
          success: false,
          message: 'Select an Exaroton server first.',
          summary: zero,
        };
      }

      const { apiKey } = await this.credentials.requireConnection();
      const serverMods = lock.items.filter(
        (item) =>
          item.kind === 'mod' &&
          (item.side === 'server' || item.side === 'both'),
      );

      const desired = new Map<
        string,
        {
          sha256: string;
          url: string;
          projectId?: string;
          versionId?: string;
        }
      >();

      for (const mod of serverMods) {
        const filename = this.extractRemoteFilename(mod.url);
        desired.set(filename, {
          sha256: mod.sha256,
          url: mod.url,
          projectId: mod.projectId,
          versionId: mod.versionId,
        });
      }

      const modsFolderProbe = await this.exarotonClient.getFileData(
        apiKey,
        selectedServerId,
        'mods',
      );
      if (!modsFolderProbe) {
        await this.exarotonClient.putFileData(
          apiKey,
          selectedServerId,
          'mods',
          '',
          'inode/directory',
        );
      }

      const state = await this.readExarotonModsSyncState(
        apiKey,
        selectedServerId,
      );
      const previous = new Map(
        (state?.files ?? []).map((file) => [file.filename, file]),
      );

      const summary: ExarotonModsSyncSummary = { add: 0, remove: 0, keep: 0 };
      let announcedDownloadStage = false;
      let announcedSyncStage = false;

      for (const [filename, desiredFile] of desired.entries()) {
        const existing = previous.get(filename);
        if (
          existing?.sha256?.toLowerCase() === desiredFile.sha256.toLowerCase()
        ) {
          summary.keep += 1;
          continue;
        }

        if (!announcedDownloadStage) {
          this.pushProgress(onProgress, {
            stage: 'getting-mods',
            message: 'Getting mods to upload to server...',
          });
          announcedDownloadStage = true;
        }

        const body = await this.downloadRemoteAsset(desiredFile.url);
        if (!announcedSyncStage) {
          this.pushProgress(onProgress, {
            stage: 'syncing-mods',
            message: 'Syncing mods with server...',
          });
          announcedSyncStage = true;
        }

        await this.exarotonClient.putFileData(
          apiKey,
          selectedServerId,
          `mods/${filename}`,
          body,
        );
        summary.add += 1;
      }

      for (const [filename] of previous.entries()) {
        if (desired.has(filename)) {
          continue;
        }
        if (!announcedSyncStage) {
          this.pushProgress(onProgress, {
            stage: 'syncing-mods',
            message: 'Syncing mods with server...',
          });
          announcedSyncStage = true;
        }
        await this.exarotonClient.deleteFileData(
          apiKey,
          selectedServerId,
          `mods/${filename}`,
        );
        summary.remove += 1;
      }

      const nextState: ExarotonSyncStateFile = {
        version: 1,
        syncedAt: new Date().toISOString(),
        files: Array.from(desired.entries()).map(([filename, value]) => ({
          filename,
          sha256: value.sha256,
          url: value.url,
          projectId: value.projectId,
          versionId: value.versionId,
        })),
      };

      await this.exarotonClient.putFileData(
        apiKey,
        selectedServerId,
        EXAROTON_MODS_SYNC_STATE_PATH,
        JSON.stringify(nextState, null, 2),
        'application/json',
      );

      this.pushProgress(onProgress, {
        stage: 'done',
        message: 'Done. Mods synchronized with server.',
      });

      return {
        attempted: true,
        success: true,
        message: 'Exaroton server mods synchronized.',
        summary,
      };
    } catch (error) {
      return {
        attempted: true,
        success: false,
        message: (error as Error).message || 'Exaroton server mod sync failed.',
        summary: zero,
      };
    }
  }

  private pushProgress(
    emit: ((event: PublishProgressEvent) => void) | undefined,
    event: PublishProgressEvent,
  ) {
    emit?.(event);
  }

  private async readExarotonModsSyncState(
    apiKey: string,
    serverId: string,
  ): Promise<ExarotonSyncStateFile | null> {
    const payload = await this.exarotonClient.getFileData(
      apiKey,
      serverId,
      EXAROTON_MODS_SYNC_STATE_PATH,
    );

    if (!payload || payload.length === 0) {
      return null;
    }

    try {
      const parsed = JSON.parse(
        payload.toString('utf8'),
      ) as ExarotonSyncStateFile;
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.files)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private async downloadRemoteAsset(url: string): Promise<Buffer> {
    const payload = await this.http.requestBytes(url, {
      upstreamName: 'mod-artifact-download',
      maxResponseBytes: 100 * 1024 * 1024,
    });
    if (!payload || payload.length === 0) {
      throw new BadGatewayException('Could not download server mod artifact');
    }
    return payload;
  }

  private extractRemoteFilename(url: string): string {
    try {
      const parsed = new URL(url);
      const pieces = parsed.pathname.split('/').filter(Boolean);
      const last = pieces[pieces.length - 1]?.trim();
      if (!last) {
        throw new Error('empty');
      }
      return last;
    } catch {
      throw new BadGatewayException(`Invalid mod URL for server sync: ${url}`);
    }
  }

  private getServerId() {
    return this.config.get<string>('SERVER_ID') ?? 'mvl';
  }
}
