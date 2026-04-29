import { Box, Collapse } from "@mui/material";
import type { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { languageAtom } from "src/atoms/language";
import EditConfirmationDialog from "src/components/contexts/edit-confirmation-dialog";
import type { VacationRequest } from "src/generated/homeLambdasClient";
import { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { DeleteItemType, ToolbarFormModes, type VacationsDataGridRow } from "src/types";
import { getToolbarTitle } from "src/utils/toolbar-utils";
import type { FilterType } from "src/utils/vacation-filter-type";
import DeleteConfirmationDialog from "../../contexts/delete-confirmation-dialog";
import DefaultToolbar from "./DefaultToolbar";
import SelectionToolbar from "./SelectionToolbar";
import ToolbarForm from "./toolbar-form/toolbar-form";

/**
 * Component properties
 */
interface Props {
  isUpcoming: boolean;
  toggleIsUpcoming: () => void;
  deleteVacationRequests: (
    selectedRowIds: GridRowId[],
    rows: VacationsDataGridRow[]
  ) => Promise<void>;
  createVacationRequest: (VacationRequest: VacationRequest) => Promise<void>;
  createDraftVacationRequest: (vacationRequestData: VacationRequest) => Promise<void>;
  updateVacationRequest: (
    VacationRequest: VacationRequest,
    vacationRequestId: string
  ) => Promise<void>;
  updateVacationRequestStatus: (
    vacationRequestStatus: VacationRequestStatuses,
    selectedRowIds: GridRowId[]
  ) => Promise<void>;
  fetchVacationRequestById: (vacationRequestId: string) => Promise<VacationRequest | null>;
  setFormOpen: (formOpen: boolean) => void;
  formOpen: boolean;
  selectedRowIds: GridRowSelectionModel;
  rows: VacationsDataGridRow[];
  setSelectedRowIds: (selectedRowIds: GridRowSelectionModel) => void;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

/**
 * Table toolbar component
 *
 * @param props component properties
 */
const EMPTY_SELECTION: GridRowSelectionModel = { type: "include", ids: new Set([]) };

const TableToolbar = ({
  isUpcoming,
  toggleIsUpcoming,
  deleteVacationRequests,
  createVacationRequest,
  createDraftVacationRequest,
  updateVacationRequest,
  updateVacationRequestStatus,
  fetchVacationRequestById,
  setFormOpen,
  formOpen,
  selectedRowIds,
  rows,
  setSelectedRowIds,
  filter,
  setFilter
}: Props) => {
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [toolbarFormMode, setToolbarFormMode] = useState<ToolbarFormModes>(ToolbarFormModes.NONE);
  const [confirmationHandlerOpen, setConfirmationHandlerOpen] = useState(false);
  const [editConfirmationHandlerOpen, setEditConfirmationHandlerOpen] = useState(false);
  const [editVacationsData, setEditVacationsData] = useState<VacationRequest | null>(null);
  const [title, setTitle] = useState(strings.tableToolbar.myRequests);
  const [wasDraftBeforeEdit, setWasDraftBeforeEdit] = useState(false);
  const language = useAtomValue(languageAtom);
  const { adminMode } = useUserRole();
  const { pathname } = useLocation();

  const selectedIdsSize = selectedRowIds?.ids?.size ?? 0;
  const firstId: GridRowId | undefined = selectedRowIds?.ids
    ? [...selectedRowIds.ids][0]
    : undefined;

  const isToolbarVisible = toolbarOpen && !formOpen && selectedIdsSize > 0;
  const singleSelectionSize = adminMode ? 3 : 4;
  const multiSelectionSize = adminMode ? 6 : 12;
  const gridItemSize = selectedIdsSize === 1 ? singleSelectionSize : multiSelectionSize;
  const selectedRow = rows.find((row) => String(row.id) === String(firstId));
  const isDraftSelected = selectedRow ? selectedRow.draft : false;

  useEffect(() => {
    setTitle(getToolbarTitle(toolbarFormMode));
    if (adminMode && toolbarFormMode === ToolbarFormModes.NONE) {
      setTitle(strings.tableToolbar.manageRequests);
    }
  }, [toolbarFormMode, language, pathname]);

  useEffect(() => {
    setToolbarOpen((selectedRowIds?.ids?.size ?? 0) > 0);
  }, [selectedRowIds]);

  /**
   * Delete vacation requests and statuses
   */
  const deleteVacationsData = async () => {
    const ids: GridRowId[] = selectedRowIds?.ids ? [...selectedRowIds.ids] : [];
    await deleteVacationRequests(ids, rows);
  };

  /**
   * Handler for saving updated vacation request data
   *
   * @param data vacation request data
   */
  const handleSaveClick = (data: VacationRequest) => {
    setEditVacationsData(data);
    setEditConfirmationHandlerOpen(true);
  };

  /**
   * Handler for confirming edit to vacation request
   */
  const handleEditConfirm = async () => {
    if (!editVacationsData?.id) return;

    await updateVacationRequest(editVacationsData, editVacationsData.id);
    setSelectedRowIds(EMPTY_SELECTION);
    setFormOpen(false);
  };

  /**
   * Submit a draft vacation request for approval
   *
   * @param vacationRequestId - The ID of the vacation request to submit for approval
   */
  const handleSubmitForApproval = async (vacationRequestId: string) => {
    if (!vacationRequestId) return;

    const vacationRequest = await fetchVacationRequestById(vacationRequestId);
    if (!vacationRequest) return;

    const updatedRequest: VacationRequest = {
      ...vacationRequest,
      draft: false,
      updatedAt: new Date(),
      status: [
        {
          status: VacationRequestStatuses.PENDING,
          createdBy: vacationRequest.userId,
          updatedAt: new Date()
        }
      ]
    };
    await updateVacationRequest(updatedRequest, updatedRequest.id as string);
    setSelectedRowIds(EMPTY_SELECTION);
    setFormOpen(false);
  };

  /**
   * Handler for edit button click
   */
  const handleEditButtonClick = () => {
    setToolbarFormMode(ToolbarFormModes.EDIT);
    setFormOpen(true);
    setWasDraftBeforeEdit(isDraftSelected);
  };

  return (
    <Box>
      <DeleteConfirmationDialog
        open={confirmationHandlerOpen}
        setOpen={setConfirmationHandlerOpen}
        onConfirm={deleteVacationsData}
        deleteType={DeleteItemType.VACATION}
      />
      <EditConfirmationDialog
        open={editConfirmationHandlerOpen}
        setOpen={setEditConfirmationHandlerOpen}
        isDraft={wasDraftBeforeEdit}
        isAdmin={adminMode}
        onConfirm={handleEditConfirm}
        setFormOpen={setFormOpen}
      />
      {isToolbarVisible ? (
        <SelectionToolbar
          selectedIdsSize={selectedIdsSize}
          gridItemSize={gridItemSize}
          adminMode={adminMode}
          isDraftSelected={isDraftSelected}
          firstId={firstId}
          selectedRowIds={selectedRowIds}
          setConfirmationHandlerOpen={setConfirmationHandlerOpen}
          handleEditButtonClick={handleEditButtonClick}
          handleSubmitForApproval={handleSubmitForApproval}
          updateVacationRequestStatus={updateVacationRequestStatus}
        />
      ) : (
        <DefaultToolbar
          title={title}
          isUpcoming={isUpcoming}
          formOpen={formOpen}
          adminMode={adminMode}
          filter={filter}
          setFilter={setFilter}
          toggleIsUpcoming={toggleIsUpcoming}
          setFormOpen={setFormOpen}
        />
      )}
      <Collapse in={formOpen}>
        <ToolbarForm
          formOpen={formOpen}
          setFormOpen={setFormOpen}
          createVacationRequest={createVacationRequest}
          createDraftVacationRequest={createDraftVacationRequest}
          selectedRowIds={selectedRowIds?.ids ? [...selectedRowIds.ids] : []}
          rows={rows}
          updateVacationRequest={updateVacationRequest}
          setSelectedRowIds={(ids: GridRowId[]) =>
            setSelectedRowIds({ type: "include", ids: new Set(ids) })
          }
          toolbarFormMode={toolbarFormMode}
          setToolbarFormMode={setToolbarFormMode}
          onSaveClick={handleSaveClick}
        />
      </Collapse>
    </Box>
  );
};

export default TableToolbar;
