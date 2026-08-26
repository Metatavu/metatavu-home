import { Box } from "@mui/material";
import type { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { usersAtom } from "src/atoms/user";
import { displayedVacationRequestsAtom } from "src/atoms/vacation";
import { type VacationRequest, VacationRequestStatuses } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { DeleteItemType, ToolbarFormModes, type VacationsDataGridRow } from "src/types";
import LocalizationUtils from "src/utils/localization-utils";
import type { FilterType } from "src/utils/vacation-filter-type";
import { getVacationRequestPersonFullName } from "src/utils/vacation-request-utils";
import { getTotalVacationRequestStatus } from "src/utils/vacation-status-utils";
import DeleteConfirmationDialog from "../contexts/delete-confirmation-dialog";
import type { Tab } from "../generics/tabBar";
import AppTable from "../generics/table/appTable";
import VacationRequestsTableColumns from "./vacation-requests-table-columns";
import TableToolbar from "./vacation-requests-table-toolbar/vacation-requests-table-toolbar";

/**
 * Component properties
 */
interface Props {
  toggleIsUpcoming: () => void;
  deleteVacationRequests: (
    selectedRowIds: GridRowId[],
    rows: VacationsDataGridRow[]
  ) => Promise<void>;
  createVacationRequest: (vacationRequestData: VacationRequest) => Promise<void>;
  updateVacationRequest: (
    vacationRequestData: VacationRequest,
    vacationRequestId: string
  ) => Promise<void>;
  updateVacationRequestStatus: (
    updatedVacationRequestStatus: VacationRequestStatuses,
    selectedRowIds: GridRowId[]
  ) => Promise<void>;
  loading: boolean;
  filter: FilterType[];
  setFilter: React.Dispatch<React.SetStateAction<FilterType[]>>;
  tabs: Tab[];
  currentTab: string;
  setCurrentTab: Dispatch<SetStateAction<string>>;
  adminMode: boolean;
}

/**
 * Displays a table of vacation requests with filtering, selection,
 * creation, editing, deletion, and status management functionality.
 *
 * The component transforms vacation request data into rows suitable
 * for the data grid and resolves related user information for display.
 * Administrators have additional controls for managing request statuses.
 *
 * @param props.toggleIsUpcoming - Toggles between upcoming and previous vacation requests.
 * @param props.deleteVacationRequests - Deletes selected vacation requests.
 * @param props.createVacationRequest - Creates a new vacation request.
 * @param props.updateVacationRequest - Updates an existing vacation request.
 * @param props.updateVacationRequestStatus - Updates the status of selected requests.
 * @param props.loading - Indicates whether table data is loading.
 * @param props.filter - Currently selected filters.
 * @param props.setFilter - Updates the selected filters.
 * @param props.tabs - Available navigation tabs.
 * @param props.currentTab - Currently selected tab.
 * @param props.setCurrentTab - Updates the selected tab.
 * @param props.adminMode - Determines whether administrator functionality is enabled.
 *
 * @returns A vacation requests table with its toolbar and dialogs.
 */
const VacationRequestsTable = ({
  toggleIsUpcoming,
  deleteVacationRequests,
  createVacationRequest,
  updateVacationRequest,
  updateVacationRequestStatus,
  loading,
  filter,
  setFilter,
  tabs,
  currentTab,
  setCurrentTab,
  adminMode
}: Props) => {
  const vacationRequests = useAtomValue(displayedVacationRequestsAtom) || [];
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set([])
  });
  const [toolbarFormMode, setToolbarFormMode] = useState<ToolbarFormModes>(ToolbarFormModes.NONE);
  const [deleteRowId, setDeleteRowId] = useState<GridRowId | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const users = useAtomValue(usersAtom) || [];
  const dataGridHeight = 700;
  const dataGridRowHeight = 52;
  const dataGridColumnHeaderHeight = 56;

  /**
   * Create a single vacation request data grid row
   *
   * @param vacationRequest vacation request
   * @returns dataGridRow
   */
  const createDataGridRow = (vacationRequest: VacationRequest): VacationsDataGridRow => {
    return {
      id: vacationRequest.id,
      type: LocalizationUtils.getLocalizedVacationRequestType(vacationRequest.type),
      personFullName: getVacationRequestPersonFullName(vacationRequest, users),
      userId: vacationRequest.userId,
      updatedAt: DateTime.fromJSDate(vacationRequest.updatedAt),
      startDate: DateTime.fromJSDate(vacationRequest.startDate),
      endDate: DateTime.fromJSDate(vacationRequest.endDate),
      days: vacationRequest.days,
      message: vacationRequest.message || strings.vacationRequest.noMessage,
      status: getRowStatus(vacationRequest),
      draft: vacationRequest.draft || false,
      vacationRequest
    };
  };

  const handleDeleteRow = (id: GridRowId) => {
    setDeleteRowId(id);
    setConfirmationOpen(true);
  };

  const columns = VacationRequestsTableColumns();
  /**
   * Get row status
   * @param vacationRequest vacation request
   * @returns status string
   */
  const getRowStatus = (vacationRequest: VacationRequest): string => {
    const { status, draft } = vacationRequest;

    if (Array.isArray(status) && status.length > 0) {
      return getTotalVacationRequestStatus(status);
    }

    return draft ? strings.vacationRequest.draft : VacationRequestStatuses.PENDING;
  };

  const rows = useMemo(() => vacationRequests.map(createDataGridRow), [vacationRequests, users]);

  // Reset selection after deletion
  useEffect(() => {
    setSelectedRowIds({ type: "include", ids: new Set([]) });
  }, [deleteVacationRequests]);

  const onRowClick = (rowId: string) => {
    setSelectedRowIds({ type: "include", ids: new Set([rowId]) });
    setFormOpen(true);
    setToolbarFormMode(adminMode ? ToolbarFormModes.APPROVE : ToolbarFormModes.EDIT);
  };

  return (
    <Box>
      <DeleteConfirmationDialog
        open={confirmationOpen}
        setOpen={setConfirmationOpen}
        onConfirm={async () => {
          if (deleteRowId === null) return;

          await deleteVacationRequests([deleteRowId], rows);

          setDeleteRowId(null);
          setConfirmationOpen(false);
          setFormOpen(false);
        }}
        deleteType={DeleteItemType.VACATION}
      />
      <TableToolbar
        toggleIsUpcoming={toggleIsUpcoming}
        handleDeleteRow={handleDeleteRow}
        createVacationRequest={createVacationRequest}
        updateVacationRequest={updateVacationRequest}
        updateVacationRequestStatus={updateVacationRequestStatus}
        setFormOpen={setFormOpen}
        formOpen={formOpen}
        selectedRowIds={selectedRowIds}
        rows={rows}
        setSelectedRowIds={setSelectedRowIds}
        filter={filter}
        setFilter={setFilter}
        toolbarFormMode={toolbarFormMode}
        setToolbarFormMode={setToolbarFormMode}
        tabs={tabs}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />
      <AppTable
        dataGridHeight={dataGridHeight}
        dataGridRowHeight={dataGridRowHeight}
        dataGridColumnHeaderHeight={dataGridColumnHeaderHeight}
        rows={rows}
        columns={columns}
        loading={loading}
        selectedRowIds={selectedRowIds}
        setSelectedRowIds={setSelectedRowIds}
        onRowClick={onRowClick}
      />
    </Box>
  );
};

export default VacationRequestsTable;
