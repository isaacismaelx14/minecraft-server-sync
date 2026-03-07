import { ExarotonCredentialService } from './exaroton-credential.service';

describe('ExarotonCredentialService settings normalization', () => {
  const service = new ExarotonCredentialService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  it('enables status visibility when any player action permission is enabled', () => {
    const settings = service.readSettings({
      playerCanViewStatus: false,
      playerCanStartServer: true,
      playerCanStopServer: false,
      playerCanRestartServer: false,
    });

    expect(settings.playerCanModifyStatus).toBe(true);
    expect(settings.playerCanViewStatus).toBe(true);
  });

  it('disables online players visibility when status visibility is disabled', () => {
    const settings = service.readSettings({
      playerCanViewStatus: false,
      playerCanViewOnlinePlayers: true,
      playerCanStartServer: false,
      playerCanStopServer: false,
      playerCanRestartServer: false,
      playerCanModifyStatus: false,
    });

    expect(settings.playerCanViewStatus).toBe(false);
    expect(settings.playerCanViewOnlinePlayers).toBe(false);
  });

  it('maps settings with legacy modify toggle correctly', () => {
    const mapped = service.mapSettings({
      modsSyncEnabled: true,
      playerCanModifyStatus: true,
      playerCanViewStatus: false,
      playerCanViewOnlinePlayers: true,
      playerCanStartServer: false,
      playerCanStopServer: false,
      playerCanRestartServer: false,
    });

    expect(mapped.serverStatusEnabled).toBe(true);
    expect(mapped.playerCanViewStatus).toBe(true);
    expect(mapped.playerCanViewOnlinePlayers).toBe(true);
  });
});
