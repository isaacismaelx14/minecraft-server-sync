import { z } from "zod";
export declare const ProfileMetadataResponseSchema: z.ZodObject<
  {
    profileId: z.ZodString;
    version: z.ZodNumber;
    minecraftVersion: z.ZodString;
    loader: z.ZodEnum<{
      fabric: "fabric";
      forge: "forge";
    }>;
    loaderVersion: z.ZodString;
    lockUrl: z.ZodURL;
    serverName: z.ZodString;
    serverAddress: z.ZodString;
    allowedMinecraftVersions: z.ZodDefault<z.ZodArray<z.ZodString>>;
    fancyMenuEnabled: z.ZodDefault<z.ZodBoolean>;
    fancyMenu: z.ZodOptional<
      z.ZodObject<
        {
          enabled: z.ZodDefault<z.ZodBoolean>;
          mode: z.ZodDefault<
            z.ZodEnum<{
              simple: "simple";
              custom: "custom";
            }>
          >;
          playButtonLabel: z.ZodDefault<z.ZodString>;
          hideSingleplayer: z.ZodDefault<z.ZodBoolean>;
          hideMultiplayer: z.ZodDefault<z.ZodBoolean>;
          hideRealms: z.ZodDefault<z.ZodBoolean>;
          customLayoutUrl: z.ZodOptional<z.ZodURL>;
          customLayoutSha256: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    signature: z.ZodOptional<z.ZodString>;
    signatureAlgorithm: z.ZodOptional<z.ZodLiteral<"ed25519">>;
    signatureKeyId: z.ZodOptional<z.ZodString>;
    signatureInput: z.ZodOptional<z.ZodString>;
    signedAt: z.ZodOptional<z.ZodISODateTime>;
  },
  z.core.$strip
>;
export type ProfileMetadataResponse = z.infer<
  typeof ProfileMetadataResponseSchema
>;
