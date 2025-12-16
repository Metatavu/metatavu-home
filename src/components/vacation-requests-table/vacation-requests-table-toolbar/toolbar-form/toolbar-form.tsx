import { Box, Grid } from "@mui/material";
import type { GridRowId } from "@mui/x-data-grid";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { allVacationRequestsAtom, vacationRequestsAtom } from "src/atoms/vacation";
import {
  type VacationRequest,
  VacationRequestStatuses,
  VacationType
} from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import { type DateRange, ToolbarFormModes, type VacationsDataGridRow } from "src/types";
import { determineToolbarFormMode } from "src/utils/toolbar-utils";
import ToolbarFormFields from "./toolbar-form-fields";

/**
 * Component properties
 */
interface Props {
  formOpen: boolean;
  setFormOpen: (formOpen: boolean) => void;

  createVacationRequest: (vacationRequestData: VacationRequest) => Promise<void>;
  createDraftVacationRequest: (vacationRequestData: VacationRequest) => Promise<void>;
  selectedRowIds: GridRowId[];
  rows: VacationsDataGridRow[];
  toolbarFormMode: ToolbarFormModes;
  setToolbarFormMode: (toolbarFormMode: ToolbarFormModes) => void;
  onSaveClick?: (data: VacationRequest) => void;
}

/**
 * Toolbar form component
 *
 * @param props component properties
 */
const ToolbarForm = ({
  formOpen,
  setFormOpen,
  createVacationRequest,
  createDraftVacationRequest,
  selectedRowIds,
  rows,
  toolbarFormMode,
  setToolbarFormMode,
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
  const vacationRequests = useAtomValue(adminMode ? allVacationRequestsAtom : vacationRequestsAtom);

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
    determineToolbarFormMode(selectedRowIds, formOpen, setToolbarFormMode);
  }, [selectedRowIds, formOpen]);

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
    if (toolbarFormMode === ToolbarFormModes.EDIT && selectedRowIds?.length && rows?.length) {
      getVacationRequestDataFromRow();
    } else {
      resetVacationRequestData();
    }
  }, [toolbarFormMode]);

  const dateTimeTomorrow = DateTime.now().plus({ days: 1 });

  /**
   * Handle create vacation request
   */
  const handleCreate = async () => {
    await createVacationRequest(vacationRequestData);
    setFormOpen(false);
  };

  /**
   * Handle edit vacation request
   *
   * Always call onSaveClick to show confirmation dialog before updating
   */
  const handleEdit = () => {
    if (onSaveClick) {
      onSaveClick({
        ...vacationRequestData,
        id: selectedVacationRequestId
      });
    }
  };

  /**
   *  Handle draft vacation request creation
   */
  const handleDraft = async () => {
    await createDraftVacationRequest(vacationRequestData);
    setFormOpen(false);
  };

  return (
    <Box sx={{ padding: "10px", width: "100%" }}>
      <Grid container>
        <Grid item xs={12}>
          <ToolbarFormFields
            dateTimeTomorrow={dateTimeTomorrow}
            setVacationRequestData={setVacationRequestData}
            vacationRequestData={vacationRequestData}
            toolbarFormMode={toolbarFormMode}
            dateRange={dateRange}
            setDateRange={setDateRange}
            handleCreate={handleCreate}
            handleEdit={handleEdit}
            handleDraft={handleDraft}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ToolbarForm;
