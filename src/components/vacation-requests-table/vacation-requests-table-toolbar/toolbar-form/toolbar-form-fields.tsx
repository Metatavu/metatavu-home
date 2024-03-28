import { Button, FormControl, FormLabel, MenuItem, TextField } from "@mui/material";
import getVacationTypeByString from "../../../../utils/vacation-type-utils";
import { VacationType } from "../../../../generated/client";
import { ChangeEvent, useEffect } from "react";
import DateRangePicker from "../../../generics/date-range-picker";
import { DateRange, ToolbarFormModes, VacationData } from "../../../../types";
import { DateTime } from "luxon";
import { hasAllPropsDefined } from "../../../../utils/check-utils";
import strings from "../../../../localization/strings";
import LocalizationUtils from "../../../../utils/localization-utils";
import { calculateTotalVacationDays } from "../../../../utils/time-utils";
import { useAtom, useAtomValue } from "jotai";
import config from "../../../../app/config";
import { userProfileAtom } from "../../../../atoms/auth";
import { personsAtom } from "../../../../atoms/person";
import { Person } from "../../../../generated/client";
import { daysOfWeek } from "../../../constants";

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
  const [persons] = useAtom(personsAtom);
  const loggedInPerson = persons.find(
    (person: Person) => person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  );

  useEffect(() => {
    setVacationData({
      ...vacationData,
      startDate: dateRange.start,
      endDate: dateRange.end,
      days: calculateTotalVacationDays(dateRange.start, dateRange.end, getWorkingWeek(loggedInPerson))
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
   * @param loggedInPerson Person
   */
  const getWorkingWeek = (loggedInPerson?: Person) => {
    const workingWeek = new Array(daysOfWeek.length).fill(false);
    if (!loggedInPerson) return workingWeek;
    
    daysOfWeek.forEach((weekDay, index)=>{
      if (loggedInPerson[weekDay as keyof typeof loggedInPerson] !== 0) {
        workingWeek[index] = true;
      }
    }) 
    return workingWeek;
  }

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
