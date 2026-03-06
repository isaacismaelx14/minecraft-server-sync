"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockBundleItemSchema =
  exports.ProfileLockSchema =
  exports.FancyMenuSettingsSchema =
  exports.BrandingSchema =
  exports.RuntimeHintsSchema =
  exports.DefaultServerSchema =
  exports.ConfigTemplateSchema =
  exports.ShaderPackSchema =
  exports.ResourcePackSchema =
  exports.LockItemSchema =
  exports.SideSchema =
  exports.ProviderSchema =
    void 0;
const zod_1 = require("zod");
exports.ProviderSchema = zod_1.z.enum(["modrinth", "direct", "curseforge"]);
exports.SideSchema = zod_1.z
  .enum(["client", "server", "both"])
  .default("client");
const BaseFileSchema = zod_1.z.object({
  kind: zod_1.z.enum(["mod", "resourcepack", "shaderpack", "config"]),
  name: zod_1.z.string().min(1),
  url: zod_1.z.url(),
  sha256: zod_1.z.string().regex(/^[A-Fa-f0-9]{64}$/),
});
exports.LockItemSchema = BaseFileSchema.extend({
  kind: zod_1.z.literal("mod"),
  provider: exports.ProviderSchema,
  side: exports.SideSchema,
  projectId: zod_1.z.string().min(1).optional(),
  versionId: zod_1.z.string().min(1).optional(),
  iconUrl: zod_1.z.string().url().optional(),
  slug: zod_1.z.string().min(1).optional(),
});
exports.ResourcePackSchema = BaseFileSchema.extend({
  kind: zod_1.z.literal("resourcepack"),
});
exports.ShaderPackSchema = BaseFileSchema.extend({
  kind: zod_1.z.literal("shaderpack"),
});
exports.ConfigTemplateSchema = BaseFileSchema.extend({
  kind: zod_1.z.literal("config"),
});
exports.DefaultServerSchema = zod_1.z.object({
  name: zod_1.z.string().min(1),
  address: zod_1.z.string().min(1),
});
exports.RuntimeHintsSchema = zod_1.z
  .object({
    javaMajor: zod_1.z.number().int().min(8).max(23),
    minMemoryMb: zod_1.z.number().int().min(512),
    maxMemoryMb: zod_1.z.number().int().min(1024),
  })
  .refine((runtime) => runtime.maxMemoryMb >= runtime.minMemoryMb, {
    message: "maxMemoryMb must be greater than or equal to minMemoryMb",
  });
exports.BrandingSchema = zod_1.z.object({
  serverName: zod_1.z.string().min(1),
  logoUrl: zod_1.z.url().optional(),
  backgroundUrl: zod_1.z.url().optional(),
  newsUrl: zod_1.z.url().optional(),
});
exports.FancyMenuSettingsSchema = zod_1.z.object({
  enabled: zod_1.z.boolean().default(false),
  mode: zod_1.z.enum(["simple", "custom"]).default("simple"),
  playButtonLabel: zod_1.z.string().min(1).default("Play"),
  hideSingleplayer: zod_1.z.boolean().default(true),
  hideMultiplayer: zod_1.z.boolean().default(true),
  hideRealms: zod_1.z.boolean().default(true),
  customLayoutUrl: zod_1.z.url().optional(),
  customLayoutSha256: zod_1.z
    .string()
    .regex(/^[A-Fa-f0-9]{64}$/)
    .optional(),
});
exports.ProfileLockSchema = zod_1.z.object({
  profileId: zod_1.z.string().min(1),
  version: zod_1.z.number().int().positive(),
  minecraftVersion: zod_1.z.string().min(1),
  loader: zod_1.z.enum(["fabric", "forge"]).default("fabric"),
  loaderVersion: zod_1.z.string().min(1),
  defaultServer: exports.DefaultServerSchema,
  items: zod_1.z.array(exports.LockItemSchema),
  resources: zod_1.z.array(exports.ResourcePackSchema).default([]),
  shaders: zod_1.z.array(exports.ShaderPackSchema).default([]),
  configs: zod_1.z.array(exports.ConfigTemplateSchema).default([]),
  runtimeHints: exports.RuntimeHintsSchema,
  branding: exports.BrandingSchema,
  fancyMenu: exports.FancyMenuSettingsSchema.default({
    enabled: false,
    mode: "simple",
    playButtonLabel: "Play",
    hideSingleplayer: true,
    hideMultiplayer: true,
    hideRealms: true,
  }),
});
exports.LockBundleItemSchema = zod_1.z.discriminatedUnion("kind", [
  exports.LockItemSchema,
  exports.ResourcePackSchema,
  exports.ShaderPackSchema,
  exports.ConfigTemplateSchema,
]);
//# sourceMappingURL=lockfile.js.map
