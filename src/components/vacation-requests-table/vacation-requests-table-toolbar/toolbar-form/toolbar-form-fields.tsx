import { Button, FormControl, FormLabel, TextField } from "@mui/material";
import { type ChangeEvent, useEffect } from "react";
import DateRangePicker from "../../../generics/date-range-picker";
import { type DateRange, ToolbarFormModes } from "src/types";
import type { DateTime } from "luxon";
import { hasAllPropsDefined } from "src/utils/check-utils";
import strings from "src/localization/strings";
import { calculateTotalVacationDays } from "src/utils/time-utils";
import type { VacationRequest } from "src/generated/homeLambdasClient";

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
  // This will be used again when we have a solution for various work contracts in place
  // const userProfile = useAtomValue(userProfileAtom);
  // const [users] = useAtom(usersAtom);
  // const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  useEffect(() => {
    setVacationRequestData({
      ...vacationRequestData,
      startDate: dateRange.start.toJSDate(),
      endDate: dateRange.end.toJSDate(),
      days: calculateTotalVacationDays(
        dateRange.start,
        dateRange.end,
        // FIXME: implement a proper solution for various work contracts
        // getWorkingWeek(loggedInUser)
        [true, true, true, true, true, false, false]
      )
    });
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

  return (
    <FormControl sx={{ width: "100%" }}>
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
      <FormLabel sx={{ marginBottom: "5px" }}>{strings.vacationRequest.days}</FormLabel>
      <DateRangePicker
        dateTimeTomorrow={dateTimeTomorrow}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <Button
        disabled={!hasAllPropsDefined(vacationRequestData) || !vacationRequestData.message?.length}
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
