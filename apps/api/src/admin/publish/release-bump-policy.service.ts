import { Injectable } from '@nestjs/common';
import {
  LockBundleItem,
  ProfileLock,
  ProfileLockSchema,
} from '@minerelay/shared';
import {
  BumpType,
  PublishSummary,
  SemverParts,
  ServerModDiffSummary,
} from './publish.types';

@Injectable()
export class ReleaseBumpPolicyService {
  computeDiffSummary(
    previousLockJson: unknown,
    nextLock: ProfileLock,
  ): PublishSummary {
    const previous = ProfileLockSchema.safeParse(previousLockJson);

    if (!previous.success) {
      return {
        add:
          nextLock.items.length +
          nextLock.resources.length +
          nextLock.shaders.length +
          nextLock.configs.length,
        remove: 0,
        update: 0,
        keep: 0,
      };
    }

    const prevItems = this.flattenLockItems(previous.data);
    const nextItems = this.flattenLockItems(nextLock);
    const prevMap = new Map(
      prevItems.map((item) => [this.itemKey(item), item.sha256]),
    );
    const nextMap = new Map(
      nextItems.map((item) => [this.itemKey(item), item.sha256]),
    );

    let add = 0;
    let remove = 0;
    let update = 0;
    let keep = 0;

    for (const [key, sha] of nextMap.entries()) {
      const prevSha = prevMap.get(key);
      if (!prevSha) {
        add += 1;
      } else if (prevSha === sha) {
        keep += 1;
      } else {
        update += 1;
      }
    }

    for (const key of prevMap.keys()) {
      if (!nextMap.has(key)) {
        remove += 1;
      }
    }

    return { add, remove, update, keep };
  }

  computeServerModDiffSummary(
    previousLockJson: unknown,
    nextLock: ProfileLock,
  ): ServerModDiffSummary {
    const previous = ProfileLockSchema.safeParse(previousLockJson);
    const previousMods = previous.success
      ? previous.data.items.filter(
          (item) =>
            item.kind === 'mod' &&
            (item.side === 'server' || item.side === 'both'),
        )
      : [];
    const nextMods = nextLock.items.filter(
      (item) =>
        item.kind === 'mod' && (item.side === 'server' || item.side === 'both'),
    );

    const prevMap = new Map(
      previousMods.map((item) => [this.itemKey(item), item.sha256]),
    );
    const nextMap = new Map(
      nextMods.map((item) => [this.itemKey(item), item.sha256]),
    );

    let add = 0;
    let remove = 0;
    let update = 0;
    let keep = 0;

    for (const [key, sha] of nextMap.entries()) {
      const prevSha = prevMap.get(key);
      if (!prevSha) {
        add += 1;
      } else if (prevSha === sha) {
        keep += 1;
      } else {
        update += 1;
      }
    }

    for (const key of prevMap.keys()) {
      if (!nextMap.has(key)) {
        remove += 1;
      }
    }

    return {
      add,
      remove,
      update,
      keep,
      hasChanges: add + remove + update > 0,
    };
  }

  classifyReleaseBump(input: {
    latest: { minecraftVersion: string; loaderVersion: string; loader: string };
    next: { minecraftVersion: string; loaderVersion: string };
    summary: { add: number; remove: number; update: number };
  }): BumpType {
    const minecraftChanged =
      input.latest.minecraftVersion.trim() !==
      input.next.minecraftVersion.trim();
    const loaderVersionChanged =
      input.latest.loaderVersion.trim() !== input.next.loaderVersion.trim();
    const loaderChanged = input.latest.loader.trim().toLowerCase() !== 'fabric';

    if (minecraftChanged || loaderVersionChanged || loaderChanged) {
      return 'major';
    }

    if (
      input.summary.add > 0 ||
      input.summary.remove > 0 ||
      input.summary.update > 0
    ) {
      return 'minor';
    }

    return 'patch';
  }

  bumpSemver(current: SemverParts, bumpType: BumpType): SemverParts {
    if (bumpType === 'major') {
      return { major: current.major + 1, minor: 0, patch: 0 };
    }
    if (bumpType === 'minor') {
      return { major: current.major, minor: current.minor + 1, patch: 0 };
    }
    return {
      major: current.major,
      minor: current.minor,
      patch: current.patch + 1,
    };
  }

  formatSemver(parts: SemverParts): string {
    return `${parts.major}.${parts.minor}.${parts.patch}`;
  }

  private flattenLockItems(lock: ProfileLock) {
    return [
      ...lock.items,
      ...lock.resources,
      ...lock.shaders,
      ...lock.configs,
    ] as LockBundleItem[];
  }

  private itemKey(item: LockBundleItem) {
    if (item.kind === 'mod') {
      return `mod:${item.projectId ?? item.name}`;
    }
    return `${item.kind}:${item.name}`;
  }
}
