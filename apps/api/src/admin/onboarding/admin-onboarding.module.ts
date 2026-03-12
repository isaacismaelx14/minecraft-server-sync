import { Module } from '@nestjs/common';
import { AdminModsModule } from '../mods/admin-mods.module';
import { AdminSharedModule } from '../admin-shared.module';
import { AdminOnboardingController } from './admin-onboarding.controller';
import { AdminOnboardingService } from './admin-onboarding.service';

@Module({
  imports: [AdminSharedModule, AdminModsModule],
  controllers: [AdminOnboardingController],
  providers: [AdminOnboardingService],
  exports: [AdminOnboardingService],
})
export class AdminOnboardingModule {}
