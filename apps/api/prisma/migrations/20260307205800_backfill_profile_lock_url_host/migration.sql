-- Backfill stale lockUrl hosts from old Railway app domains to canonical production API domain.
-- This keeps existing published profile versions usable without requiring immediate re-publish.
UPDATE "ProfileVersion"
SET "lockUrl" = regexp_replace(
  "lockUrl",
  '^https?://api-production-[^.]+\.up\.railway\.app',
  'https://api.minerelay.com'
)
WHERE "lockUrl" ~ '^https?://api-production-[^.]+\.up\.railway\.app/v1/locks/';
