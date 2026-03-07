import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { ArtifactsStorageService } from '../../artifacts/artifacts-storage.service';
import { BundleSandboxClient } from '../bundle-sandbox.client';
import { AdminArtifactKeyService } from './admin-artifact-key.service';
import {
  AdminUploadedFile,
  AdminUploadValidationService,
} from './admin-upload-validation.service';

@Injectable()
export class AdminMediaContextService {
  constructor(
    private readonly artifactsStorage: ArtifactsStorageService,
    private readonly sandboxClient: BundleSandboxClient,
    private readonly keyBuilder: AdminArtifactKeyService,
    private readonly uploadValidation: AdminUploadValidationService,
  ) {}

  async uploadMedia(file: AdminUploadedFile, requestOrigin: string) {
    const validated = this.uploadValidation.validateImage(file);
    const stamp = Date.now().toString(36);
    const token = randomBytes(6).toString('hex');
    const fileName = `admin-image-${stamp}-${token}${validated.ext}`;
    const key = this.keyBuilder.buildServerAssetKey('media', fileName);
    await this.artifactsStorage.putArtifact({
      key,
      body: file.buffer,
      contentType: validated.contentType,
    });

    return {
      fileName,
      key,
      url: this.artifactsStorage.artifactUrlForKey(key, requestOrigin),
      size: file.size,
      contentType: validated.contentType,
    };
  }

  async uploadFancyMenuBundle(file: AdminUploadedFile, requestOrigin: string) {
    this.uploadValidation.validateFancyMenuBundle(file);
    const validation = await this.sandboxClient.validateBundle(file.buffer);
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');

    const stamp = Date.now().toString(36);
    const token = randomBytes(6).toString('hex');
    const fileName = `fancymenu-bundle-${stamp}-${token}.zip`;
    const key = this.keyBuilder.buildServerAssetKey('bundles', fileName);
    await this.artifactsStorage.putArtifact({
      key,
      body: file.buffer,
      contentType: 'application/zip',
    });

    return {
      fileName,
      key,
      url: this.artifactsStorage.artifactUrlForKey(key, requestOrigin),
      sha256,
      size: file.size,
      entryCount: validation.entryCount,
    };
  }
}
