import { Module } from '@nestjs/common';
import { AdminSharedModule } from '../admin-shared.module';
import { AdminModsController } from './admin-mods.controller';
import { AdminModsContextService } from './admin-mods-context.service';
import { AssetMetadataHydratorService } from './asset-metadata-hydrator.service';
import { AssetResolverService } from './asset-resolver.service';
import { FabricLoaderService } from './fabric-loader.service';
import { MinecraftVersionsService } from './minecraft-versions.service';
import { ModrinthClientService } from './modrinth-client.service';
import { ModsInstallPlannerService } from './mods-install-planner.service';

@Module({
  imports: [AdminSharedModule],
  controllers: [AdminModsController],
  providers: [
    AdminModsContextService,
    FabricLoaderService,
    MinecraftVersionsService,
    ModrinthClientService,
    AssetResolverService,
    AssetMetadataHydratorService,
    ModsInstallPlannerService,
  ],
  exports: [AdminModsContextService, MinecraftVersionsService],
})
export class AdminModsModule {}
