import { DeleteOutlineRounded, Edit } from "@mui/icons-material";
import { Alert, Box, FormControl, FormLabel, TextField, useTheme } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import type { DateTime } from "luxon";
import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState
} from "react";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import AppButton from "src/components/generics/buttons/app-button";
import AppIconButton from "src/components/generics/buttons/app-icon-button";
import Dropdown from "src/components/generics/dropdown";
import {
  type User,
  type VacationRequest,
  type VacationRequestStatuses,
  VacationType
} from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { type DateRange, ToolbarFormModes } from "src/types";
import { hasAllPropsDefined } from "src/utils/check-utils";
import LocalizationUtils from "src/utils/localization-utils";
import { calculateTotalVacationDays, contractedWeekToBoolean } from "src/utils/time-utils";
import { renderVacationDaysTextForScreen } from "src/utils/vacation-days-utils";
import DateRangePicker from "../../generics/date-range-picker";
import AdminVacationFormFields from "./admin-vacation-request-form";

/**
 * Component properties
 */
interface Props {
  vacationRequestData: VacationRequest;
  setVacationRequestData: (vacationRequestData: VacationRequest) => void;
  dateTimeTomorrow: DateTime;
  toolbarFormMode: ToolbarFormModes;
  setToolbarFormMode: Dispatch<SetStateAction<ToolbarFormModes>>;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  handleCreate: () => void;
  handleEdit: () => void;
  handleCancel: () => void;
  handleDeleteRow: (selectedVacationRequestId: string) => void;
  selectedVacationRequestId: string;
  handleUpdateVacationRequestStatus: (status: VacationRequestStatuses) => void;
}

/**
 * Form fields for creating and editing vacation requests.
 *
 * Displays the vacation request date range, message, and vacation type.
 * The available fields and actions depend on the current user's role
 * and the current toolbar form mode.
 *
 * For admin view, additional controls are provided for editing
 * the number of vacation days and updating the request status.
 * The component also retrieves the user's contracted work week to
 * calculate the number of vacation days for the selected date range.
 *
 * @param props.vacationRequestData - Current vacation request data.
 * @param props.setVacationRequestData - Updates the vacation request data.
 * @param props.dateTimeTomorrow - Earliest date available for selection.
 * @param props.toolbarFormMode - Current form mode.
 * @param props.setToolbarFormMode - Updates the form mode.
 * @param props.dateRange - Selected vacation date range.
 * @param props.setDateRange - Updates the selected date range.
 * @param props.handleCreate - Creates a new vacation request.
 * @param props.handleEdit - Saves changes to an existing vacation request.
 * @param props.handleCancel - Closes the form without saving.
 * @param props.handleDeleteRow - Deletes the selected vacation request.
 * @param props.selectedVacationRequestId - ID of the selected vacation request.
 * @param props.handleUpdateVacationRequestStatus - Updates the request status.
 *
 * @returns Form fields and actions for creating and managing a vacation request.
 */
