import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type SandboxPreviewModel = {
  titleText?: string;
  subtitleText?: string;
  playButtonLabel?: string;
  backgroundAssetId?: string;
  logoAssetId?: string;
  extraButtonLabels?: string[];
  notices?: string[];
};

export type SandboxPreviewResponse = {
  token: string;
  expiresAt: string;
  model: SandboxPreviewModel;
  assets: Array<{ id: string; contentType: string }>;
};

@Injectable()
export class BundleSandboxClient {
  constructor(private readonly config: ConfigService) {}

  private get baseUrl(): string {
    return (
      this.config.get<string>('FANCYMENU_SANDBOX_URL')?.trim() ||
      'http://localhost:3210'
    ).replace(/\/+$/, '');
  }

  private get apiKey(): string {
    return (
      this.config.get<string>('FANCYMENU_SANDBOX_API_KEY')?.trim() ||
      'sandbox-dev-key'
    );
  }

  private get timeoutMs(): number {
    const raw = this.config.get<string>('FANCYMENU_SANDBOX_TIMEOUT_MS')?.trim();
    const value = raw ? Number.parseInt(raw, 10) : 10000;
    if (Number.isFinite(value) && value >= 1000) {
      return value;
    }
    return 10000;
  }

  private get retryAttempts(): number {
    const raw = this.config
      .get<string>('FANCYMENU_SANDBOX_RETRY_ATTEMPTS')
      ?.trim();
    const value = raw ? Number.parseInt(raw, 10) : 4;
    if (Number.isFinite(value) && value >= 1 && value <= 8) {
      return value;
    }
    return 4;
  }

  private get retryBaseDelayMs(): number {
    const raw = this.config
      .get<string>('FANCYMENU_SANDBOX_RETRY_BASE_DELAY_MS')
      ?.trim();
    const value = raw ? Number.parseInt(raw, 10) : 750;
    if (Number.isFinite(value) && value >= 100 && value <= 5000) {
      return value;
    }
    return 750;
  }

  private async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isRetryableNetworkError(error: unknown): boolean {
    const message =
      (error as { message?: string })?.message?.toLowerCase() || '';
    if (message.includes('fetch failed')) {
      return true;
    }

    const causeCode = (
      (error as { cause?: { code?: string } })?.cause?.code || ''
    ).toUpperCase();
    return (
      causeCode === 'ECONNREFUSED' ||
      causeCode === 'ECONNRESET' ||
      causeCode === 'ENOTFOUND' ||
      causeCode === 'EHOSTUNREACH' ||
      causeCode === 'ETIMEDOUT' ||
      causeCode === 'UND_ERR_CONNECT_TIMEOUT' ||
      causeCode === 'UND_ERR_HEADERS_TIMEOUT'
    );
  }

  private async fetchWithRetry(
    path: string,
    method: 'POST' | 'GET',
    payload?: Buffer,
  ): Promise<Response> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.retryAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await fetch(`${this.baseUrl}${path}`, {
          method,
          headers: {
            'x-api-key': this.apiKey,
            ...(payload ? { 'content-type': 'application/zip' } : {}),
          },
          body: payload ? new Uint8Array(payload) : undefined,
          signal: controller.signal,
        });

        if (response.status >= 500 && attempt < this.retryAttempts) {
          await response.arrayBuffer().catch(() => new ArrayBuffer(0));
          await this.wait(this.retryBaseDelayMs * attempt);
          continue;
        }

        return response;
      } catch (error) {
        lastError = error;
        if (
          this.isRetryableNetworkError(error) &&
          attempt < this.retryAttempts
        ) {
          await this.wait(this.retryBaseDelayMs * attempt);
          continue;
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error(
      lastError instanceof Error
        ? lastError.message
        : `Sandbox request failed after ${this.retryAttempts} attempts`,
    );
  }

  private async requestJson<T>(
    path: string,
    method: 'POST' | 'GET',
    payload?: Buffer,
  ): Promise<T> {
    try {
      const response = await this.fetchWithRetry(path, method, payload);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new BadGatewayException(
          text || `Sandbox request failed (${response.status})`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new BadGatewayException(
        (error as Error)?.message || 'Sandbox request failed',
      );
    }
  }

  async validateBundle(payload: Buffer): Promise<{
    entryCount: number;
    totalUncompressedBytes: number;
  }> {
    return this.requestJson('/internal/fancymenu/validate', 'POST', payload);
  }

  async buildPreview(payload: Buffer): Promise<SandboxPreviewResponse> {
    return this.requestJson('/internal/fancymenu/preview', 'POST', payload);
  }

  async fetchPreviewAsset(
    token: string,
    assetId: string,
  ): Promise<{
    body: Buffer;
    contentType: string;
    cacheControl: string;
  }> {
    try {
      const response = await this.fetchWithRetry(
        `/internal/fancymenu/preview/assets/${encodeURIComponent(token)}/${encodeURIComponent(assetId)}`,
        'GET',
      );

      if (response.status === 404) {
        throw new NotFoundException('Preview asset not found');
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new BadGatewayException(
          text || `Preview asset request failed (${response.status})`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      return {
        body: Buffer.from(arrayBuffer),
        contentType:
          response.headers.get('content-type') || 'application/octet-stream',
        cacheControl:
          response.headers.get('cache-control') || 'private, max-age=60',
      };
    } catch (error) {
      if (
        error instanceof BadGatewayException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadGatewayException(
        (error as Error)?.message || 'Preview asset request failed',
      );
    }
  }
}
