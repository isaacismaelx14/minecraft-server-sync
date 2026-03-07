import { Injectable, Logger } from '@nestjs/common';

export const FABRIC_API_PROJECT_ID = 'P7dR8mSH';
export const FANCY_MENU_PROJECT_ID = 'Wq5SjeWM';
export const MOD_MENU_PROJECT_ID = 'mOgUt4GM';

export type ManagedMod = {
  kind: 'mod';
  name: string;
  provider: 'modrinth' | 'direct';
  side: 'client' | 'server' | 'both';
  projectId?: string;
  versionId?: string;
  url: string;
  sha256: string;
  iconUrl?: string;
  slug?: string;
};

export type CoreModPolicyMetadata = {
  fabricApiProjectId: string;
  fancyMenuProjectId: string;
  modMenuProjectId: string;
  lockedProjectIds: string[];
  nonRemovableProjectIds: string[];
  rules: {
    fabricApiRequired: true;
    fabricApiVersionEditable: true;
    fancyMenuRequiredWhenEnabled: true;
    modMenuRequired: true;
    fancyMenuEnabled: boolean;
  };
};

@Injectable()
export class CoreModPolicyService {
  private readonly logger = new Logger(CoreModPolicyService.name);

  private isFancyMenuMod(mod: ManagedMod): boolean {
    const name = mod.name.toLowerCase();
    return (
      mod.projectId === FANCY_MENU_PROJECT_ID ||
      name.includes('fancymenu') ||
      name.includes('fancy menu') ||
      name.includes('fancy-menu')
    );
  }

  private isFabricApiMod(mod: ManagedMod): boolean {
    return mod.projectId === FABRIC_API_PROJECT_ID;
  }

  private isModMenuMod(mod: ManagedMod): boolean {
    const name = mod.name.toLowerCase();
    return (
      mod.projectId === MOD_MENU_PROJECT_ID ||
      mod.projectId === 'modmenu' ||
      name.includes('mod menu') ||
      name.includes('modmenu')
    );
  }

  private dedupeMods(mods: ManagedMod[]): ManagedMod[] {
    const byProject = new Map<string, ManagedMod>();
    const unnamed: ManagedMod[] = [];

    for (const mod of mods) {
      const key = mod.projectId?.trim();
      if (key) {
        byProject.set(key, mod);
      } else {
        unnamed.push(mod);
      }
    }

    return [...byProject.values(), ...unnamed];
  }

  private enforceManagedSide(mod: ManagedMod): ManagedMod {
    if (this.isModMenuMod(mod)) {
      return { ...mod, side: 'client' };
    }

    if (this.isFancyMenuMod(mod)) {
      return { ...mod, side: 'both' };
    }

    return mod;
  }

  buildMetadata(fancyMenuEnabled: boolean): CoreModPolicyMetadata {
    return {
      fabricApiProjectId: FABRIC_API_PROJECT_ID,
      fancyMenuProjectId: FANCY_MENU_PROJECT_ID,
      modMenuProjectId: MOD_MENU_PROJECT_ID,
      lockedProjectIds: [FABRIC_API_PROJECT_ID, MOD_MENU_PROJECT_ID],
      nonRemovableProjectIds: [FABRIC_API_PROJECT_ID, MOD_MENU_PROJECT_ID],
      rules: {
        fabricApiRequired: true,
        fabricApiVersionEditable: true,
        fancyMenuRequiredWhenEnabled: true,
        modMenuRequired: true,
        fancyMenuEnabled,
      },
    };
  }

