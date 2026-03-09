import type { useAppCore } from "../../hooks/useAppCore";

export type DesktopWorkspaceCore = ReturnType<typeof useAppCore>;

export type DesktopWorkspacePageStyles = {
  blockClass: string;
  paneHeadClass: string;
  subtitleClass: string;
  paneGridClass: string;
  panelCardClass: string;
  h3Class: string;
  dataListClass: string;
  dataItemClass: string;
  dataLabelClass: string;
  dataValueClass: string;
  summaryGridClass: string;
  summaryItemClass: string;
  summaryValueClass: string;
  summaryLabelClass: string;
  overviewListClass: string;
  overviewChipClass: string;
  actionsRowClass: string;
  primaryButtonClass: string;
  ghostButtonClass: string;
  inputBaseClass: string;
  selectClass: string;
  detailsClass: string;
  meterClass: string;
  metricsClass: string;
};
