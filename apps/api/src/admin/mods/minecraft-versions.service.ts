import { Injectable } from '@nestjs/common';
import { AdminHttpClientService } from '../common/admin-http-client.service';

export interface GameVersion {
  version: string;
  stable: boolean;
}

@Injectable()
export class MinecraftVersionsService {
  private readonly fabricMetaBase = 'https://meta.fabricmc.net';
  private cache: { expiresAt: number; value: GameVersion[] } | null = null;

  constructor(private readonly http: AdminHttpClientService) {}

  async getMinecraftVersions() {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return { versions: this.cache.value };
    }

    const url = `${this.fabricMetaBase}/v2/versions/game`;
    const payload = await this.http.requestJson<
      Array<{ version?: string; stable?: boolean }>
    >(url, { upstreamName: 'fabric-meta' });

    const versions = payload
      .map((entry) => ({
        version: entry.version?.trim() ?? '',
        stable: entry.stable === true,
      }))
      .filter((entry) => entry.version.length > 0);

    this.cache = { expiresAt: Date.now() + 10 * 60 * 1000, value: versions };
    return { versions };
  }
}
