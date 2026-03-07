import { Injectable } from '@nestjs/common';
import { ExarotonServer } from './exaroton-api.client';
import { ExarotonMappedServer } from './exaroton.types';

@Injectable()
export class ExarotonServerViewService {
  statusLabel(status: number): string {
    if (status === 0) return 'OFFLINE';
    if (status === 1) return 'ONLINE';
    if (status === 2) return 'STARTING';
    if (status === 3) return 'STOPPING';
    if (status === 4) return 'RESTARTING';
    if (status === 5) return 'SAVING';
    if (status === 6) return 'LOADING';
    if (status === 7) return 'CRASHED';
    if (status === 8) return 'PENDING';
    if (status === 9) return 'TRANSFERRING';
    if (status === 10) return 'PREPARING';
    return 'UNKNOWN';
  }

  mapServer(server: ExarotonServer): ExarotonMappedServer {
    return {
      id: server.id,
      name: server.name,
      address: server.address,
      motd: server.motd,
      status: server.status,
      statusLabel: this.statusLabel(server.status),
      players: {
        max: server.players?.max ?? 0,
        count: server.players?.count ?? 0,
      },
      software: server.software
        ? {
            id: server.software.id,
            name: server.software.name,
            version: server.software.version,
          }
        : null,
      shared: server.shared,
    };
  }

  applyPlayerVisibility(
    server: ExarotonMappedServer,
    canViewOnlinePlayers: boolean,
  ): ExarotonMappedServer {
    if (canViewOnlinePlayers) {
      return server;
    }

    return {
      ...server,
      players: {
        max: 0,
        count: 0,
      },
    };
  }
}
