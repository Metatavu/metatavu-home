import type { GridRowId } from "@mui/x-data-grid";
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
  selectedRowIds: GridRowId[],
  formOpen: boolean,
  setToolbarFormMode: (toolbarFormMode: ToolbarFormModes) => void
) => {
  if (selectedRowIds) {
    switch (true) {
      case selectedRowIds.length === 0 && formOpen:
        setToolbarFormMode(ToolbarFormModes.CREATE);
        break;
      case selectedRowIds.length === 1:
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
    [ToolbarFormModes.EDIT]: strings.tableToolbar.editRequests,
    [ToolbarFormModes.NONE]: strings.tableToolbar.myRequests
  })[toolbarFormMode];
