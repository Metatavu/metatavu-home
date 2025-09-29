import { Button, FormControl, FormLabel, TextField, Box } from "@mui/material";
import { type ChangeEvent, useEffect } from "react";
import DateRangePicker from "../../../generics/date-range-picker";
import { type DateRange, ToolbarFormModes } from "src/types";
import type { DateTime } from "luxon";
import { hasAllPropsDefined } from "src/utils/check-utils";
import strings from "src/localization/strings";
import { calculateTotalVacationDays, calculateEndDateFromDays } from "src/utils/time-utils";
import type { VacationRequest } from "src/generated/homeLambdasClient";
import UserRoleUtils from "src/utils/user-role-utils";

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
  setDateRange
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

      <Button
        disabled={
          !adminMode &&
          (!hasAllPropsDefined(vacationRequestData) || !vacationRequestData.message?.length)
        }
        type="submit"
        variant="contained"
        size="large"
        sx={{ marginTop: "10px" }}
      >
        {toolbarFormMode === ToolbarFormModes.CREATE ? strings.form.submit : strings.form.update}
      </Button>
    </FormControl>
  );
};

export default ToolbarFormFields;
