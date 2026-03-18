import {
  Alert,
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  TextField,
  Tooltip
} from "@mui/material";
import { useAtomValue } from "jotai";
import type { DateTime } from "luxon";
import { type ChangeEvent, useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import type { VacationRequest } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { type DateRange, ToolbarFormModes } from "src/types";
import { hasAllPropsDefined } from "src/utils/check-utils";
import {
  calculateEndDateFromDays,
  calculateTotalVacationDays,
  contractedWeekToBoolean
} from "src/utils/time-utils";
import DateRangePicker from "../../../generics/date-range-picker";

/**
 * Component properties
 */
interface Props {
  vacationRequestData: VacationRequest;
  setVacationRequestData: (vacationRequestData: VacationRequest) => void;
  dateTimeTomorrow: DateTime;
  toolbarFormMode: ToolbarFormModes;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  handleCreate: () => void;
  handleEdit: () => void;
  handleDraft: () => void;
}

/**
 * Toolbar form fields component
 *
 * @param props - component properties
 *
 */
const ToolbarFormFields = ({
  vacationRequestData,
  setVacationRequestData,
  dateTimeTomorrow,
  toolbarFormMode,
  dateRange,
  setDateRange,
  handleCreate,
  handleEdit,
  handleDraft
}: Props) => {
  const { adminMode } = useUserRole();
  const userProfile = useAtomValue(userProfileAtom);
  const [workWeek, setWorkWeek] = useState<boolean[]>(new Array(7).fill(false));
  const { workHoursApi } = useLambdasApi();
  const [error, setError] = useState<string | null>(null);

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
      } catch {
        setError(strings.error.fetchWorkWeekFailed);
        setWorkWeek([true, true, true, true, true, false, false]);
      }
    };

    fetchWorkWeek();
  }, [userProfile?.attributes?.severaUserId]);

  // Update vacation request whenever date range changes
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    const days = calculateTotalVacationDays(dateRange.start, dateRange.end, workWeek);

    if (!adminMode) {
      setVacationRequestData({
        ...vacationRequestData,
        startDate: dateRange.start.toJSDate(),
        endDate: dateRange.end.toJSDate(),
        days
      });
    } else {
      setVacationRequestData({
        ...vacationRequestData,
        startDate: dateRange.start.toJSDate(),
        endDate: dateRange.end.toJSDate()
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

  /**
   *
   * Handle days change (admin)
   *
   * @param value days string
   */
  const handleDaysChange = (value: string) => {
    const daysValue = Number.parseInt(value, 10) || 0;
    if (!dateRange.start) return;

    const newEndDate = calculateEndDateFromDays(dateRange.start, daysValue, workWeek);
    setDateRange({
      start: dateRange.start,
      end: newEndDate
    });
    setVacationRequestData({
      ...vacationRequestData,
      days: daysValue,
      endDate: newEndDate.toJSDate()
    });
  };

  /**
   * restore default days (admin)
   */
  const handleRestoreDefaultDays = () => {
    if (!dateRange.start || !dateRange.end) return;
    const defaultDays = calculateTotalVacationDays(dateRange.start, dateRange.end, workWeek);
    setVacationRequestData({
      ...vacationRequestData,
      days: defaultDays
    });
  };

  return (
    <FormControl sx={{ width: "100%" }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!adminMode && (
        <>
          <FormLabel>{strings.vacationRequest.message}</FormLabel>
          <TextField
            required
            error={!vacationRequestData.message?.length}
            value={vacationRequestData.message}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              handleVacationRequestDataChange(event.target.value);
            }}
            sx={{ marginBottom: "5px" }}
          />
        </>
      )}
      {adminMode ? (
        <>
          <FormLabel>{strings.vacationRequest.days}</FormLabel>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
            <TextField
              type="number"
              value={vacationRequestData.days ?? ""}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleDaysChange(event.target.value)
              }
              inputProps={{ min: 0 }}
              sx={{ flexGrow: 1 }}
            />
            <Button variant="outlined" size="medium" onClick={handleRestoreDefaultDays}>
              {strings.form.restoreDefault}
            </Button>
          </Box>
        </>
      ) : (
        <>
          <FormLabel sx={{ marginBottom: "5px" }}>{strings.vacationRequest.days}</FormLabel>
          <DateRangePicker
            dateTimeTomorrow={dateTimeTomorrow}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </>
      )}
      {toolbarFormMode === ToolbarFormModes.CREATE && (
        <Grid container spacing={2}>
          <Grid size={6}>
            <Button
              disabled={
                !adminMode &&
                (!hasAllPropsDefined(vacationRequestData) || !vacationRequestData.message?.length)
              }
              type="button"
              variant="contained"
              size="large"
              sx={{ marginTop: "10px", width: "100%" }}
              onClick={handleCreate}
            >
              {strings.form.submit}
            </Button>
          </Grid>
          <Tooltip title={strings.tableToolbar.saveAsDraftTooltip} placement="bottom">
            <Grid size={6}>
              <Button
                disabled={
                  !adminMode &&
                  (!hasAllPropsDefined(vacationRequestData) || !vacationRequestData.message?.length)
                }
                type="button"
                variant="contained"
                size="large"
                sx={{ marginTop: "10px", width: "100%" }}
                onClick={handleDraft}
              >
                {strings.tableToolbar.saveAsDraft}
              </Button>
            </Grid>
          </Tooltip>
        </Grid>
      )}
      {toolbarFormMode === ToolbarFormModes.EDIT && (
        <Button
          disabled={
            !adminMode &&
            (!hasAllPropsDefined(vacationRequestData) || !vacationRequestData.message?.length)
          }
          type="button"
          variant="contained"
          size="large"
          sx={{ marginTop: "10px" }}
          onClick={handleEdit}
        >
          {strings.form.update}
        </Button>
      )}
    </FormControl>
  );
};

export default ToolbarFormFields;
