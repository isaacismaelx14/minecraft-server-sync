import { z } from "zod";
export declare const ProviderSchema: z.ZodEnum<{
  modrinth: "modrinth";
  direct: "direct";
  curseforge: "curseforge";
}>;
export type Provider = z.infer<typeof ProviderSchema>;
export declare const SideSchema: z.ZodDefault<
  z.ZodEnum<{
    client: "client";
    server: "server";
    both: "both";
  }>
>;
export type Side = z.infer<typeof SideSchema>;
export declare const LockItemSchema: z.ZodObject<
  {
    name: z.ZodString;
    url: z.ZodURL;
    sha256: z.ZodString;
    kind: z.ZodLiteral<"mod">;
    provider: z.ZodEnum<{
      modrinth: "modrinth";
      direct: "direct";
      curseforge: "curseforge";
    }>;
    side: z.ZodDefault<
      z.ZodEnum<{
        client: "client";
        server: "server";
        both: "both";
      }>
    >;
    projectId: z.ZodOptional<z.ZodString>;
    versionId: z.ZodOptional<z.ZodString>;
    iconUrl: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
export type LockItem = z.infer<typeof LockItemSchema>;
export declare const ResourcePackSchema: z.ZodObject<
  {
    name: z.ZodString;
    url: z.ZodURL;
    sha256: z.ZodString;
    kind: z.ZodLiteral<"resourcepack">;
  },
  z.core.$strip
>;
export type ResourcePack = z.infer<typeof ResourcePackSchema>;
export declare const ShaderPackSchema: z.ZodObject<
  {
    name: z.ZodString;
    url: z.ZodURL;
    sha256: z.ZodString;
    kind: z.ZodLiteral<"shaderpack">;
  },
  z.core.$strip
>;
export type ShaderPack = z.infer<typeof ShaderPackSchema>;
export declare const ConfigTemplateSchema: z.ZodObject<
  {
    name: z.ZodString;
    url: z.ZodURL;
    sha256: z.ZodString;
    kind: z.ZodLiteral<"config">;
  },
  z.core.$strip
>;
export type ConfigTemplate = z.infer<typeof ConfigTemplateSchema>;
export declare const DefaultServerSchema: z.ZodObject<
  {
    name: z.ZodString;
    address: z.ZodString;
  },
  z.core.$strip
>;
export type DefaultServer = z.infer<typeof DefaultServerSchema>;
export declare const RuntimeHintsSchema: z.ZodObject<
  {
    javaMajor: z.ZodNumber;
    minMemoryMb: z.ZodNumber;
    maxMemoryMb: z.ZodNumber;
  },
  z.core.$strip
>;
export type RuntimeHints = z.infer<typeof RuntimeHintsSchema>;
export declare const BrandingSchema: z.ZodObject<
  {
    serverName: z.ZodString;
    logoUrl: z.ZodOptional<z.ZodURL>;
    backgroundUrl: z.ZodOptional<z.ZodURL>;
    newsUrl: z.ZodOptional<z.ZodURL>;
  },
  z.core.$strip
>;
export type Branding = z.infer<typeof BrandingSchema>;
export declare const FancyMenuSettingsSchema: z.ZodObject<
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
>;
export type FancyMenuSettings = z.infer<typeof FancyMenuSettingsSchema>;
export declare const ProfileLockSchema: z.ZodObject<
  {
    profileId: z.ZodString;
    version: z.ZodNumber;
    minecraftVersion: z.ZodString;
    loader: z.ZodDefault<
      z.ZodEnum<{
        fabric: "fabric";
        forge: "forge";
      }>
    >;
    loaderVersion: z.ZodString;
    defaultServer: z.ZodObject<
      {
        name: z.ZodString;
        address: z.ZodString;
      },
      z.core.$strip
    >;
    items: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          url: z.ZodURL;
          sha256: z.ZodString;
          kind: z.ZodLiteral<"mod">;
          provider: z.ZodEnum<{
            modrinth: "modrinth";
            direct: "direct";
            curseforge: "curseforge";
          }>;
          side: z.ZodDefault<
            z.ZodEnum<{
              client: "client";
              server: "server";
              both: "both";
            }>
          >;
          projectId: z.ZodOptional<z.ZodString>;
          versionId: z.ZodOptional<z.ZodString>;
          iconUrl: z.ZodOptional<z.ZodString>;
          slug: z.ZodOptional<z.ZodString>;
        },
        z.core.$strip
      >
    >;
    resources: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            url: z.ZodURL;
            sha256: z.ZodString;
            kind: z.ZodLiteral<"resourcepack">;
          },
          z.core.$strip
        >
      >
    >;
    shaders: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            url: z.ZodURL;
            sha256: z.ZodString;
            kind: z.ZodLiteral<"shaderpack">;
          },
          z.core.$strip
        >
      >
    >;
    configs: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            name: z.ZodString;
            url: z.ZodURL;
            sha256: z.ZodString;
            kind: z.ZodLiteral<"config">;
          },
          z.core.$strip
        >
      >
    >;
    runtimeHints: z.ZodObject<
      {
        javaMajor: z.ZodNumber;
        minMemoryMb: z.ZodNumber;
        maxMemoryMb: z.ZodNumber;
      },
      z.core.$strip
    >;
    branding: z.ZodObject<
      {
        serverName: z.ZodString;
        logoUrl: z.ZodOptional<z.ZodURL>;
        backgroundUrl: z.ZodOptional<z.ZodURL>;
        newsUrl: z.ZodOptional<z.ZodURL>;
      },
      z.core.$strip
    >;
    fancyMenu: z.ZodDefault<
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
  },
  z.core.$strip
>;
export type ProfileLock = z.infer<typeof ProfileLockSchema>;
export declare const LockBundleItemSchema: z.ZodDiscriminatedUnion<
  [
    z.ZodObject<
      {
        name: z.ZodString;
        url: z.ZodURL;
        sha256: z.ZodString;
        kind: z.ZodLiteral<"mod">;
        provider: z.ZodEnum<{
          modrinth: "modrinth";
          direct: "direct";
          curseforge: "curseforge";
        }>;
        side: z.ZodDefault<
          z.ZodEnum<{
            client: "client";
            server: "server";
            both: "both";
          }>
        >;
        projectId: z.ZodOptional<z.ZodString>;
        versionId: z.ZodOptional<z.ZodString>;
        iconUrl: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
      },
      z.core.$strip
    >,
    z.ZodObject<
      {
        name: z.ZodString;
        url: z.ZodURL;
        sha256: z.ZodString;
        kind: z.ZodLiteral<"resourcepack">;
      },
      z.core.$strip
    >,
    z.ZodObject<
      {
        name: z.ZodString;
        url: z.ZodURL;
        sha256: z.ZodString;
        kind: z.ZodLiteral<"shaderpack">;
      },
      z.core.$strip
    >,
    z.ZodObject<
      {
        name: z.ZodString;
        url: z.ZodURL;
        sha256: z.ZodString;
        kind: z.ZodLiteral<"config">;
      },
      z.core.$strip
    >,
  ],
  "kind"
>;
export type LockBundleItem = z.infer<typeof LockBundleItemSchema>;