const VacationRequestFormFields = ({
  vacationRequestData,
  setVacationRequestData,
  dateTimeTomorrow,
  toolbarFormMode,
  setToolbarFormMode,
  dateRange,
  setDateRange,
  handleCreate,
  handleEdit,
  handleCancel,
  handleDeleteRow,
  selectedVacationRequestId,
  handleUpdateVacationRequestStatus
}: Props) => {
  const { adminMode } = useUserRole();
  const userProfile = useAtomValue(userProfileAtom);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const [workWeek, setWorkWeek] = useState<boolean[]>(new Array(7).fill(false));
  const { workHoursApi } = useLambdasApi();
  const [error, setError] = useState<string | null>(null);
  const originalEndDateRef = useRef<DateTime | null>(null);
  const originalStartDateRef = useRef<DateTime | null>(null);
  const theme = useTheme();
  const initialEditMode =
    toolbarFormMode === ToolbarFormModes.APPROVE || toolbarFormMode === ToolbarFormModes.EDIT;
  const adminEditmode = toolbarFormMode === ToolbarFormModes.EDIT && adminMode;

  const vacationTypes = [
    {
      value: VacationType.VACATION,
      label: LocalizationUtils.getLocalizedVacationRequestType(VacationType.VACATION)
    }
  ];
  /**
   * Fetch contracted work week, defaults to 5 day if it fails
   * Re-runs when severaUserId changes
   */
  useEffect(() => {
    const fetchWorkWeek = async () => {
      if (!userProfile?.attributes?.severaUserId) return;

      try {
        const data = await workHoursApi.calculateUserContractedWeek({
          severaUserId: userProfile.attributes.severaUserId as string
        });
        setWorkWeek(contractedWeekToBoolean(data.contractedWeek));
        setError(null);
      } catch (error: any) {
        const errorMessage = await error?.response?.json();
        setError(`${strings.error.fetchWorkWeekFailed}: ${errorMessage?.message || error}`);
        setWorkWeek([true, true, true, true, true, false, false]);
      }
    };

    fetchWorkWeek();
  }, [userProfile?.attributes?.severaUserId]);

  /**
   * Reset original end date when form mode changes
   */
  useEffect(() => {
    originalEndDateRef.current = null;
    originalStartDateRef.current = null;
  }, [toolbarFormMode]);

  // Update vacation request whenever date range changes
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;
    // Store original end date on first load
    if (!originalEndDateRef.current && !originalStartDateRef.current) {
      originalEndDateRef.current = dateRange.end;
      originalStartDateRef.current = dateRange.start;
    }

    const originalStart = originalStartDateRef.current;
    const originalEnd = originalEndDateRef.current;

    if (!originalStart || !originalEnd) return;

    const days = calculateTotalVacationDays(dateRange.start, dateRange.end, workWeek);
    const isModified =
      !dateRange.start.hasSame(originalStart, "day") || !dateRange.end.hasSame(originalEnd, "day");

    if (isModified) {
      setVacationRequestData({
        ...vacationRequestData,
        startDate: dateRange.start.toJSDate(),
        endDate: dateRange.end.toJSDate(),
        days
      });
    }
  }, [dateRange, workWeek, adminMode]);

  /**
   * Handle vacation request data change
   *
   * @param value component value
   */
  const handleVacationRequestDataChange = (value: string) => {
    setVacationRequestData({
      ...vacationRequestData,
      message: value
    });
  };

  const handleVacationTypeChange = (value: string) => {
    setVacationRequestData({
      ...vacationRequestData,
      type: value as VacationType
    });
  };

  /**
   *
   * Handle days change (admin)
   *
   * @param value days string
   */
  const handleDaysChange = (value: number) => {
    setVacationRequestData({
      ...vacationRequestData,
      days: value
    });
  };

  /**
   * restore default days (admin)
   */
  const handleRestoreDefaultDays = () => {
    if (!dateRange.start || !originalEndDateRef.current) return;

    // Calculate days based on original end date
    const defaultDays = calculateTotalVacationDays(
      dateRange.start,
      originalEndDateRef.current,
      workWeek
    );

    setVacationRequestData({
      ...vacationRequestData,
      days: defaultDays,
      endDate: originalEndDateRef.current.toJSDate()
    });
  };

  return (
    <FormControl
      sx={{
        width: 728,
        gap: theme.spaces.l,
        color: theme.palette.text.primary,
        ...theme.typography.body,
        fontWeight: 500,
        "& .MuiFormLabel-root": {
          font: "inherit",
          color: "inherit"
        }
      }}
    >
      {error && (
        <Alert severity="warning" sx={{ mb: theme.spaces.s }}>
          {error}
        </Alert>
      )}
      {!adminMode && loggedInUser && renderVacationDaysTextForScreen(loggedInUser, theme)}
      <DateRangePicker
        dateTimeTomorrow={dateTimeTomorrow}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <Box display="flex" flexDirection="column">
        <FormLabel>{strings.vacationRequest.message}*</FormLabel>
        <TextField
          required
          error={!vacationRequestData.message?.length}
          value={vacationRequestData.message}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleVacationRequestDataChange(event.target.value);
          }}
          size="small"
        />
      </Box>
      <FormLabel>{strings.vacationRequest.type} *</FormLabel>
      <Dropdown
        displayOption={vacationRequestData.type}
        handleDisplayOptionChange={(event) => handleVacationTypeChange(event?.target.value)}
        displayOptions={vacationTypes}
      />
      {toolbarFormMode === ToolbarFormModes.CREATE && (
        <Box display="flex" justifyContent="space-between">
          <AppButton
            disabled={
              !adminMode &&
              (!hasAllPropsDefined(vacationRequestData) || !vacationRequestData.message?.length)
            }
            variant="secondary"
            sx={{ width: "min-content", height: "min-content", mt: theme.spaces.m }}
            onClick={handleCancel}
            text={strings.tableToolbar.cancel}
          />
          <AppButton
            disabled={
              !adminMode &&
              (!hasAllPropsDefined(vacationRequestData) || !vacationRequestData.message?.length)
            }
            variant="primary"
            sx={{ width: "min-content", height: "min-content" }}
            onClick={handleCreate}
            text={strings.form.submit}
          />
        </Box>
      )}
      {initialEditMode && (
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          {!adminEditmode && (
            <Box display="flex" flexDirection="row">
              <AppIconButton
                variant="small"
                onClick={() => handleDeleteRow(selectedVacationRequestId)}
                icon={<DeleteOutlineRounded />}
                sx={{ mt: theme.spaces.xxl }}
              />
              {adminMode && (
                <AppIconButton
                  variant="small"
                  onClick={() => setToolbarFormMode(ToolbarFormModes.EDIT)}
                  icon={<Edit />}
                  sx={{ mt: theme.spaces.xxl }}
                />
              )}
            </Box>
          )}
          {adminMode ? (
            <AdminVacationFormFields
              handleUpdateVacationRequestStatus={handleUpdateVacationRequestStatus}
              toolbarFormMode={toolbarFormMode}
              setToolbarFormMode={setToolbarFormMode}
              defaultDays={vacationRequestData.days}
              handleDaysChange={handleDaysChange}
              handleRestoreDefaultDays={handleRestoreDefaultDays}
            />
          ) : (
            <AppButton
              disabled={
                !adminMode &&
                (!hasAllPropsDefined(vacationRequestData) || !vacationRequestData.message?.length)
              }
              variant="primary"
              sx={{ height: "min-content", ml: "auto", mt: theme.spaces.xxl }}
              onClick={handleEdit}
              text={strings.form.update}
            />
          )}
        </Box>
      )}
    </FormControl>
  );
};

export default VacationRequestFormFields;
