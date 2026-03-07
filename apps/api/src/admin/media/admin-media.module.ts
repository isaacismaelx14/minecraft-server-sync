import { Module } from '@nestjs/common';
import { ArtifactsModule } from '../../artifacts/artifacts.module';
import { AdminCommonModule } from '../common/admin-common.module';
import { AdminSharedModule } from '../admin-shared.module';
import { AdminArtifactKeyService } from './admin-artifact-key.service';
import { AdminMediaController } from './admin-media.controller';
import { AdminMediaContextService } from './admin-media-context.service';
import { AdminUploadValidationService } from './admin-upload-validation.service';

@Module({
  imports: [AdminSharedModule, AdminCommonModule, ArtifactsModule],
  controllers: [AdminMediaController],
  providers: [
    AdminMediaContextService,
    AdminArtifactKeyService,
    AdminUploadValidationService,
  ],
  exports: [AdminMediaContextService],
})
export class AdminMediaModule {}
