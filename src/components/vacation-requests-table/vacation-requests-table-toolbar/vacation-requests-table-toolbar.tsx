import { Add, Cancel, Edit, FilterAlt } from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
  Grid,
  MenuItem,
  Select,
  styled,
  Typography,
  useTheme
} from "@mui/material";
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
  selectedRowIds: GridRowSelectionModel;
  rows: VacationsDataGridRow[];
  setSelectedRowIds: (selectedRowIds: GridRowSelectionModel) => void;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

const EMPTY_SELECTION: GridRowSelectionModel = { type: "include", ids: new Set([]) };

const ToolbarGridItem = styled(Grid)({
  padding: "10px"
});

const ToolbarGridContainer = styled(Grid)({
  alignContent: "space-around",
  alignItems: "center"
});

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
  const theme = useTheme();
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [toolbarFormMode, setToolbarFormMode] = useState<ToolbarFormModes>(ToolbarFormModes.NONE);
  const [confirmationHandlerOpen, setConfirmationHandlerOpen] = useState(false);
  const [editConfirmationHandlerOpen, setEditConfirmationHandlerOpen] = useState(false);
  const [editVacationsData, setEditVacationsData] = useState<VacationRequest | null>(null);
  const [title, setTitle] = useState(strings.tableToolbar.myRequests);
  const language = useAtomValue(languageAtom);
  const { adminMode } = useUserRole();
  const { pathname } = useLocation();

  const selectedIdsSize = selectedRowIds?.ids?.size ?? 0;
  const firstId: GridRowId | undefined = selectedRowIds?.ids
    ? [...selectedRowIds.ids][0]
    : undefined;

  const isToolbarVisible = toolbarOpen && !formOpen && selectedIdsSize > 0;
  const buttonLabel = isUpcoming ? strings.tableToolbar.future : strings.tableToolbar.past;
  const singleSelectionSize = adminMode ? 3 : 4;
  const multiSelectionSize = adminMode ? 6 : 12;
  const gridItemSize = selectedIdsSize === 1 ? singleSelectionSize : multiSelectionSize;
  const disableEditButton = false;
  const selectedRow = rows.find((row) => String(row.id) === String(firstId));
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
  const toggleToolbarOpenOnSelectedRowIds = (model: GridRowSelectionModel) => {
    setToolbarOpen((model?.ids?.size ?? 0) > 0);
  };

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
        <ToolbarGridContainer container spacing={0}>
          <ToolbarGridItem size={{ sm: gridItemSize, xs: 4 }}>
            <ToolbarDeleteButton setConfirmationHandlerOpen={setConfirmationHandlerOpen} />
          </ToolbarGridItem>
          {selectedIdsSize === 1 && (
            <>
              <ToolbarGridItem size={{ sm: adminMode ? 3 : 4 }}>
                <FormToggleButton
                  title={strings.tableToolbar.edit}
                  ButtonIcon={Edit}
                  value={formOpen}
                  setValue={handleEditButtonClick}
                  disabled={disableEditButton}
                />
              </ToolbarGridItem>
              {isDraftSelected && !adminMode && (
                <ToolbarGridItem size={{ xs: 4 }}>
                  <ToolbarSubmitButton
                    onClick={() => handleSubmitForApproval(firstId as string)}
                  />
                </ToolbarGridItem>
              )}
            </>
          )}
          {adminMode && (
            <>
              <ToolbarGridItem size={{ sm: 3, xs: 6 }}>
                <UpdateStatusButton
                  updateVacationRequestStatus={updateVacationRequestStatus}
                  buttonType={VacationRequestStatuses.APPROVED}
                  selectedRowIds={selectedRowIds?.ids ? [...selectedRowIds.ids] : []}
                />
              </ToolbarGridItem>
              <ToolbarGridItem size={{ sm: 3, xs: 6 }}>
                <UpdateStatusButton
                  updateVacationRequestStatus={updateVacationRequestStatus}
                  buttonType={VacationRequestStatuses.DECLINED}
                  selectedRowIds={selectedRowIds?.ids ? [...selectedRowIds.ids] : []}
                />
              </ToolbarGridItem>
            </>
          )}
        </ToolbarGridContainer>
      ) : (
        <ToolbarGridContainer container spacing={0}>
          <ToolbarGridItem size={{ xs: 3 }}>
            <Typography variant="h6">{title}</Typography>
          </ToolbarGridItem>
          <ToolbarGridItem size={{ xs: 3 }}>
            <Button
              sx={{
                backgroundColor: theme.palette.background.paper,
                p: 1,
                "&:hover": { backgroundColor: theme.palette.action.hover },
                color: theme.palette.text.primary
              }}
              onClick={toggleIsUpcoming}
            >
              <FilterAlt />
              {buttonLabel}
            </Button>
          </ToolbarGridItem>
          <ToolbarGridItem size={{ xs: 3 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              sx={{
                maxWidth: 120,
                backgroundColor: theme.palette.background.paper,
                height: 42,
                color: theme.palette.text.primary,
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none"
                },
                "&:hover": { backgroundColor: theme.palette.action.hover },
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
          <ToolbarGridItem size={{ xs: 3 }}>
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