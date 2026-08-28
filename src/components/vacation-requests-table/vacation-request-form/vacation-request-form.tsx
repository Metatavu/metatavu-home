import { Grid } from "@mui/material";
import type { GridRowId } from "@mui/x-data-grid";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { displayedVacationRequestsAtom } from "src/atoms/vacation";
import AppOverlay from "src/components/generics/appOverlay";
import {
  type VacationRequest,
  VacationRequestStatuses,
  VacationType
} from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { type DateRange, ToolbarFormModes, type VacationsDataGridRow } from "src/types";
import { getToolbarTitle } from "src/utils/toolbar-utils";
import VacationRequestFormFields from "./vacation-request-form-fields";

/**
 * Component properties
 */
interface Props {
  formOpen: boolean;
  setFormOpen: (formOpen: boolean) => void;
  updateVacationRequest: (
    vacationRequestData: VacationRequest,
    vacationRequestId: string
  ) => Promise<void>;
  createVacationRequest: (vacationRequestData: VacationRequest) => Promise<void>;
  selectedRowIds: GridRowId[];
  rows: VacationsDataGridRow[];
  toolbarFormMode: ToolbarFormModes;
  setToolbarFormMode: Dispatch<SetStateAction<ToolbarFormModes>>;
  setSelectedRowIds: (selectedRowIds: GridRowId[]) => void;
  handleDeleteRow: (id: GridRowId) => void;
  handleUpdateVacationRequestStatus: (buttonType: VacationRequestStatuses) => void;
  onSaveClick?: (data: VacationRequest) => void;
}

/**
 * Form for creating and editing vacation requests.
 *
 * Displays the vacation request form inside an overlay and manages
 * the form's local state, including the selected dates, vacation request
 * data, and selected request ID.
 *
 * The form supports creating new requests and editing existing requests.
 * Editing behavior depends on the current user's role and the status
 * of the selected vacation request.
 *
 * @param props.formOpen - Controls whether the form is displayed.
 * @param props.setFormOpen - Updates the visibility of the form.
 * @param props.createVacationRequest - Creates a new vacation request.
 * @param props.updateVacationRequest - Updates an existing vacation request.
 * @param props.selectedRowIds - IDs of the currently selected table rows.
 * @param props.rows - Rows displayed in the vacation requests table.
 * @param props.toolbarFormMode - Current mode of the toolbar form.
 * @param props.setToolbarFormMode - Updates the toolbar form mode.
 * @param props.setSelectedRowIds - Updates the selected table rows.
 * @param props.handleDeleteRow - Deletes a selected vacation request.
 * @param props.handleUpdateVacationRequestStatus - Updates the selected request's status.
 * @param props.onSaveClick - Optional callback invoked when an edited request is saved.
 *
 * @returns A modal form for creating and editing vacation requests.
 */
