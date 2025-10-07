import { Box, Button, FormControl, FormLabel, TextField, Grid, Tooltip } from "@mui/material";
import type { DateTime } from "luxon";
import { type ChangeEvent, useEffect } from "react";
import type { VacationRequest } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { type DateRange, ToolbarFormModes } from "src/types";
import { hasAllPropsDefined } from "src/utils/check-utils";
import { calculateEndDateFromDays, calculateTotalVacationDays } from "src/utils/time-utils";
import UserRoleUtils from "src/utils/user-role-utils";
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
 * @param props component properties
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
  const adminMode = UserRoleUtils.adminMode();
  const workWeek = [true, true, true, true, true, false, false];
  // TODO: This will be used again when we have a solution for various work contracts in place
  // const userProfile = useAtomValue(userProfileAtom);
  // const [users] = useAtom(usersAtom);
  // const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  useEffect(() => {
    if (!adminMode) {
      setVacationRequestData({
        ...vacationRequestData,
        startDate: dateRange.start.toJSDate(),
        endDate: dateRange.end.toJSDate(),
        days: calculateTotalVacationDays(
          dateRange.start,
          dateRange.end,
          // FIXME: implement a proper solution for various work contracts
          // getWorkingWeek(loggedInUser)
          // [true, true, true, true, true, false, false]
          workWeek
        )
      });
    } else {
      setVacationRequestData({
        ...vacationRequestData,
        startDate: dateRange.start.toJSDate(),
        endDate: dateRange.end.toJSDate()
      });
    }
  }, [dateRange]);

  /**
   * Handle vacation data change
   *
   * @param value message string
   */
  const handleVacationRequestDataChange = (value: string) => {
    setVacationRequestData({
      ...vacationRequestData,
      message: value
    });
  };

  /**
   * Handle days change
   *
   * @param value days string
   */
  const handleDaysChange = (value: string) => {
    const daysValue = Number.parseInt(value) || 0;
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
   * Handle restore default days
   */
  const handleRestoreDefaultDays = () => {
    const defaultDays = calculateTotalVacationDays(dateRange.start, dateRange.end, [
      true,
      true,
      true,
      true,
      true,
      false,
      false
    ]);

    setVacationRequestData({
      ...vacationRequestData,
      days: defaultDays
    });
  };

  return (
    <FormControl sx={{ width: "100%" }}>
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
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                handleDaysChange(event.target.value);
              }}
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
          <Grid item xs={6}>
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
          <Tooltip
            title={strings.tableToolbar.saveAsDraftTooltip}
            placement="bottom"
          >
            <Grid item xs={6}>
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
