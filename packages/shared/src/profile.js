"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileMetadataResponseSchema = void 0;
const zod_1 = require("zod");
const lockfile_1 = require("./lockfile");
exports.ProfileMetadataResponseSchema = zod_1.z.object({
  profileId: zod_1.z.string().min(1),
  version: zod_1.z.number().int().positive(),
  minecraftVersion: zod_1.z.string().min(1),
  loader: zod_1.z.enum(["fabric", "forge"]),
  loaderVersion: zod_1.z.string().min(1),
  lockUrl: zod_1.z.url(),
  serverName: zod_1.z.string().min(1),
  serverAddress: zod_1.z.string().min(1),
  allowedMinecraftVersions: zod_1.z.array(zod_1.z.string().min(1)).default([]),
  fancyMenuEnabled: zod_1.z.boolean().default(false),
  fancyMenu: lockfile_1.FancyMenuSettingsSchema.optional(),
  signature: zod_1.z.string().optional(),
  signatureAlgorithm: zod_1.z.literal("ed25519").optional(),
  signatureKeyId: zod_1.z.string().min(1).optional(),
  signatureInput: zod_1.z.string().min(1).optional(),
  signedAt: zod_1.z.iso.datetime().optional(),
});
//# sourceMappingURL=profile.js.map
