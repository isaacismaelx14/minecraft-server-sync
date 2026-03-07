import { BadGatewayException, Injectable } from '@nestjs/common';
import { extname } from 'node:path';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type AdminUploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class AdminUploadValidationService {
  validateImage(file: AdminUploadedFile) {
    this.assertFilePresent(file);

    if (!file.mimetype.startsWith('image/')) {
      throw new BadGatewayException('Only image uploads are supported');
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadGatewayException('Image must be 10MB or smaller');
    }

    const allowedExt = new Set(['.png', '.jpg', '.jpeg', '.webp']);
    const fromName = extname(file.originalname || '').toLowerCase();
    const ext = allowedExt.has(fromName)
      ? fromName
      : file.mimetype === 'image/png'
        ? '.png'
        : file.mimetype === 'image/webp'
          ? '.webp'
          : '.jpg';

    return {
      ext,
      contentType: file.mimetype,
    };
  }

  validateFancyMenuBundle(file: AdminUploadedFile) {
    this.assertFilePresent(file);

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadGatewayException('FancyMenu bundle must be 10MB or smaller');
    }

    const fileExt = extname(file.originalname || '').toLowerCase();
    if (fileExt !== '.zip') {
      throw new BadGatewayException('FancyMenu bundle must be a .zip file');
    }
  }

  private assertFilePresent(file: AdminUploadedFile) {
    if (!file || !file.buffer || file.size <= 0) {
      throw new BadGatewayException('No file uploaded');
    }
  }
}
