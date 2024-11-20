import { Button, FormControl, FormLabel, MenuItem, TextField } from "@mui/material";
import getVacationTypeByString from "src/utils/vacation-type-utils";
import { type ChangeEvent, useEffect } from "react";
import DateRangePicker from "../../../generics/date-range-picker";
import { type DateRange, ToolbarFormModes, type VacationData } from "src/types";
import type { DateTime } from "luxon";
import { hasAllPropsDefined } from "src/utils/check-utils";
import strings from "src/localization/strings";
import LocalizationUtils from "src/utils/localization-utils";
import { calculateTotalVacationDays } from "src/utils/time-utils";
import { useAtom, useAtomValue } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import { VacationType} from "src/generated/homeLambdasClient";
import {User} from "src/generated/homeLambdasClient";

/**
 * Component properties
 */
interface Props {
  vacationData: VacationData;
  setVacationData: (vacationDate: VacationData) => void;
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
  vacationData,
  setVacationData,
  dateTimeTomorrow,
  toolbarFormMode,
  dateRange,
  setDateRange
}: Props) => {
  const userProfile = useAtomValue(userProfileAtom);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find(
    (user: User) =>
      user.id === userProfile?.id
  );

  useEffect(() => {
    setVacationData({
      ...vacationData,
      startDate: dateRange.start,
      endDate: dateRange.end,
      days: calculateTotalVacationDays(
        dateRange.start,
        dateRange.end,
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
      setVacationData({
        ...vacationData,
        type: vacationType
      });
    }
  };

  /**
   * Handle vacation data change
   *
   * @param value message string
   */
  const handleVacationDataChange = (value: string) => {
    setVacationData({
      ...vacationData,
      message: value
    });
  };

  /**
   * Get a list of working days
   *
   * @param loggedInUser User
   */
  // const getWorkingWeek = (loggedInUser?: User) => {
  //   const workingWeek = new Array(DAYS_OF_WEEK.length).fill(false);
  //   if (!loggedInUser) return workingWeek;
  //
  //   DAYS_OF_WEEK.forEach((weekDay, index) => {
  //     if (loggedInUser[weekDay as keyof typeof loggedInUser] !== 0) {
  //       workingWeek[index] = true;
  //     }
  //   });
  //   return workingWeek;
  // };

  return (
    <FormControl sx={{ width: "100%" }}>
      <TextField
        select
        label={strings.vacationRequest.type}
        name="type"
        value={String(vacationData.type)}
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
        error={!vacationData.message?.length}
        value={vacationData.message}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleVacationDataChange(event.target.value);
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
        disabled={!hasAllPropsDefined(vacationData) || !vacationData.message?.length}
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
