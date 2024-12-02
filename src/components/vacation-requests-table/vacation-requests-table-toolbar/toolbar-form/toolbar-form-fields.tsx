import { Button, FormControl, FormLabel, MenuItem, TextField } from "@mui/material";
import getVacationTypeByString from "src/utils/vacation-type-utils";
import { type ChangeEvent, useEffect } from "react";
import DateRangePicker from "../../../generics/date-range-picker";
import { type DateRange, ToolbarFormModes } from "src/types";
import type { DateTime } from "luxon";
import { hasAllPropsDefined } from "src/utils/check-utils";
import strings from "src/localization/strings";
import LocalizationUtils from "src/utils/localization-utils";
import { calculateTotalVacationDays } from "src/utils/time-utils";
import { useAtom, useAtomValue } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import { VacationType, type User, type VacationRequest } from "src/generated/homeLambdasClient";

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
  const userProfile = useAtomValue(userProfileAtom);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

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
   * Handle vacation type change
   *
   * @param value vacation type string
   */
  const handleVacationTypeChange = (value: string) => {
    const vacationType = getVacationTypeByString(value);
    if (vacationType) {
      setVacationRequestData({
        ...vacationRequestData,
        type: vacationType
      });
    }
  };

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
      <TextField
        select
        label={strings.vacationRequest.type}
        name="type"
        value={String(vacationRequestData.type)}
        onChange={(event) => {
          handleVacationTypeChange(event.target.value);
        }}
        sx={{ marginBottom: "5px", width: "100%" }}
      >
        {Object.keys(VacationType).map((vacationType) => {
          return (
            <MenuItem key={vacationType} value={vacationType}>
              {LocalizationUtils.getLocalizedVacationRequestType(vacationType as VacationType)}
            </MenuItem>
          );
        })}
      </TextField>
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
