import { headers } from "next/headers";
import { createHash } from "node:crypto";

import type { BootstrapPayload } from "@/admin/client/types";

const DEFAULT_API_ORIGIN = "http://localhost:3000";
const BOOTSTRAP_CACHE_TTL_MS = 15_000;
const BOOTSTRAP_FAILURE_CACHE_TTL_MS = 5_000;

const bootstrapCache = new Map<
  string,
  { expiresAt: number; payload: BootstrapPayload | null }
>();

export type ServerBootstrapResult = {
  payload: BootstrapPayload | null;
  isRscTransition: boolean;
  authState: "authenticated" | "unauthorized" | "unknown";
};

const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const BOOTSTRAP_MAX_ATTEMPTS = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function hasAdminSessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) {
    return false;
  }

  return /(?:^|;\s*)mvl_admin_(?:access|refresh)=/.test(cookieHeader);
}

function normalizeApiOrigin(raw: string): string {
  const value = raw.trim();
  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_ADMIN_API_ORIGIN.");
  }

  const parsed = new URL(value);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Invalid NEXT_PUBLIC_ADMIN_API_ORIGIN: ${value}`);
  }

  parsed.pathname = "/";
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

function getAdminApiOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_ADMIN_API_ORIGIN ?? DEFAULT_API_ORIGIN;
  return normalizeApiOrigin(configured);
}

function buildAdminApiUrl(path: string): string {
  return new URL(path, `${getAdminApiOrigin()}/`).toString();
}

function isRscTransitionRequest(requestHeaders: Headers): boolean {
  const rscHeader = requestHeaders.get("rsc");
  if (rscHeader === "1") {
    return true;
  }

  const accept = requestHeaders.get("accept")?.toLowerCase() ?? "";
  return accept.includes("text/x-component");
}

function buildSessionCacheKey(cookie: string | null): string {
  if (!cookie) {
    return "anonymous";
  }

  return createHash("sha256").update(cookie).digest("base64url");
}

export async function readServerBootstrapResult(): Promise<ServerBootstrapResult> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");
  const hasSessionCookie = hasAdminSessionCookie(cookie);

  // During in-app route transitions we keep existing client state and avoid
  // a blocking SSR bootstrap network hop for every navigation.
  if (isRscTransitionRequest(requestHeaders)) {
    return {
      payload: null,
      isRscTransition: true,
      authState: "unknown",
    };
  }

  const cacheKey = buildSessionCacheKey(cookie);
  const cached = bootstrapCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return {
      payload: cached.payload,
      isRscTransition: false,
      authState: cached.payload ? "authenticated" : "unknown",
    };
  }

  try {
    let response: Response | null = null;
    for (let attempt = 1; attempt <= BOOTSTRAP_MAX_ATTEMPTS; attempt += 1) {
      response = await fetch(
        buildAdminApiUrl("/v1/admin/bootstrap?includeLoaders=true"),
        {
          method: "GET",
          headers: cookie ? { cookie } : undefined,
          cache: "no-store",
        },
      );

      if (
        !RETRYABLE_STATUS_CODES.has(response.status) ||
        attempt === BOOTSTRAP_MAX_ATTEMPTS
      ) {
        break;
      }

      await sleep(150 * attempt);
    }

    if (!response) {
      throw new Error("Bootstrap response missing.");
    }

    if (response.status === 401) {
      bootstrapCache.set(cacheKey, {
        payload: null,
        expiresAt: now + BOOTSTRAP_FAILURE_CACHE_TTL_MS,
      });
      return {
        payload: null,
        isRscTransition: false,
        authState: hasSessionCookie ? "unauthorized" : "unknown",
      };
    }

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[admin] bootstrap request failed (${response.status}): ${text || "empty response"}`,
      );
      bootstrapCache.set(cacheKey, {
        payload: null,
        expiresAt: now + BOOTSTRAP_FAILURE_CACHE_TTL_MS,
      });
      return {
        payload: null,
        isRscTransition: false,
        authState: "unknown",
      };
    }

    const payload = (await response.json()) as BootstrapPayload;
    bootstrapCache.set(cacheKey, {
      payload,
      expiresAt: now + BOOTSTRAP_CACHE_TTL_MS,
    });
    return {
      payload,
      isRscTransition: false,
      authState: "authenticated",
    };
  } catch (error) {
    console.error("[admin] bootstrap request threw:", error);
    bootstrapCache.set(cacheKey, {
      payload: null,
      expiresAt: now + BOOTSTRAP_FAILURE_CACHE_TTL_MS,
    });
    return {
      payload: null,
      isRscTransition: false,
      authState: "unknown",
    };
  }
}

export async function readServerBootstrapPayload(): Promise<BootstrapPayload | null> {
  const result = await readServerBootstrapResult();
  return result.payload;
}
