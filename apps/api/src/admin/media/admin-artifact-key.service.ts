import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminArtifactKeyService {
  constructor(private readonly config: ConfigService) {}

  buildServerAssetKey(kind: 'media' | 'bundles', fileName: string): string {
    const rootPrefix = this.getAssetsRootPrefix();
    const serverFolder = this.getServerId().replace(/[^a-zA-Z0-9._-]+/g, '-');
    const safeServerFolder = serverFolder || 'mvl';
    const safeFileName = fileName.replace(/[\\/]+/g, '-');
    return `${rootPrefix}/${safeServerFolder}/${kind}/${safeFileName}`;
  }

  private getAssetsRootPrefix(): string {
    const configured = this.config.get<string>('ASSETS_KEY_PREFIX')?.trim();
    const defaultPrefix =
      (this.config.get<string>('NODE_ENV')?.trim().toLowerCase() ||
        'development') === 'production'
        ? 'assets'
        : 'dev/assets';

    const rawPrefix = configured || defaultPrefix;
    const normalizedPrefix = rawPrefix
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');

    if (!normalizedPrefix) {
      return defaultPrefix;
    }

    const segments = normalizedPrefix.split('/');
    if (segments.some((segment) => segment === '.' || segment === '..')) {
      return defaultPrefix;
    }

    return normalizedPrefix;
  }

  private getServerId() {
    return this.config.get<string>('SERVER_ID') ?? 'mvl';
  }
}
