import { Body, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AdminApiController } from '../admin-api.controller.decorator';
import { RequestOriginService } from '../common/request-origin.service';
import { CompleteOnboardingDto } from './admin-onboarding.dto';
import { AdminOnboardingService } from './admin-onboarding.service';

@AdminApiController()
export class AdminOnboardingController {
  constructor(
    private readonly onboarding: AdminOnboardingService,
    private readonly origin: RequestOriginService,
  ) {}

  @Post('/admin/onboarding/complete')
  completeOnboarding(
    @Body() dto: CompleteOnboardingDto,
    @Req() request: Request,
  ) {
    return this.onboarding.completeOnboarding(
      dto,
      this.origin.resolve(request),
    );
  }
}
