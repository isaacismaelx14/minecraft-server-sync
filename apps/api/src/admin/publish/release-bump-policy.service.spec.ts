jest.mock('@minerelay/shared', () => ({
  ProfileLockSchema: {
    safeParse: (value: unknown) => ({ success: true, data: value }),
  },
}));

import { ReleaseBumpPolicyService } from './release-bump-policy.service';

function createLock(mods: Array<{ projectId: string; sha256: string }>) {
  return {
    profileId: 'test-profile',
    version: 1,
    minecraftVersion: '1.20.1',
    loader: 'fabric',
    loaderVersion: '0.16.0',
    defaultServer: {
      name: 'Server',
      address: '127.0.0.1:25565',
    },
    items: mods.map((mod) => ({
      kind: 'mod',
      name: mod.projectId,
      provider: 'modrinth',
      side: 'both',
      projectId: mod.projectId,
      versionId: `${mod.projectId}-v1`,
      url: `https://cdn.modrinth.com/data/${mod.projectId}/versions/v1/file.jar`,
      sha256: mod.sha256,
    })),
    resources: [],
    shaders: [],
    configs: [],
    runtimeHints: {
      javaMajor: 17,
      minMemoryMb: 4096,
      maxMemoryMb: 8192,
    },
    branding: {
      serverName: 'Server',
      logoUrl: 'https://example.com/logo.png',
      backgroundUrl: 'https://example.com/bg.png',
      newsUrl: 'https://example.com/news',
    },
    fancyMenu: {
      enabled: true,
      mode: 'simple',
      playButtonLabel: 'Play',
      hideSingleplayer: true,
      hideMultiplayer: true,
      hideRealms: true,
    },
  } as never;
}

describe('ReleaseBumpPolicyService', () => {
  const service = new ReleaseBumpPolicyService();

  it('classifies major bump when minecraft version changes', () => {
    const result = service.classifyReleaseBump({
      latest: {
        minecraftVersion: '1.20.1',
        loaderVersion: '0.16.0',
        loader: 'fabric',
      },
      next: {
        minecraftVersion: '1.21.1',
        loaderVersion: '0.16.0',
      },
      summary: { add: 0, remove: 0, update: 0 },
    });

    expect(result).toBe('major');
  });

  it('classifies minor bump when content changes without platform changes', () => {
    const result = service.classifyReleaseBump({
      latest: {
        minecraftVersion: '1.20.1',
        loaderVersion: '0.16.0',
        loader: 'fabric',
      },
      next: {
        minecraftVersion: '1.20.1',
        loaderVersion: '0.16.0',
      },
      summary: { add: 1, remove: 0, update: 0 },
    });

    expect(result).toBe('minor');
  });

  it('classifies patch bump when no content changes', () => {
    const result = service.classifyReleaseBump({
      latest: {
        minecraftVersion: '1.20.1',
        loaderVersion: '0.16.0',
        loader: 'fabric',
      },
      next: {
        minecraftVersion: '1.20.1',
        loaderVersion: '0.16.0',
      },
      summary: { add: 0, remove: 0, update: 0 },
    });

    expect(result).toBe('patch');
  });

  it('computes server mod diff summary', () => {
    const previous = createLock([
      { projectId: 'mod-a', sha256: 'a'.repeat(64) },
      { projectId: 'mod-b', sha256: 'b'.repeat(64) },
    ]);
    const next = createLock([
      { projectId: 'mod-a', sha256: 'c'.repeat(64) },
      { projectId: 'mod-c', sha256: 'd'.repeat(64) },
    ]);

    const diff = service.computeServerModDiffSummary(previous, next);
    expect(diff).toEqual({
      add: 1,
      remove: 1,
      update: 1,
      keep: 0,
      hasChanges: true,
    });
  });
});
