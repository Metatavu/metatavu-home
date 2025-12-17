import { Add, Cancel, Edit, FilterAlt } from "@mui/icons-material";
import { Box, Button, Collapse, Grid, MenuItem, Select, styled, Typography } from "@mui/material";
import type { GridRowId } from "@mui/x-data-grid";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { languageAtom } from "src/atoms/language";
import EditConfirmationDialogue from "src/components/contexts/edit-confirmation-dialogue";
import type { VacationRequest } from "src/generated/homeLambdasClient";
import { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { ToolbarFormModes, type VacationsDataGridRow } from "src/types";
import { getToolbarTitle } from "src/utils/toolbar-utils";
import type { FilterType } from "src/utils/vacation-filter-type";
import ConfirmationHandler from "../../contexts/confirmation-handler";
import ToolbarDeleteButton from "./toolbar-delete-button";
import ToolbarForm from "./toolbar-form/toolbar-form";
import FormToggleButton from "./toolbar-form-toggle-button";
import ToolbarSubmitButton from "./toolbar-submit-button";
import UpdateStatusButton from "./toolbar-update-status-button";

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
  selectedRowIds: GridRowId[];
  rows: VacationsDataGridRow[];
  setSelectedRowIds: (selectedRowIds: GridRowId[]) => void;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

/**
 * Table toolbar component
 *
 * @param props component properties
 */
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
  const language = useAtomValue(languageAtom);
  const { adminMode } = useUserRole();
  const { pathname } = useLocation();
  const isToolbarVisible = toolbarOpen && !formOpen && selectedRowIds?.length;
  const buttonLabel = isUpcoming ? strings.tableToolbar.future : strings.tableToolbar.past;
  const singleSelectionSize = adminMode ? 3 : 4;
  const multiSelectionSize = adminMode ? 6 : 12;
  const gridItemSize = selectedRowIds?.length === 1 ? singleSelectionSize : multiSelectionSize;
  const disableEditButton = false;
  const selectedRow = rows.find((row) => String(row.id) === String(selectedRowIds[0]));
  const isDraftSelected = selectedRow ? selectedRow.draft : false;
  const [wasDraftBeforeEdit, setWasDraftBeforeEdit] = useState(false);

  useEffect(() => {
    setTitle(getToolbarTitle(toolbarFormMode));
    if (adminMode && toolbarFormMode === ToolbarFormModes.NONE) {
      setTitle(strings.tableToolbar.manageRequests);
    }
  }, [toolbarFormMode, language, pathname]);

  useEffect(() => {
    toggleToolbarOpenOnSelectedRowIds(selectedRowIds);
  }, [selectedRowIds]);

  /**
   * Toggle toolbar open on selected row ids
   *
   * @param selectedRowIds selected row ids
   */
  const toggleToolbarOpenOnSelectedRowIds = (selectedRowIds: GridRowId[]) => {
    if (selectedRowIds) {
      setToolbarOpen(true);
    } else {
      setToolbarOpen(false);
    }
  };

  /**
   * Delete vacation requests and statuses
   */
  const deleteVacationsData = async () => {
    await deleteVacationRequests(selectedRowIds, rows);
  };

  /**
   * Toolbar grid item component
   */
  const ToolbarGridItem = styled(Grid)({
    padding: "10px"
  });

  /**
   * Toolbar grid container component
   */
  const ToolbarGridContainer = styled(Grid)({
    alignContent: "space-around",
    alignItems: "center"
  });

  /** Handler for saving updated vacation request data
   *
   * @param data vacation request data
   */
  const handleSaveClick = (data: VacationRequest) => {
    setEditVacationsData(data);
    setEditConfirmationHandlerOpen(true);
  };

  /** Handler for confirming edit to vacation request
   *
   */
  const handleEditConfirm = async () => {
    if (!editVacationsData?.id) return;

    await updateVacationRequest(editVacationsData, editVacationsData.id);
    setSelectedRowIds([]);
    setFormOpen(false);
  };

  /**
   * Submit a draft vacation request for approval
   *
   * @param {string} vacationRequestId - The ID of the vacation request to submit for approval.
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
    setSelectedRowIds([]);
    setFormOpen(false);
  };

  /**
   *  handler for edit button click
   */
  const handleEditButtonClick = () => {
    setToolbarFormMode(ToolbarFormModes.EDIT);
    setFormOpen(true);
    setWasDraftBeforeEdit(isDraftSelected);
  };

  return (
    <Box>
      <ConfirmationHandler
        open={confirmationHandlerOpen}
        setOpen={setConfirmationHandlerOpen}
        deleteVacationsData={deleteVacationsData}
      />
      <EditConfirmationDialogue
        open={editConfirmationHandlerOpen}
        setOpen={setEditConfirmationHandlerOpen}
        isDraft={wasDraftBeforeEdit}
        isAdmin={adminMode}
        onConfirm={handleEditConfirm}
        setFormOpen={setFormOpen}
      />
      {isToolbarVisible ? (
        <ToolbarGridContainer container>
          <ToolbarGridItem item sm={gridItemSize} xs={4}>
            <ToolbarDeleteButton setConfirmationHandlerOpen={setConfirmationHandlerOpen} />
          </ToolbarGridItem>
          {selectedRowIds?.length === 1 && (
            <>
              <ToolbarGridItem item sm={adminMode ? 3 : 4}>
                <FormToggleButton
                  title={strings.tableToolbar.edit}
                  ButtonIcon={Edit}
                  value={formOpen}
                  setValue={handleEditButtonClick}
                  disabled={disableEditButton}
                />
              </ToolbarGridItem>
              {isDraftSelected && !adminMode && (
                <ToolbarGridItem xs={4}>
                  <ToolbarSubmitButton
                    onClick={() => handleSubmitForApproval(selectedRowIds[0] as string)}
                  />
                </ToolbarGridItem>
              )}
            </>
          )}
          {adminMode && (
            <>
              <ToolbarGridItem item sm={3} xs={6}>
                <UpdateStatusButton
                  updateVacationRequestStatus={updateVacationRequestStatus}
                  buttonType={VacationRequestStatuses.APPROVED}
                  selectedRowIds={selectedRowIds}
                />
              </ToolbarGridItem>
              <ToolbarGridItem item sm={3} xs={6}>
                <UpdateStatusButton
                  updateVacationRequestStatus={updateVacationRequestStatus}
                  buttonType={VacationRequestStatuses.DECLINED}
                  selectedRowIds={selectedRowIds}
                />
              </ToolbarGridItem>
            </>
          )}
        </ToolbarGridContainer>
      ) : (
        <ToolbarGridContainer container>
          <ToolbarGridItem item xs={3}>
            <Typography variant="h6">{title}</Typography>
          </ToolbarGridItem>
          <ToolbarGridItem item xs={3}>
            <Button
              sx={{
                backgroundColor: "#eeeeee",
                p: 1,
                "&:hover": { backgroundColor: "#e0e0e0" }
              }}
              onClick={toggleIsUpcoming}
            >
              <FilterAlt />
              {buttonLabel}
            </Button>
          </ToolbarGridItem>
          <ToolbarGridItem item xs={3}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              sx={{
                maxWidth: 120,
                backgroundColor: "#eeeeee",
                height: 42,
                color: "#222",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none"
                },
                "&:hover": { backgroundColor: "#e0e0e0" },
                fontWeight: 700,
                display: "flex"
              }}
            >
              <MenuItem value="ALL">{strings.tableToolbar.all}</MenuItem>
              {!adminMode && <MenuItem value="DRAFT">{strings.tableToolbar.draft}</MenuItem>}
              <MenuItem value={VacationRequestStatuses.PENDING}>
                {strings.vacationRequest.pending}
              </MenuItem>
              <MenuItem value={VacationRequestStatuses.APPROVED}>
                {strings.vacationRequest.approved}
              </MenuItem>
              <MenuItem value={VacationRequestStatuses.DECLINED}>
                {strings.vacationRequest.declined}
              </MenuItem>
            </Select>
          </ToolbarGridItem>
          <ToolbarGridItem item xs={3}>
            {formOpen ? (
              <FormToggleButton
                title={strings.tableToolbar.cancel}
                ButtonIcon={Cancel}
                value={formOpen}
                setValue={setFormOpen}
                buttonVariant="outlined"
              />
            ) : (
              !adminMode && (
                <FormToggleButton
                  value={formOpen}
                  setValue={setFormOpen}
                  title={strings.tableToolbar.create}
                  ButtonIcon={Add}
                />
              )
            )}
          </ToolbarGridItem>
        </ToolbarGridContainer>
      )}
      <Collapse in={formOpen}>
        <ToolbarForm
          formOpen={formOpen}
          setFormOpen={setFormOpen}
          createVacationRequest={createVacationRequest}
          createDraftVacationRequest={createDraftVacationRequest}
          selectedRowIds={selectedRowIds}
          rows={rows}
          updateVacationRequest={updateVacationRequest}
          setSelectedRowIds={setSelectedRowIds}
          toolbarFormMode={toolbarFormMode}
          setToolbarFormMode={setToolbarFormMode}
          onSaveClick={handleSaveClick}
        />
      </Collapse>
    </Box>
  );
};

export default TableToolbar;
