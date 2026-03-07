"use client";

import { requestJson } from "@/admin/client/http";
import type {
  BootstrapPayload,
  FabricVersionsPayload,
} from "@/admin/client/types";

const BOOTSTRAP_CACHE_TTL_MS = 15_000;
const FABRIC_VERSIONS_CACHE_TTL_MS = 60_000;

let bootstrapCache: { payload: BootstrapPayload; expiresAt: number } | null =
  null;
const fabricVersionsCache = new Map<
  string,
  { payload: FabricVersionsPayload; expiresAt: number }
>();

export async function readBootstrapPayload(
  force = false,
): Promise<BootstrapPayload> {
  const now = Date.now();
  if (!force && bootstrapCache && bootstrapCache.expiresAt > now) {
    return bootstrapCache.payload;
  }
  const payload = await requestJson<BootstrapPayload>(
    "/v1/admin/bootstrap",
    "GET",
  );
  bootstrapCache = {
    payload,
    expiresAt: Date.now() + BOOTSTRAP_CACHE_TTL_MS,
  };

  return payload;
}

export async function readFabricVersionsPayload(
  minecraftVersion: string,
  force = false,
): Promise<FabricVersionsPayload> {
  const now = Date.now();
  const cached = fabricVersionsCache.get(minecraftVersion);
  if (!force && cached && cached.expiresAt > now) {
    return cached.payload;
  }
  const payload = await requestJson<FabricVersionsPayload>(
    `/v1/admin/fabric/versions?minecraftVersion=${encodeURIComponent(minecraftVersion)}`,
    "GET",
  );
  fabricVersionsCache.set(minecraftVersion, {
    payload,
    expiresAt: Date.now() + FABRIC_VERSIONS_CACHE_TTL_MS,
  });
  return payload;
}
