import { Module } from '@nestjs/common';
import { AdminCommonModule } from '../common/admin-common.module';
import { AdminSharedModule } from '../admin-shared.module';
import { AdminExarotonController } from './admin-exaroton.controller';
import { AdminExarotonContextService } from './admin-exaroton-context.service';
import { ExarotonCredentialService } from './exaroton-credential.service';
import { ExarotonModsSyncService } from './exaroton-mods-sync.service';
import { ExarotonPlayerAccessService } from './exaroton-player-access.service';
import { ExarotonServerControlService } from './exaroton-server-control.service';
import { ExarotonServerViewService } from './exaroton-server-view.service';

@Module({
  imports: [AdminSharedModule, AdminCommonModule],
  controllers: [AdminExarotonController],
  providers: [
    AdminExarotonContextService,
    ExarotonServerViewService,
    ExarotonCredentialService,
    ExarotonServerControlService,
    ExarotonPlayerAccessService,
    ExarotonModsSyncService,
  ],
  exports: [AdminExarotonContextService],
})
export class AdminExarotonModule {}
