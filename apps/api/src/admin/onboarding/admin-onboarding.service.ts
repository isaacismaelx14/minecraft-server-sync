import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { ProfileLockSchema } from '@minerelay/shared';
import { PrismaService } from '../../db/prisma.service';
import { SigningService } from '../../security/signing.service';
import { CoreModPolicyService } from '../core-mod-policy.service';
import { AdminModsContextService } from '../mods/admin-mods-context.service';
import { generateProfileId } from './generate-profile-id';
import { CompleteOnboardingDto } from './admin-onboarding.dto';

const APP_SETTING_ID = 'global';
const INITIAL_RELEASE_VERSION = '1.0.0';

@Injectable()
export class AdminOnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly signing: SigningService,
    private readonly mods: AdminModsContextService,
    private readonly coreModPolicy: CoreModPolicyService,
  ) {}

  async isOnboardingRequired(): Promise<boolean> {
    const serverId = this.getServerId();
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });
    return server === null;
  }

  async completeOnboarding(
    dto: CompleteOnboardingDto,
    publicBase: string,
  ): Promise<{
    profileId: string;
    version: number;
    releaseVersion: string;
    displayName: string;
    serverAddress: string;
    minecraftVersion: string;
    loader: 'fabric';
    loaderVersion: string;
    brandingLogoUrl?: string;
    brandingBackgroundUrl?: string;
    fancyMenuEnabled: false;
    baseModCount: number;
  }> {
    const serverId = this.getServerId();

    const [existingServer, existingLatestProfile] = await Promise.all([
      this.prisma.server.findUnique({
        where: { id: serverId },
      }),
      this.prisma.profileVersion.findFirst({
        where: { serverId },
        orderBy: { version: 'desc' },
      }),
    ]);
    if (existingServer && existingLatestProfile) {
      throw new ConflictException(
        'Server already exists. Onboarding is only allowed on a fresh setup.',
      );
    }

    const profileId = await generateProfileId(dto.displayName, async (id) => {
      const existing = await this.prisma.server.findFirst({
        where: { profileId: id },
      });
      return existing !== null;
    });

    const serverName = dto.displayName.trim();
    const serverAddress = dto.serverAddress?.trim() ?? '';
    const minecraftVersion = dto.minecraftVersion.trim();
    const loaderVersion = dto.loaderVersion.trim();
    const lockUrl = `${publicBase}/v1/locks/${encodeURIComponent(profileId)}/1`;
    const initialMods = await this.coreModPolicy.normalizeMods({
      mods: [],
      minecraftVersion,
      fancyMenuEnabled: false,
      resolveMod: (projectId, resolvedMinecraftVersion, versionId) =>
        this.mods.resolveCompatibleMod(
          projectId,
          resolvedMinecraftVersion,
          versionId,
        ),
      resolveModWithDependencies: (
        projectId,
        resolvedMinecraftVersion,
        versionId,
      ) =>
        this.mods.resolveCompatibleModWithDependencies(
          projectId,
          resolvedMinecraftVersion,
          {},
          versionId,
        ),
    });
    const fancyMenuSettings = {
      enabled: false,
      mode: 'simple' as const,
      playButtonLabel: 'Play',
      hideSingleplayer: true,
      hideMultiplayer: true,
      hideRealms: true,
    };

    const lockData = ProfileLockSchema.parse({
      profileId,
      version: 1,
      minecraftVersion,
      loader: 'fabric',
      loaderVersion,
      defaultServer: { name: serverName, address: serverAddress },
      items: initialMods,
      resources: [],
      shaders: [],
      configs: [],
      runtimeHints: {
        javaMajor: 21,
        minMemoryMb: 2048,
        maxMemoryMb: 4096,
      },
      branding: {
        serverName,
        ...(dto.brandingLogoUrl ? { logoUrl: dto.brandingLogoUrl } : {}),
        ...(dto.brandingBackgroundUrl
          ? { backgroundUrl: dto.brandingBackgroundUrl }
          : {}),
      },
      fancyMenu: fancyMenuSettings,
    });

    const signature = this.signing.signLockPayload(lockData);

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.profileVersion.deleteMany({
        where: { serverId },
      });
      await tx.server.deleteMany({
        where: { id: serverId },
      });

      await tx.server.create({
        data: {
          id: serverId,
          name: serverName,
          address: serverAddress,
          profileId,
          allowedMinecraftVersions: [minecraftVersion],
          fancyMenuEnabled: false,
          fancyMenuSettings: fancyMenuSettings as Prisma.InputJsonValue,
        },
      });

      await tx.profileVersion.create({
        data: {
          serverId,
          profileId,
          version: 1,
          releaseVersion: INITIAL_RELEASE_VERSION,
          minecraftVersion,
          loader: 'fabric',
          loaderVersion,
          defaultServerName: serverName,
          defaultServerAddress: serverAddress,
          fancyMenuEnabled: false,
          fancyMenuSettings: fancyMenuSettings as Prisma.InputJsonValue,
          lockUrl,
          summaryAdd: initialMods.length,
          summaryRemove: 0,
          summaryUpdate: 0,
          summaryKeep: 0,
          signature: signature?.signature,
          lockJson: lockData as Prisma.InputJsonValue,
        },
      });

      await tx.appSetting.upsert({
        where: { id: APP_SETTING_ID },
        create: {
          id: APP_SETTING_ID,
          supportedMinecraftVersions: [minecraftVersion],
          supportedPlatforms: ['fabric'],
          releaseMajor: 1,
          releaseMinor: 0,
          releasePatch: 0,
        },
        update: {
          supportedMinecraftVersions: [minecraftVersion],
          supportedPlatforms: ['fabric'],
          releaseMajor: 1,
          releaseMinor: 0,
          releasePatch: 0,
        },
      });
    });

    return {
      profileId,
      version: 1,
      releaseVersion: INITIAL_RELEASE_VERSION,
      displayName: serverName,
      serverAddress,
      minecraftVersion,
      loader: 'fabric',
      loaderVersion,
      brandingLogoUrl: dto.brandingLogoUrl,
      brandingBackgroundUrl: dto.brandingBackgroundUrl,
      fancyMenuEnabled: false,
      baseModCount: initialMods.length,
    };
  }

  private getServerId(): string {
    return this.config.get<string>('SERVER_ID') ?? 'mvl';
  }
}
