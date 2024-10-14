import { useEffect, useState } from "react";
import { DateCalendar, PickersDay, type PickersDayProps } from "@mui/x-date-pickers";
import {
  Badge,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from "@mui/material";
import { DateTime } from "luxon";
import { useLambdasApi } from "../../hooks/use-api";
import { onCallAtom } from "../../atoms/oncall";
import { useAtom, useSetAtom } from "jotai";
import { errorAtom } from "../../atoms/error";
import strings from "../../localization/strings";
import { stringToColor } from "../../utils/oncall-utils";
import type { OnCallCalendarEntry } from "../../types";
import OnCallHandler from "../contexts/oncall-handler";
import OnCallListView from "../oncall-calendars/oncall-list-view";
import type { OnCallPaid } from "src/generated/homeLambdasClient";

/**
 * On call calendar screen component
 */
const OnCallCalendarScreen = () => {
  /**
   * Validates if local storage item is of correct type
   * @returns boolean value from local storage if validated
   */
  const validateJSONString = () => {
    const item = localStorage.getItem("calendarViewAsDefault");
    if (item) return JSON.parse(item);
    return true;
  };

  const { onCallApi } = useLambdasApi();
  const [onCallData, setOnCallData] = useAtom(onCallAtom);
  const [open, setOpen] = useState(false);
  const [isCalendarView, setIsCalendarView] = useState(validateJSONString());
  const [selectedDate, setSelectedDate] = useState<DateTime>(DateTime.now());
  const [onCallPerson, setOnCallPerson] = useState("");
  const [selectedOnCallEntry, setSelectedOnCallEntry] = useState<OnCallCalendarEntry>();
  const setError = useSetAtom(errorAtom);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getOnCallData(selectedDate.year);
  }, [selectedDate.year]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: dependency is necessary
  useEffect(() => {
    getCurrentOnCallPerson();
  }, [onCallData]);

  /**
   * Fetches on call data, such as personnel and weeks
   * @param year year of entries to search
   */
  const getOnCallData = async (year: number) => {
    setIsLoading(true);
    try {
      const fetchedData = await onCallApi.listOnCallData({ year: year.toString() });
      setOnCallData(fetchedData);
    } catch (error) {
      setError(`${strings.oncall.fetchFailed}, ${error}`);
    }
    setIsLoading(false);
  };

  /**
   * Finds the current on call employee and sets them in a state
   */
  const getCurrentOnCallPerson = () => {
    if (selectedDate.year === DateTime.now().year) {
      const currentWeek = DateTime.now().weekNumber;
      const currentOnCallPerson = onCallData.find((item) => Number.parseInt(item.week) === currentWeek)?.person;
      if (currentOnCallPerson) setOnCallPerson(currentOnCallPerson);
    }
  };

  /**
   * Generates props for Badge component to be displayed in DateCalendar
   * @returns Array containing props for Badge component
   */
  const generateOnCallWeeks = () => {
    const onCallWeeks: OnCallCalendarEntry[] = [];
    for (const item of onCallData) {
      const weeks = DateTime.fromObject({ weekNumber: Number.parseInt(item.week), weekYear: selectedDate.year });

      for (let i = 0; i < 7; i++) {
        onCallWeeks.push({
          date: weeks.plus({ days: i }).toISODate(),
          person: item.person,
          paid: item.paid,
          badgeColor: stringToColor(item.person)
        });
      }
    }
    return onCallWeeks;
  };

  /**
   * Updates the selected paid status
   * @param year
   * @param weekNumber
   * @param paid
   */
  const updatePaidStatus = async (year: number, weekNumber: number, paid: boolean) => {
    const updateParameters: OnCallPaid = {
      year: year,
      week: weekNumber,
      paid: !paid
    };
    await onCallApi.updatePaid({ onCallPaid: updateParameters });
    getOnCallData(year);
  };

  /**
   * Renders the current week's on call person if they exist
   * @returns Typography element containing the current on call employee
   */
  const renderCurrentOnCall = () => {
    if (onCallPerson)
      return (
        <Typography sx={{ textAlign: "center" }}>
          {strings.oncall.onCallPersonExists}{" "}
          <b style={{ color: stringToColor(onCallPerson) }}>{onCallPerson}</b>
        </Typography>
      );

    return <Typography sx={{ textAlign: "center" }}>{strings.oncall.noOnCallPerson}</Typography>;
  };

  /**
   * Populates DateCalendar component with customized Badge components created from on-call data
   * @param props
   * @returns Badge and PickersDay component for calendar each day
   */
  const populateCalendarWeeks = (
    props: PickersDayProps<DateTime> & { highlightedDays?: number[] }
  ) => {
    const { day, outsideCurrentMonth, ...other } = props;

    const calendarProps = generateOnCallWeeks();
    const badgeColor = calendarProps.find((item) => item.date === day.toISODate())?.badgeColor;
    const populatedDay = calendarProps.map((item) => item.date).includes(day.toISODate());
    const personName = calendarProps.filter((item) => item.date === day.toISODate())[0]?.person;
    const personInitials = personName?.split(" ")[0][0] + personName?.split(" ")[1][0];
    const paidStatus = calendarProps.filter((item) => item.date === day.toISODate())[0]?.paid;

    return (
      <Box>
        <Badge
          key={props.day.toString()}
          overlap={"circular"}
          sx={{ color: "black", ".MuiBadge-overlapCircular": { backgroundColor: badgeColor } }}
          badgeContent={populatedDay ? personInitials : undefined}
        >
          <PickersDay
            onClick={() => selectEntryToUpdate(calendarProps, day)}
            sx={paidStatus ? { color: "green", fontWeight: "bold" } : {}}
            {...other}
            outsideCurrentMonth={outsideCurrentMonth}
            day={day}
          />
        </Badge>
      </Box>
    );
  };

  /**
   * Handles render between list view and calendar view
   * @param toggle
   */
  const handleCalendarViewChange = (toggle: boolean) => {
    setIsCalendarView(toggle);
    localStorage.setItem("calendarViewAsDefault", toggle.toString());
  };

  /**
   * Renders calendar or list view
   * @returns Calendar or list view component
   */
  const renderCalendarOrList = () => {
    if (isLoading)
      return (
        <Box sx={{ p: "25%", display: "flex", justifyContent: "center" }}>
          <CircularProgress sx={{ scale: "150%" }} />
        </Box>
      );
    if (isCalendarView)
      return (
        <DateCalendar
          defaultValue={selectedDate}
          onMonthChange={(value) => {
            setSelectedDate(value);
          }}
          onYearChange={(value) => {
            setSelectedDate(value);
          }}
          displayWeekNumber={true}
          slots={{ day: populateCalendarWeeks }}
        />
      );

    return (
      <OnCallListView
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        updatePaidStatus={updatePaidStatus}
      />
    );
  };

  /**
   * Selects a paid status to update and handles the rendering of oncall handler
   * @param onCallEntries
   * @param date
   */
  const selectEntryToUpdate = (onCallEntries: OnCallCalendarEntry[], date: DateTime) => {
    const selectedEntry = onCallEntries.find((item) => item.date === date.toISODate());
    setSelectedOnCallEntry(selectedEntry);
    setOpen(true);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <FormControl sx={{ width: "50%", textAlign: "center", margin: "auto" }}>
        <InputLabel id="calendarSelect">{strings.oncall.selectView}</InputLabel>
        <Select
          labelId="calendarSelect"
          id="calendarSelect"
          label="Select calendar view"
          value={isCalendarView ? "Calendar" : "List"}
        >
          <MenuItem value={"Calendar"} onClick={() => handleCalendarViewChange(true)}>
            {strings.oncall.calendar}
          </MenuItem>
          <MenuItem value={"List"} onClick={() => handleCalendarViewChange(false)}>
            {strings.oncall.list}
          </MenuItem>
        </Select>
      </FormControl>
      <OnCallHandler
        open={open}
        setOpen={setOpen}
        onCallEntry={selectedOnCallEntry}
        updatePaidStatus={updatePaidStatus}
      />
      {renderCurrentOnCall()}
      {renderCalendarOrList()}
    </Box>
  );
};

export default OnCallCalendarScreen;
