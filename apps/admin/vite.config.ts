import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import vinext from "vinext";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    alias: {
      "@minerelay/ui": fileURLToPath(
        new URL("../../packages/ui/src/index.ts", import.meta.url),
      ),
    },
  },
  server: {
    hmr: {
      // Cloudflare + Vinext can emit transient cross-DO dev-runtime errors.
      // Keep UI usable while the runner recovers.
      overlay: false,
    },
  },
  plugins: [tailwindcss(), vinext()],
});
