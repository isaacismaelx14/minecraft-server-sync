import { Module } from '@nestjs/common';
import { ArtifactsModule } from '../../artifacts/artifacts.module';
import { AdminCommonModule } from '../common/admin-common.module';
import { AdminSharedModule } from '../admin-shared.module';
import { AdminExarotonModule } from '../exaroton/admin-exaroton.module';
import { AdminModsModule } from '../mods/admin-mods.module';
import { AdminPublishController } from './admin-publish.controller';
import { AdminPublishContextService } from './admin-publish-context.service';
import { LockPayloadBuilderService } from './lock-payload-builder.service';
import { PublishSessionStoreService } from './publish-session-store.service';
import { PublishWorkflowService } from './publish-workflow.service';
import { ReleaseBumpPolicyService } from './release-bump-policy.service';

@Module({
  imports: [
    AdminSharedModule,
    AdminCommonModule,
    ArtifactsModule,
    AdminExarotonModule,
    AdminModsModule,
  ],
  controllers: [AdminPublishController],
  providers: [
    AdminPublishContextService,
    PublishSessionStoreService,
    LockPayloadBuilderService,
    ReleaseBumpPolicyService,
    PublishWorkflowService,
  ],
  exports: [AdminPublishContextService],
})
export class AdminPublishModule {}
