import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import {
  FancyMenuSettingsSchema,
  ProfileLock,
  ProfileLockSchema,
} from '@minerelay/shared';
import { ArtifactsStorageService } from '../../artifacts/artifacts-storage.service';
import { BundleSandboxClient } from '../bundle-sandbox.client';
import { AdminHttpClientService } from '../common/admin-http-client.service';
import { CoreModPolicyService, ManagedMod } from '../core-mod-policy.service';
import { AdminModsContextService } from '../mods/admin-mods-context.service';
import { LockPayloadInput } from './publish.types';

const FANCY_MENU_BUNDLE_CONFIG_NAME = 'FancyMenu Custom Bundle';
const MAX_FANCY_BUNDLE_UPLOAD_BYTES = 10 * 1024 * 1024;

@Injectable()
export class LockPayloadBuilderService {
  private readonly logger = new Logger(LockPayloadBuilderService.name);

  constructor(
    private readonly sandboxClient: BundleSandboxClient,
    private readonly coreModPolicy: CoreModPolicyService,
    private readonly artifactsStorage: ArtifactsStorageService,
    private readonly http: AdminHttpClientService,
    private readonly mods: AdminModsContextService,
  ) {}

  async buildLockPayload(input: LockPayloadInput): Promise<ProfileLock> {
    const cleanServerName = input.serverName.trim();
    const cleanServerAddress = input.serverAddress.trim();
    const cleanMinecraftVersion = input.minecraftVersion.trim();
    const cleanLoaderVersion = input.loaderVersion.trim();

    const profileId =
      input.profileId?.trim() ||
      this.slugify(cleanServerName || 'server-profile');
    const fancyMenuSettings = this.normalizeFancyMenuSettings(input.fancyMenu);
    const includeFancyMenu = fancyMenuSettings.enabled;
    const draftMods: ManagedMod[] = input.mods.filter(
      (entry) =>
        !entry.name.toLowerCase().includes('server lock') &&
        !entry.url.includes('server-lock-'),
    ) as ManagedMod[];

    const mods = await this.coreModPolicy.normalizeMods({
      mods: draftMods,
      minecraftVersion: cleanMinecraftVersion,
      fancyMenuEnabled: includeFancyMenu,
      resolveMod: (
        projectId: string,
        minecraftVersion: string,
        versionId?: string,
      ) =>
        this.mods.resolveCompatibleMod(projectId, minecraftVersion, versionId),
      resolveModWithDependencies: (
        projectId: string,
        minecraftVersion: string,
        versionId?: string,
      ) =>
        this.mods.resolveCompatibleModWithDependencies(
          projectId,
          minecraftVersion,
          {},
          versionId,
        ),
    });

    const configs = [];
    if (includeFancyMenu && fancyMenuSettings.mode === 'custom') {
      if (
        !fancyMenuSettings.customLayoutUrl ||
        !fancyMenuSettings.customLayoutSha256
      ) {
        throw new BadGatewayException(
          'FancyMenu custom mode requires customLayoutUrl and customLayoutSha256',
        );
      }
      await this.revalidateFancyMenuBundleArtifact(
        fancyMenuSettings.customLayoutUrl,
        fancyMenuSettings.customLayoutSha256,
      );
      configs.push({
        kind: 'config' as const,
        name: FANCY_MENU_BUNDLE_CONFIG_NAME,
        url: fancyMenuSettings.customLayoutUrl,
        sha256: fancyMenuSettings.customLayoutSha256,
      });
    }

    const previousParsed = ProfileLockSchema.safeParse(input.previousLockJson);
    const previousBranding = previousParsed.success
      ? previousParsed.data.branding
      : null;
    const previousRuntime = previousParsed.success
      ? previousParsed.data.runtimeHints
      : null;

    return ProfileLockSchema.parse({
      profileId,
      version: input.version,
      minecraftVersion: cleanMinecraftVersion,
      loader: 'fabric',
      loaderVersion: cleanLoaderVersion,
      defaultServer: {
        name: cleanServerName,
        address: cleanServerAddress,
      },
      items: mods,
      resources: input.resources,
      shaders: input.shaders,
      configs,
      runtimeHints: previousRuntime ?? {
        javaMajor: 17,
        minMemoryMb: 4096,
        maxMemoryMb: 8192,
      },
      branding: {
        serverName: cleanServerName,
        logoUrl:
          input.branding?.logoUrl?.trim() ||
          previousBranding?.logoUrl ||
          'https://images.unsplash.com/photo-1579546929662-711aa81148cf?auto=format&fit=crop&w=320&q=80',
        backgroundUrl:
          input.branding?.backgroundUrl?.trim() ||
          previousBranding?.backgroundUrl ||
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
        newsUrl:
          input.branding?.newsUrl?.trim() ||
          previousBranding?.newsUrl ||
          'https://example.com/news',
      },
      fancyMenu: fancyMenuSettings,
    });
  }

