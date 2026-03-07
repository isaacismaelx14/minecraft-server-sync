import { Controller, Get, Param, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProfileResponseDto } from './profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@Throttle({ public_read: { limit: 120, ttl: 60000 } })
@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('/profile')
  @ApiOkResponse({ type: ProfileResponseDto })
  getDefaultProfile(@Req() request: Request) {
    return this.profileService.getDefaultProfile(
      this.resolveRequestOrigin(request),
    );
  }

  @Get('/servers/:serverId/profile')
  @ApiOkResponse({ type: ProfileResponseDto })
  getProfile(@Param('serverId') serverId: string, @Req() request: Request) {
    return this.profileService.getProfile(
      serverId,
      this.resolveRequestOrigin(request),
    );
  }

  private resolveRequestOrigin(request: Request): string {
    const host = request.get('host') ?? 'localhost:3000';
    const forwardedProto = request
      .get('x-forwarded-proto')
      ?.split(',')[0]
      ?.trim()
      ?.toLowerCase();
    const protocol =
      forwardedProto === 'https' || forwardedProto === 'http'
        ? forwardedProto
        : request.protocol;
    return `${protocol}://${host}`;
  }
}
