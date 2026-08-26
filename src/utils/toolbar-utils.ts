import strings from "../localization/strings";
import { ToolbarFormModes } from "../types";

/**
 * Determine toolbar form mode
 *
 * @param selectedRowIds selected row ids
 * @param formOpen form open boolean
 * @param setToolbarFormMode set toolbar form mode function
 */
export const determineToolbarFormMode = (
  action: string,
  formOpen: boolean,
  setToolbarFormMode: (toolbarFormMode: ToolbarFormModes) => void
) => {
  if (formOpen) {
    switch (true) {
      case action === "create":
        setToolbarFormMode(ToolbarFormModes.CREATE);
        break;
      case action === "edit":
        setToolbarFormMode(ToolbarFormModes.EDIT);
        break;
      default:
        setToolbarFormMode(ToolbarFormModes.NONE);
    }
  }
};

/**
 * Get toolbar title
 *
 * @param toolbarFormMode toolbar form mode
 * @returns title as string
 */
export const getToolbarTitle = (toolbarFormMode: ToolbarFormModes) =>
  ({
    [ToolbarFormModes.CREATE]: strings.tableToolbar.createRequests,
    [ToolbarFormModes.APPROVE]: strings.tableToolbar.manageRequests,
    [ToolbarFormModes.EDIT]: strings.tableToolbar.editRequests,
    [ToolbarFormModes.NONE]: strings.tableToolbar.myRequests
  })[toolbarFormMode];
