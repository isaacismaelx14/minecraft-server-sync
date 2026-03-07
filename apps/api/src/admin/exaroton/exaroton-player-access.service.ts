import { Injectable } from '@nestjs/common';
import {
  AdminErrorCode,
  createAdminHttpException,
} from '../common/admin-error-catalog';
import { ExarotonApiClient } from './exaroton-api.client';
import { ExarotonCredentialService } from './exaroton-credential.service';
import { ExarotonServerControlService } from './exaroton-server-control.service';
import { ExarotonServerViewService } from './exaroton-server-view.service';

type LauncherPermissions = {
  canViewStatus: boolean;
  canViewOnlinePlayers: boolean;
  canStartServer: boolean;
  canStopServer: boolean;
  canRestartServer: boolean;
};

@Injectable()
export class ExarotonPlayerAccessService {
  constructor(
    private readonly exarotonClient: ExarotonApiClient,
    private readonly credentials: ExarotonCredentialService,
    private readonly control: ExarotonServerControlService,
    private readonly view: ExarotonServerViewService,
  ) {}

  async getLauncherPlayerServerStatus() {
    const { apiKey, integration } = await this.credentials.requireConnection();
    const selectedServerId = integration.selectedServerId?.trim();
    if (!selectedServerId) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_SERVER_NOT_SELECTED,
      );
    }
    if (!integration.playerCanViewStatus) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_PLAYER_ACCESS_DISABLED,
      );
    }

    const selectedServer = await this.exarotonClient.getServer(
      apiKey,
      selectedServerId,
    );
    return {
      selectedServer: this.view.applyPlayerVisibility(
        this.view.mapServer(selectedServer),
        integration.playerCanViewOnlinePlayers,
      ),
      permissions: this.permissionsFromIntegration(integration),
    };
  }

  async runLauncherPlayerServerAction(action: 'start' | 'stop' | 'restart') {
    const { integration } = await this.credentials.requireConnection();
    if (!integration.selectedServerId?.trim()) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_SERVER_NOT_SELECTED,
      );
    }
    if (!integration.playerCanViewStatus) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_PLAYER_ACCESS_DISABLED,
      );
    }
    if (action === 'start' && !integration.playerCanStartServer) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_ACTION_FORBIDDEN,
        'Player start server permission is disabled',
      );
    }
    if (action === 'stop' && !integration.playerCanStopServer) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_ACTION_FORBIDDEN,
        'Player stop server permission is disabled',
      );
    }
    if (action === 'restart' && !integration.playerCanRestartServer) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_ACTION_FORBIDDEN,
        'Player restart server permission is disabled',
      );
    }

    await this.control.serverAction(action);
    return this.getLauncherPlayerServerStatus();
  }

  async openLauncherPlayerStatusStream(handlers: {
    onStatus: (
      server: ReturnType<ExarotonServerViewService['mapServer']>,
    ) => void;
    onError: (message: string) => void;
  }): Promise<() => void> {
    const { integration } = await this.credentials.requireConnection();
    if (!integration.playerCanViewStatus) {
      throw createAdminHttpException(
        AdminErrorCode.EXAROTON_PLAYER_ACCESS_DISABLED,
      );
    }

    return this.control.openStatusStream({
      onStatus: (server) => {
        handlers.onStatus(
          this.view.applyPlayerVisibility(
            server,
            integration.playerCanViewOnlinePlayers,
          ),
        );
      },
      onError: handlers.onError,
    });
  }

  private permissionsFromIntegration(input: {
    playerCanViewStatus: boolean;
    playerCanViewOnlinePlayers: boolean;
    playerCanStartServer: boolean;
    playerCanStopServer: boolean;
    playerCanRestartServer: boolean;
  }): LauncherPermissions {
    return {
      canViewStatus: input.playerCanViewStatus,
      canViewOnlinePlayers: input.playerCanViewOnlinePlayers,
      canStartServer: input.playerCanStartServer,
      canStopServer: input.playerCanStopServer,
      canRestartServer: input.playerCanRestartServer,
    };
  }
}