const VacationRequestForm = ({
  formOpen,
  setFormOpen,
  createVacationRequest,
  updateVacationRequest,
  selectedRowIds,
  setSelectedRowIds,
  rows,
  toolbarFormMode,
  setToolbarFormMode,
  handleDeleteRow,
  handleUpdateVacationRequestStatus,
  onSaveClick
}: Props) => {
  const defaultDateRange = {
    start: DateTime.now().plus({ days: 1 }),
    end: DateTime.now().plus({ days: 1 })
  };
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const defaultVacationRequestData: VacationRequest = {
    createdAt: new Date(),
    createdBy: "",
    draft: false,
    id: "",
    updatedAt: new Date(),
    userId: "",
    type: VacationType.VACATION,
    startDate: defaultDateRange.start.toJSDate(),
    endDate: defaultDateRange.end.toJSDate(),
    message: "",
    days: 1,
    status: [
      {
        status: VacationRequestStatuses.PENDING,
        createdBy: "",
        updatedAt: new Date()
      }
    ]
  };
  const [vacationRequestData, setVacationRequestData] = useState<VacationRequest>(
    defaultVacationRequestData
  );
  const [selectedVacationRequestId, setSelectedVacationRequestId] = useState("");
  const { adminMode } = useUserRole();
  const vacationRequests = useAtomValue(displayedVacationRequestsAtom);
  const [title, setTitle] = useState(strings.tableToolbar.create);
  const editMode = ToolbarFormModes.EDIT;

  /**
   * Reset vacation data
   */
  const resetVacationRequestData = () => {
    setVacationRequestData(defaultVacationRequestData);
    setDateRange(defaultDateRange);
  };

  /**
   * Determine toolbar form mode
   */
  useEffect(() => {
    setTitle(getToolbarTitle(toolbarFormMode));
  }, [selectedRowIds, formOpen, adminMode]);

  /**
   * Get vacation data from row
   */
  const getVacationRequestDataFromRow = () => {
    const selectedVacationRow = rows.find((row) => row.id === selectedRowIds[0]);
    if (selectedVacationRow) {
      const selectedVacationRequest = vacationRequests.find(
        (vacationRequest) => vacationRequest.id === selectedVacationRow.id
      );
      if (selectedVacationRequest?.id) {
        const startDate = DateTime.fromJSDate(selectedVacationRequest.startDate);
        const endDate = DateTime.fromJSDate(selectedVacationRequest.endDate);
        const days = selectedVacationRequest.days;

        setVacationRequestData({
          ...defaultVacationRequestData,
          message: selectedVacationRequest.message,
          startDate: startDate.toJSDate(),
          endDate: endDate.toJSDate(),
          days: days,
          status: selectedVacationRequest.status ?? defaultVacationRequestData.status
        });

        setSelectedVacationRequestId(selectedVacationRequest.id);
        setDateRange({
          start: startDate,
          end: endDate
        });
      }
    }
  };

  /**
   * Set vacation data from selected row if toolbar is in edit mode
   */
  useEffect(() => {
    if (toolbarFormMode === editMode && selectedRowIds?.length && rows?.length) {
      getVacationRequestDataFromRow();
    } else {
      resetVacationRequestData();
    }
  }, [formOpen]);

  const dateTimeTomorrow = DateTime.now().plus({ days: 1 });

  /**
   * Handle create vacation request
   */
  const handleCreate = async () => {
    setFormOpen(false);
    await createVacationRequest(vacationRequestData);
  };

  /**
   * Handle edit vacation request
   * For pending status (non-admin): directly update without confirmation
   * For other statuses or admin mode: show confirmation dialog before updating
   */
  const handleEdit = async () => {
    const currentStatus = vacationRequestData.status?.[0]?.status;
    setFormOpen(false);

    if (currentStatus === VacationRequestStatuses.PENDING && !adminMode) {
      await updateVacationRequest(vacationRequestData, selectedVacationRequestId);
    } else if (onSaveClick) {
      onSaveClick({
        ...vacationRequestData,
        id: selectedVacationRequestId
      });
    }
    setSelectedRowIds([]);
  };

  /**
   * Handle canceling/closing the form
   */
  const handleCancel = () => {
    setFormOpen(false);
  };

  return (
    <AppOverlay open={formOpen} onClose={handleCancel} title={title}>
      <Grid container>
        <Grid size={12}>
          <VacationRequestFormFields
            dateTimeTomorrow={dateTimeTomorrow}
            setVacationRequestData={setVacationRequestData}
            vacationRequestData={vacationRequestData}
            toolbarFormMode={toolbarFormMode}
            setToolbarFormMode={setToolbarFormMode}
            dateRange={dateRange}
            setDateRange={setDateRange}
            handleCreate={handleCreate}
            handleEdit={handleEdit}
            handleCancel={handleCancel}
            handleDeleteRow={handleDeleteRow}
            selectedVacationRequestId={selectedVacationRequestId}
            handleUpdateVacationRequestStatus={handleUpdateVacationRequestStatus}
          />
        </Grid>
      </Grid>
    </AppOverlay>
  );
};

export default VacationRequestForm;
