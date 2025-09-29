import { Box, Grid } from "@mui/material";
import { type VacationRequest, VacationType } from "src/generated/homeLambdasClient";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { type VacationsDataGridRow, ToolbarFormModes, type DateRange } from "src/types";
import type { GridRowId } from "@mui/x-data-grid";
import { determineToolbarFormMode } from "src/utils/toolbar-utils";
import { useAtomValue } from "jotai";
import ToolbarFormFields from "./toolbar-form-fields";
import { allVacationRequestsAtom, vacationRequestsAtom } from "src/atoms/vacation";
import UserRoleUtils from "src/utils/user-role-utils";
import { VacationRequestStatuses } from "src/generated/homeLambdasClient";

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
  createDraftVacationRequest: (vacationRequestData: VacationRequest) => Promise<void>;
  selectedRowIds: GridRowId[];
  rows: VacationsDataGridRow[];
  toolbarFormMode: ToolbarFormModes;
  setToolbarFormMode: (toolbarFormMode: ToolbarFormModes) => void;
  setSelectedRowIds: (selectedRowIds: GridRowId[]) => void;
  isDraft: boolean;
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
  updateVacationRequest,
  selectedRowIds,
  rows,
  toolbarFormMode,
  setToolbarFormMode,
  setSelectedRowIds,
  isDraft
}: Props) => {
  const defaultDateRange = {
    start: DateTime.now().plus({ days: 1 }),
    end: DateTime.now().plus({ days: 1 })
  };
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const defaultVacationRequestData: VacationRequest = {
    createdAt: new Date(),
    createdBy: "",
    draft: isDraft,
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
  const adminMode = UserRoleUtils.adminMode();
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
   * Handle form submit
   */
  const handleFormSubmit = async () => {
    try {
      switch (toolbarFormMode) {
        case ToolbarFormModes.CREATE:
          await createVacationRequest(vacationRequestData);
          break;

        case ToolbarFormModes.EDIT:
          await updateVacationRequest(vacationRequestData, selectedVacationRequestId);
          setSelectedRowIds([]);
          break;

        case ToolbarFormModes.DRAFT:
          await createDraftVacationRequest(vacationRequestData);
          break;

        default:
          break;
      }

      setFormOpen(false);
      resetVacationRequestData();
    } catch (error) {
      console.error("Failed to submit vacation request:", error);
    }
  };

  return (
    <Box sx={{ padding: "10px", width: "100%" }}>
      <Grid container>
        <Grid item xs={12}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleFormSubmit();
            }}
          >
            <ToolbarFormFields
              dateTimeTomorrow={dateTimeTomorrow}
              setVacationRequestData={setVacationRequestData}
              vacationRequestData={vacationRequestData}
              toolbarFormMode={toolbarFormMode}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </form>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ToolbarForm;
