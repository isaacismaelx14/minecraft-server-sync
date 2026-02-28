import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminSessionGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminSessionGuard],
  exports: [AdminService],
})
export class AdminModule {}
