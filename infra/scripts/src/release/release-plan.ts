import type { ChangeItem } from "./changelog";
import type { ReleaseLevel } from "./commit-parser";

export const RELEASE_TRIGGER_TYPES = new Set(["feat", "fix", "perf"]);

export type TargetManifest = {
  target: string;
  packageName: string;
  dependencies: string[];
};

export type TargetAnalysis = {
  target: string;
  changes: ChangeItem[];
  breakingNotes: string[];
  detectedBump: ReleaseLevel | null;
};

export type PlannedRelease = {
  target: string;
  reason: "direct" | "dependency";
  dependencySourceTarget?: string;
  releaseNotesSourceTarget: string;
};

export function isReleaseRelevantChange(change: ChangeItem): boolean {
  return change.breaking || RELEASE_TRIGGER_TYPES.has(change.type);
}

export function determineDetectedBump(
  changes: ChangeItem[],
): ReleaseLevel | null {
  const releaseRelevantChanges = changes.filter(isReleaseRelevantChange);
  if (releaseRelevantChanges.length === 0) {
    return null;
  }

  if (releaseRelevantChanges.some((change) => change.breaking)) {
    return "major";
  }
  if (releaseRelevantChanges.some((change) => change.type === "feat")) {
    return "minor";
  }
  return "patch";
}

export function buildReverseDependencyGraph(
  manifests: TargetManifest[],
): Map<string, string[]> {
  const byPackageName = new Map(
    manifests.map((manifest) => [manifest.packageName, manifest.target]),
  );
  const graph = new Map<string, string[]>();

  for (const manifest of manifests) {
    for (const dependencyPackageName of manifest.dependencies) {
      const dependencyTarget = byPackageName.get(dependencyPackageName);
      if (!dependencyTarget || dependencyTarget === manifest.target) {
        continue;
      }
      const dependents = graph.get(dependencyTarget) ?? [];
      if (!dependents.includes(manifest.target)) {
        dependents.push(manifest.target);
      }
      graph.set(dependencyTarget, dependents);
    }
  }

  for (const dependents of graph.values()) {
    dependents.sort();
  }

  return graph;
}

export function collectTransitiveDependents(
  reverseGraph: Map<string, string[]>,
  sourceTarget: string,
): string[] {
  const queue = [...(reverseGraph.get(sourceTarget) ?? [])];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next || visited.has(next)) {
      continue;
    }
    visited.add(next);
    const downstream = reverseGraph.get(next) ?? [];
    for (const dependent of downstream) {
      if (!visited.has(dependent)) {
        queue.push(dependent);
      }
    }
  }

  return [...visited].sort();
}

export function buildReleasePlan(params: {
  targetOrder: string[];
  analyses: Record<string, TargetAnalysis>;
  reverseDependencyGraph: Map<string, string[]>;
  requestedTarget: string;
  autoTarget: string;
  dependencyRootTargets?: string[];
}): PlannedRelease[] {
  const configuredTargets = new Set(params.targetOrder);
  const directTargets = new Set(
    Object.values(params.analyses)
      .filter(
        (analysis) =>
          analysis.detectedBump !== null &&
          configuredTargets.has(analysis.target),
      )
      .map((analysis) => analysis.target),
  );

  const dependencyRootTargets = new Set(params.dependencyRootTargets ?? []);
  const shouldOverrideRequestedTarget =
    params.requestedTarget !== params.autoTarget &&
    [...dependencyRootTargets].some((target) => directTargets.has(target));

  const planned = new Map<string, PlannedRelease>();
  const directSourceTargets =
    params.requestedTarget === params.autoTarget ||
    shouldOverrideRequestedTarget
      ? [...directTargets]
      : directTargets.has(params.requestedTarget)
        ? [params.requestedTarget]
        : [];

  for (const target of directSourceTargets) {
    planned.set(target, {
      target,
      reason: "direct",
      releaseNotesSourceTarget: target,
    });
  }

  if (
    params.requestedTarget === params.autoTarget ||
    shouldOverrideRequestedTarget
  ) {
    for (const sourceTarget of directSourceTargets) {
      for (const dependentTarget of collectTransitiveDependents(
        params.reverseDependencyGraph,
        sourceTarget,
      )) {
        if (!configuredTargets.has(dependentTarget)) {
          continue;
        }
        if (planned.has(dependentTarget)) {
          continue;
        }
        planned.set(dependentTarget, {
          target: dependentTarget,
          reason: "dependency",
          dependencySourceTarget: sourceTarget,
          releaseNotesSourceTarget: sourceTarget,
        });
      }
    }
  }

  const orderLookup = new Map(
    params.targetOrder.map((target, index) => [target, index]),
  );

  return [...planned.values()].sort((left, right) => {
    const leftIndex = orderLookup.get(left.target) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = orderLookup.get(right.target) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
}
