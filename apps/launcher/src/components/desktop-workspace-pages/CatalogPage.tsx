import { Card } from "@minerelay/ui";
import type { DesktopWorkspaceCore, DesktopWorkspacePageStyles } from "./types";

export function CatalogPage({
  core,
  styles,
}: {
  core: DesktopWorkspaceCore;
  styles: DesktopWorkspacePageStyles;
}) {
  const {
    blockClass,
    paneHeadClass,
    subtitleClass,
    paneGridClass,
    panelCardClass,
    h3Class,
    dataListClass,
    dataItemClass,
    dataLabelClass,
    dataValueClass,
    summaryGridClass,
    summaryItemClass,
    summaryValueClass,
    summaryLabelClass,
  } = styles;

  const { catalog, instance, versionReadiness } = core;

  return (
    <div className={blockClass}>
      <div className={paneHeadClass}>
        <h2 className="text-[1.4rem] font-semibold tracking-[0.01em] text-white">
          Catalog
        </h2>
        <p className={subtitleClass}>
          Managed content inventory and lockfile version alignment.
        </p>
      </div>
      <div className={paneGridClass}>
        <Card className={panelCardClass}>
          <h3 className={h3Class}>Content Totals</h3>
          <ul className={summaryGridClass}>
            <li className={summaryItemClass}>
              <strong className={summaryValueClass}>
                {catalog?.mods.length ?? 0}
              </strong>
              <span className={summaryLabelClass}>Mods</span>
            </li>
            <li className={summaryItemClass}>
              <strong className={summaryValueClass}>
                {catalog?.resourcepacks.length ?? 0}
              </strong>
              <span className={summaryLabelClass}>Resourcepacks</span>
            </li>
            <li className={summaryItemClass}>
              <strong className={summaryValueClass}>
                {catalog?.shaderpacks.length ?? 0}
              </strong>
              <span className={summaryLabelClass}>Shaders</span>
            </li>
            <li className={summaryItemClass}>
              <strong className={summaryValueClass}>
                {catalog?.configs.length ?? 0}
              </strong>
              <span className={summaryLabelClass}>Configs</span>
            </li>
          </ul>
        </Card>

        <Card className={panelCardClass}>
          <h3 className={h3Class}>Lock Versions</h3>
          <div className={dataListClass}>
            <div className={dataItemClass}>
              <span className={dataLabelClass}>Installed Version</span>
              <div className={dataValueClass}>
                {instance?.installedVersion ?? "none"}
              </div>
            </div>
            <div className={dataItemClass}>
              <span className={dataLabelClass}>Remote Lock</span>
              <div className={dataValueClass}>
                {catalog?.profileVersion ?? "--"}
              </div>
            </div>
            <div className={dataItemClass}>
              <span className={dataLabelClass}>Local Snapshot</span>
              <div className={dataValueClass}>
                {catalog?.localVersion ?? "--"}
              </div>
            </div>
          </div>
        </Card>

        <Card className={panelCardClass}>
          <h3 className={h3Class}>Runtime Targets</h3>
          <div className={dataListClass}>
            <div className={dataItemClass}>
              <span className={dataLabelClass}>Loader</span>
              <div className={dataValueClass}>
                {catalog?.loader ?? "fabric"} {catalog?.loaderVersion ?? "--"}
              </div>
            </div>
            <div className={dataItemClass}>
              <span className={dataLabelClass}>Minecraft</span>
              <div className={dataValueClass}>
                {catalog?.minecraftVersion ?? "--"}
              </div>
            </div>
            <div className={dataItemClass}>
              <span className={dataLabelClass}>Allowlisted Versions</span>
              <div className={dataValueClass}>
                {versionReadiness?.allowedMinecraftVersions.join(", ") || "--"}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
