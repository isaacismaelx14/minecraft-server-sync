import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../db/prisma.service';
import { SigningService } from '../../security/signing.service';
import { PublishProfileDto } from '../admin.dto';
import { AdminExarotonContextService } from '../exaroton/admin-exaroton-context.service';
import { LockPayloadBuilderService } from './lock-payload-builder.service';
import { ReleaseBumpPolicyService } from './release-bump-policy.service';
import {
  ExarotonModsSyncResult,
  PublishProfileResult,
  PublishProgressEvent,
} from './publish.types';

const APP_SETTING_ID = 'global';

@Injectable()
export class PublishWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly signing: SigningService,
    private readonly lockBuilder: LockPayloadBuilderService,
    private readonly releaseBump: ReleaseBumpPolicyService,
    private readonly exaroton: AdminExarotonContextService,
  ) {}

  async publishProfile(
    input: PublishProfileDto,
    requestOrigin: string,
    options?: { onProgress?: (event: PublishProgressEvent) => void },
  ): Promise<PublishProfileResult> {
    const onProgress = options?.onProgress;
    const serverId = this.getServerId();
    const publicBase = this.resolvePublicBaseUrl(requestOrigin);

    const published = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const [server, latest] = await Promise.all([
          tx.server.findUnique({ where: { id: serverId } }),
          tx.profileVersion.findFirst({
            where: { serverId },
            orderBy: { version: 'desc' },
          }),
        ]);

        if (!server || !latest) {
          throw new NotFoundException(
            `No profile version found for server '${serverId}'`,
          );
        }

        const nextVersion = latest.version + 1;
        const profileId =
          input.profileId?.trim() || server.profileId || latest.profileId;
        const fancyMenu = this.lockBuilder.normalizeFancyMenuSettings(
          input.fancyMenu,
        );

        const generated = await this.lockBuilder.buildLockPayload({
          profileId,
          version: nextVersion,
          serverName: input.serverName,
          serverAddress: input.serverAddress,
          minecraftVersion: input.minecraftVersion,
          loaderVersion: input.loaderVersion,
          mods: input.mods,
          resources: input.resources ?? [],
          shaders: input.shaders ?? [],
          fancyMenu,
          branding: {
            logoUrl: input.branding?.logoUrl?.trim() || undefined,
            backgroundUrl: input.branding?.backgroundUrl?.trim() || undefined,
            newsUrl: input.branding?.newsUrl?.trim() || undefined,
          },
          previousLockJson: latest.lockJson,
        });

        const lockUrl = `${publicBase}/v1/locks/${encodeURIComponent(profileId)}/${nextVersion}`;
        const summary = this.releaseBump.computeDiffSummary(
          latest.lockJson,
          generated,
        );
        const serverModSummary = this.releaseBump.computeServerModDiffSummary(
          latest.lockJson,
          generated,
        );
        const lockSignature = this.signing.signLockPayload(generated);
        const allowedVersions = Array.from(
          new Set([...server.allowedMinecraftVersions, input.minecraftVersion]),
        );

        onProgress?.({
          stage: 'detecting-mod-changes',
          message: `Getting mod changes (+${serverModSummary.add} / ~${serverModSummary.update} / -${serverModSummary.remove}).`,
        });

        await this.exaroton.ensurePublishAllowedForServerModChanges(
          serverModSummary,
        );

        const appSettings = await tx.appSetting.upsert({
          where: { id: APP_SETTING_ID },
          create: {
            id: APP_SETTING_ID,
            supportedMinecraftVersions: allowedVersions,
            supportedPlatforms: ['fabric'],
            releaseMajor: 1,
            releaseMinor: 0,
            releasePatch: 0,
          },
          update: {},
        });

        const currentSemver = {
          major: appSettings.releaseMajor,
          minor: appSettings.releaseMinor,
          patch: appSettings.releasePatch,
        };
        const bumpType = this.releaseBump.classifyReleaseBump({
          latest,
          next: input,
          summary,
        });
        const nextSemver = this.releaseBump.bumpSemver(currentSemver, bumpType);
        const releaseVersion = this.releaseBump.formatSemver(nextSemver);

        await tx.server.update({
          where: { id: serverId },
          data: {
            name: input.serverName.trim(),
            address: input.serverAddress.trim(),
            profileId,
            fancyMenuEnabled: fancyMenu.enabled,
            fancyMenuSettings: fancyMenu as Prisma.InputJsonValue,
            allowedMinecraftVersions: allowedVersions,
          },
        });

        await tx.profileVersion.create({
          data: {
            serverId,
            profileId,
            version: nextVersion,
            releaseVersion,
            minecraftVersion: generated.minecraftVersion,
            loader: generated.loader,
            loaderVersion: generated.loaderVersion,
            defaultServerName: generated.defaultServer.name,
            defaultServerAddress: generated.defaultServer.address,
            fancyMenuEnabled: generated.fancyMenu.enabled,
            fancyMenuSettings: generated.fancyMenu as Prisma.InputJsonValue,
            lockUrl,
            summaryAdd: summary.add,
            summaryRemove: summary.remove,
            summaryUpdate: summary.update,
            summaryKeep: summary.keep,
            signature: lockSignature?.signature,
            lockJson: generated as Prisma.InputJsonValue,
          },
        });

        await tx.appSetting.update({
          where: { id: APP_SETTING_ID },
          data: {
            releaseMajor: nextSemver.major,
            releaseMinor: nextSemver.minor,
            releasePatch: nextSemver.patch,
            supportedMinecraftVersions: allowedVersions,
            publishDraft: Prisma.DbNull,
          },
        });

        return {
          version: nextVersion,
          releaseVersion,
          bumpType,
          lockUrl,
          summary,
          serverModSummary,
          generatedLock: generated,
        };
      },
      {
        maxWait: 10_000,
        timeout: 60_000,
      },
    );

    const { generatedLock, serverModSummary, ...publishPayload } = published;

    let exarotonSync: ExarotonModsSyncResult | undefined;
    if (serverModSummary.hasChanges) {
      exarotonSync = await this.exaroton.trySyncExarotonMods(generatedLock, {
        onProgress,
      });
    } else {
      exarotonSync = {
        attempted: false,
        success: false,
        message: 'No server mod changes detected. Exaroton sync skipped.',
        summary: { add: 0, remove: 0, keep: 0 },
      };
      onProgress?.({
        stage: 'done',
        message: 'Done. No server mod changes were pending for sync.',
      });
    }

    return {
      ...publishPayload,
      serverModSummary,
      exarotonSync,
    };
  }

  private resolvePublicBaseUrl(fallbackOrigin: string): string {
    const configured = this.config.get<string>('PUBLIC_BASE_URL')?.trim();
    if (configured) {
      return configured.replace(/\/+$/, '');
    }
    return fallbackOrigin;
  }

  private getServerId() {
    return this.config.get<string>('SERVER_ID') ?? 'mvl';
  }
}