  normalizeFancyMenuSettings(input?: {
    enabled?: boolean;
    mode?: 'simple' | 'custom';
    playButtonLabel?: string;
    hideSingleplayer?: boolean;
    hideMultiplayer?: boolean;
    hideRealms?: boolean;
    customLayoutUrl?: string;
    customLayoutSha256?: string;
  }) {
    const settings = FancyMenuSettingsSchema.parse({
      enabled: input?.enabled ?? true,
      mode: input?.mode ?? 'simple',
      playButtonLabel: input?.playButtonLabel?.trim() || 'Play',
      hideSingleplayer: input?.hideSingleplayer ?? true,
      hideMultiplayer: input?.hideMultiplayer ?? true,
      hideRealms: input?.hideRealms ?? true,
      customLayoutUrl: input?.customLayoutUrl?.trim() || undefined,
      customLayoutSha256: input?.customLayoutSha256?.trim() || undefined,
    });

    if (!settings.enabled || settings.mode !== 'custom') {
      return {
        ...settings,
        mode: 'simple' as const,
        customLayoutUrl: undefined,
        customLayoutSha256: undefined,
      };
    }

    return settings;
  }

  private async revalidateFancyMenuBundleArtifact(
    bundleUrl: string,
    expectedSha256: string,
  ) {
    const payload = await this.loadFancyMenuBundlePayload(bundleUrl);
    if (!payload || payload.length === 0) {
      throw new BadGatewayException(
        'FancyMenu bundle artifact is missing or unreadable',
      );
    }

    if (payload.length > MAX_FANCY_BUNDLE_UPLOAD_BYTES) {
      throw new BadGatewayException('FancyMenu bundle must be 10MB or smaller');
    }

    if (extname(bundleUrl).toLowerCase() !== '.zip') {
      throw new BadGatewayException(
        'FancyMenu bundle artifact must be a .zip file',
      );
    }

    const actualSha = createHash('sha256').update(payload).digest('hex');
    if (actualSha.toLowerCase() !== expectedSha256.toLowerCase()) {
      throw new BadGatewayException(
        'FancyMenu bundle SHA-256 does not match artifact content',
      );
    }

    try {
      return await this.sandboxClient.validateBundle(payload);
    } catch (error) {
      const detail = (error as Error).message.toLowerCase();
      const isConnectivityError =
        detail.includes('fetch failed') ||
        detail.includes('timeout') ||
        detail.includes('econn') ||
        detail.includes('enotfound') ||
        detail.includes('sandbox request failed') ||
        detail.includes('upstream service is unavailable') ||
        detail.includes('upstream service timed out');
      if (!isConnectivityError) {
        throw error;
      }
      this.logger.warn(
        `[fancymenu] sandbox validation unavailable; continuing with checksum-only validation for publish. detail=${detail}`,
      );
      return {
        entryCount: 0,
        totalUncompressedBytes: payload.length,
      };
    }
  }

  private tryResolveArtifactKeyFromUrl(url: string): string | null {
    try {
      return this.artifactsStorage.keyFromArtifactUrl(url);
    } catch {
      return null;
    }
  }

  private async loadFancyMenuBundlePayload(bundleUrl: string): Promise<Buffer> {
    const fileKey = this.tryResolveArtifactKeyFromUrl(bundleUrl);
    if (fileKey) {
      const artifact = await this.artifactsStorage
        .getArtifact(fileKey)
        .catch(() => null);
      if (artifact?.body && artifact.body.length > 0) {
        return artifact.body;
      }
    }

    const body = await this.http.requestBytes(bundleUrl, {
      upstreamName: 'fancymenu-bundle',
      maxResponseBytes: MAX_FANCY_BUNDLE_UPLOAD_BYTES + 1024,
    });
    if (body.length === 0) {
      throw new BadGatewayException(
        'FancyMenu bundle artifact is missing or unreadable',
      );
    }
    if (body.length > MAX_FANCY_BUNDLE_UPLOAD_BYTES) {
      throw new BadGatewayException('FancyMenu bundle must be 10MB or smaller');
    }
    return body;
  }

  private slugify(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
