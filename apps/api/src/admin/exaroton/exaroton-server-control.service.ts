import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import {
  AdminErrorCode,
  createAdminHttpException,
} from '../common/admin-error-catalog';
import { ExarotonApiClient } from './exaroton-api.client';
import { ExarotonCredentialService } from './exaroton-credential.service';
import { ExarotonServerViewService } from './exaroton-server-view.service';
import { EXAROTON_INTEGRATION_ID } from './exaroton.types';

@Injectable()
export class ExarotonServerControlService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exarotonClient: ExarotonApiClient,
    private readonly credentials: ExarotonCredentialService,
    private readonly view: ExarotonServerViewService,
  ) {}

  async listServers() {
    const { apiKey, integration } = await this.credentials.requireConnection();
    const servers = await this.exarotonClient.listServers(apiKey);
    return {
      servers: servers.map((entry) => this.view.mapServer(entry)),
      selectedServerId: integration.selectedServerId ?? null,
    };
  }

  async selectServer(serverId: string) {
    const cleanServerId = serverId.trim();
    if (!cleanServerId) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_SERVER_ID_REQUIRED,
      );
    }

    const { apiKey } = await this.credentials.requireConnection();
    const selectedServer = await this.exarotonClient.getServer(
      apiKey,
      cleanServerId,
    );

    await this.prisma.exarotonIntegration.update({
      where: { id: EXAROTON_INTEGRATION_ID },
      data: {
        selectedServerId: selectedServer.id,
        selectedServerName: selectedServer.name,
        selectedServerAddress: selectedServer.address,
      },
    });

    return {
      selectedServer: this.view.mapServer(selectedServer),
    };
  }

  async serverAction(action: 'start' | 'stop' | 'restart') {
    const { apiKey, integration } = await this.credentials.requireConnection();
    const selectedServerId = integration.selectedServerId?.trim();
    if (!selectedServerId) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_SERVER_NOT_SELECTED,
      );
    }

    if (action === 'start') {
      await this.exarotonClient.startServer(apiKey, selectedServerId);
    } else if (action === 'stop') {
      await this.exarotonClient.stopServer(apiKey, selectedServerId);
    } else {
      await this.exarotonClient.restartServer(apiKey, selectedServerId);
    }

    const selectedServer = await this.exarotonClient.getServer(
      apiKey,
      selectedServerId,
    );

    await this.prisma.exarotonIntegration.update({
      where: { id: EXAROTON_INTEGRATION_ID },
      data: {
        selectedServerName: selectedServer.name,
        selectedServerAddress: selectedServer.address,
      },
    });

    return {
      success: true,
      action,
      selectedServer: this.view.mapServer(selectedServer),
    };
  }

  async openStatusStream(handlers: {
    onStatus: (
      server: ReturnType<ExarotonServerViewService['mapServer']>,
    ) => void;
    onError: (message: string) => void;
  }): Promise<() => void> {
    const { apiKey, integration } = await this.credentials.requireConnection();
    const selectedServerId = integration.selectedServerId?.trim();
    if (!selectedServerId) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_SERVER_NOT_SELECTED,
      );
    }

    const initial = await this.exarotonClient.getServer(
      apiKey,
      selectedServerId,
    );
    handlers.onStatus(this.view.mapServer(initial));

    return this.exarotonClient.openServerStatusStream(
      apiKey,
      selectedServerId,
      {
        onStatus: (server) => {
          if (server.id !== selectedServerId) {
            return;
          }
          handlers.onStatus(this.view.mapServer(server));
        },
        onError: handlers.onError,
      },
    );
  }
}