  async normalizeMods(input: {
    mods: ManagedMod[];
    minecraftVersion: string;
    fancyMenuEnabled: boolean;
    resolveMod: (
      projectId: string,
      minecraftVersion: string,
      versionId?: string,
    ) => Promise<ManagedMod>;
  }): Promise<ManagedMod[]> {
    const minecraftVersion = input.minecraftVersion.trim();
    const deduped = this.dedupeMods(input.mods);

    const filtered = deduped.filter((mod) => {
      if (this.isFabricApiMod(mod)) {
        return false;
      }

      if (this.isModMenuMod(mod)) {
        return false;
      }

      if (!input.fancyMenuEnabled && this.isFancyMenuMod(mod)) {
        return false;
      }

      return true;
    });

    const fabricApiExisting = deduped.find((mod) => this.isFabricApiMod(mod));
    const targetFabricSide = fabricApiExisting?.side ?? 'both';
    if (fabricApiExisting?.versionId) {
      try {
        const resolvedFabric = await input.resolveMod(
          FABRIC_API_PROJECT_ID,
          minecraftVersion,
          fabricApiExisting.versionId,
        );
        filtered.push(
          this.enforceManagedSide({
            ...resolvedFabric,
            side: targetFabricSide,
          }),
        );
      } catch {
        try {
          const resolvedFabric = await input.resolveMod(
            FABRIC_API_PROJECT_ID,
            minecraftVersion,
          );
          filtered.push(
            this.enforceManagedSide({
              ...resolvedFabric,
              side: targetFabricSide,
            }),
          );
        } catch (error) {
          if (fabricApiExisting) {
            this.logger.warn(
              `Using existing Fabric API because resolver failed: ${(error as Error).message || 'unknown error'}`,
            );
            filtered.push(
              this.enforceManagedSide({
                ...fabricApiExisting,
                side: targetFabricSide,
              }),
            );
          } else {
            throw error;
          }
        }
      }
    } else {
      try {
        const resolvedFabric = await input.resolveMod(
          FABRIC_API_PROJECT_ID,
          minecraftVersion,
        );
        filtered.push(
          this.enforceManagedSide({
            ...resolvedFabric,
            side: targetFabricSide,
          }),
        );
      } catch (error) {
        if (fabricApiExisting) {
          this.logger.warn(
            `Using existing Fabric API because resolver failed: ${(error as Error).message || 'unknown error'}`,
          );
          filtered.push(
            this.enforceManagedSide({
              ...fabricApiExisting,
              side: targetFabricSide,
            }),
          );
        } else {
          throw error;
        }
      }
    }

    if (input.fancyMenuEnabled) {
      const fancyExisting = deduped.find((mod) => this.isFancyMenuMod(mod));
      if (fancyExisting?.versionId) {
        try {
          filtered.push(
            this.enforceManagedSide(
              await input.resolveMod(
                FANCY_MENU_PROJECT_ID,
                minecraftVersion,
                fancyExisting.versionId,
              ),
            ),
          );
        } catch {
          try {
            filtered.push(
              this.enforceManagedSide(
                await input.resolveMod(FANCY_MENU_PROJECT_ID, minecraftVersion),
              ),
            );
          } catch (error) {
            if (fancyExisting) {
              this.logger.warn(
                `Using existing FancyMenu because resolver failed: ${(error as Error).message || 'unknown error'}`,
              );
              filtered.push(this.enforceManagedSide(fancyExisting));
            } else {
              throw error;
            }
          }
        }
      } else {
        try {
          filtered.push(
            this.enforceManagedSide(
              await input.resolveMod(FANCY_MENU_PROJECT_ID, minecraftVersion),
            ),
          );
        } catch (error) {
          if (fancyExisting) {
            this.logger.warn(
              `Using existing FancyMenu because resolver failed: ${(error as Error).message || 'unknown error'}`,
            );
            filtered.push(this.enforceManagedSide(fancyExisting));
          } else {
            throw error;
          }
        }
      }
    }

    const modMenuExisting = deduped.find((mod) => this.isModMenuMod(mod));
    if (modMenuExisting?.versionId) {
      try {
        filtered.push(
          this.enforceManagedSide(
            await input.resolveMod(
              MOD_MENU_PROJECT_ID,
              minecraftVersion,
              modMenuExisting.versionId,
            ),
          ),
        );
      } catch {
        try {
          filtered.push(
            this.enforceManagedSide(
              await input.resolveMod(MOD_MENU_PROJECT_ID, minecraftVersion),
            ),
          );
        } catch (error) {
          if (modMenuExisting) {
            this.logger.warn(
              `Using existing Mod Menu because resolver failed: ${(error as Error).message || 'unknown error'}`,
            );
            filtered.push(this.enforceManagedSide(modMenuExisting));
          } else {
            throw error;
          }
        }
      }
    } else {
      try {
        filtered.push(
          this.enforceManagedSide(
            await input.resolveMod(MOD_MENU_PROJECT_ID, minecraftVersion),
          ),
        );
      } catch (error) {
        if (modMenuExisting) {
          this.logger.warn(
            `Using existing Mod Menu because resolver failed: ${(error as Error).message || 'unknown error'}`,
          );
          filtered.push(this.enforceManagedSide(modMenuExisting));
        } else {
          throw error;
        }
      }
    }

    return this.dedupeMods(filtered).map((mod) => this.enforceManagedSide(mod));
  }
}
