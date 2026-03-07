"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncPlanSchema =
  exports.SyncOperationSchema =
  exports.UpdatesResponseSchema =
  exports.UpdateSummarySchema =
    void 0;
const zod_1 = require("zod");
exports.UpdateSummarySchema = zod_1.z.object({
  add: zod_1.z.number().int().nonnegative(),
  remove: zod_1.z.number().int().nonnegative(),
  update: zod_1.z.number().int().nonnegative(),
  keep: zod_1.z.number().int().nonnegative(),
});
exports.UpdatesResponseSchema = zod_1.z.object({
  hasUpdates: zod_1.z.boolean(),
  from: zod_1.z.number().int().nonnegative().nullable(),
  to: zod_1.z.number().int().positive(),
  summary: exports.UpdateSummarySchema,
});
exports.SyncOperationSchema = zod_1.z.object({
  op: zod_1.z.enum(["add", "remove", "update", "keep"]),
  path: zod_1.z.string().min(1),
  name: zod_1.z.string().min(1),
  sha256: zod_1.z
    .string()
    .regex(/^[A-Fa-f0-9]{64}$/)
    .optional(),
  fromSha256: zod_1.z
    .string()
    .regex(/^[A-Fa-f0-9]{64}$/)
    .optional(),
  toSha256: zod_1.z
    .string()
    .regex(/^[A-Fa-f0-9]{64}$/)
    .optional(),
  url: zod_1.z.url().optional(),
  kind: zod_1.z.enum(["mod", "resourcepack", "shaderpack", "config"]),
});
exports.SyncPlanSchema = zod_1.z.object({
  serverId: zod_1.z.string().min(1),
  fromVersion: zod_1.z.number().int().nonnegative().nullable(),
  toVersion: zod_1.z.number().int().positive(),
  summary: exports.UpdateSummarySchema,
  operations: zod_1.z.array(exports.SyncOperationSchema),
});
//# sourceMappingURL=update.js.map
