import { z } from "zod";
export declare const UpdateSummarySchema: z.ZodObject<
  {
    add: z.ZodNumber;
    remove: z.ZodNumber;
    update: z.ZodNumber;
    keep: z.ZodNumber;
  },
  z.core.$strip
>;
export type UpdateSummary = z.infer<typeof UpdateSummarySchema>;
export declare const UpdatesResponseSchema: z.ZodObject<
  {
    hasUpdates: z.ZodBoolean;
    from: z.ZodNullable<z.ZodNumber>;
    to: z.ZodNumber;
    summary: z.ZodObject<
      {
        add: z.ZodNumber;
        remove: z.ZodNumber;
        update: z.ZodNumber;
        keep: z.ZodNumber;
      },
      z.core.$strip
    >;
  },
  z.core.$strip
>;
export type UpdatesResponse = z.infer<typeof UpdatesResponseSchema>;
export declare const SyncOperationSchema: z.ZodObject<
  {
    op: z.ZodEnum<{
      update: "update";
      add: "add";
      remove: "remove";
      keep: "keep";
    }>;
    path: z.ZodString;
    name: z.ZodString;
    sha256: z.ZodOptional<z.ZodString>;
    fromSha256: z.ZodOptional<z.ZodString>;
    toSha256: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodURL>;
    kind: z.ZodEnum<{
      mod: "mod";
      resourcepack: "resourcepack";
      shaderpack: "shaderpack";
      config: "config";
    }>;
  },
  z.core.$strip
>;
export type SyncOperation = z.infer<typeof SyncOperationSchema>;
export declare const SyncPlanSchema: z.ZodObject<
  {
    serverId: z.ZodString;
    fromVersion: z.ZodNullable<z.ZodNumber>;
    toVersion: z.ZodNumber;
    summary: z.ZodObject<
      {
        add: z.ZodNumber;
        remove: z.ZodNumber;
        update: z.ZodNumber;
        keep: z.ZodNumber;
      },
      z.core.$strip
    >;
    operations: z.ZodArray<
      z.ZodObject<
        {
          op: z.ZodEnum<{
            update: "update";
            add: "add";
            remove: "remove";
            keep: "keep";
          }>;
          path: z.ZodString;
          name: z.ZodString;
          sha256: z.ZodOptional<z.ZodString>;
          fromSha256: z.ZodOptional<z.ZodString>;
          toSha256: z.ZodOptional<z.ZodString>;
          url: z.ZodOptional<z.ZodURL>;
          kind: z.ZodEnum<{
            mod: "mod";
            resourcepack: "resourcepack";
            shaderpack: "shaderpack";
            config: "config";
          }>;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export type SyncPlan = z.infer<typeof SyncPlanSchema>;
