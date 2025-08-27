import { useEffect, useState, useMemo } from "react";
import UserRoleUtils from "src/utils/user-role-utils";
import { DateCalendar, PickersDay, type PickersDayProps } from "@mui/x-date-pickers";
import {
  Badge,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  styled,
  GlobalStyles
} from "@mui/material";
import { DateTime } from "luxon";
import { useLambdasApi } from "../../hooks/use-api";
import { onCallAtom } from "../../atoms/oncall";
import { useAtom, useSetAtom } from "jotai";
import { errorAtom } from "../../atoms/error";
import strings from "../../localization/strings";
import { stringToColor } from "../../utils/oncall-utils";
import type { OnCallWeek } from "../../types";
import OnCallPaidStatusDialog from "../onCall/oncall-paid-status-dialog";
import OnCallListView from "../onCall/oncall-list-view";
import type { OnCallPaid } from "src/generated/homeLambdasClient";
import type { OnCall } from "src/generated/homeLambdasClient/models/OnCall";
import { red } from "@mui/material/colors";

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
  const [onCallPerson, setOnCallPerson] = useState<string | null>(null);
  const [selectedOnCallWeek, setSelectedOnCallWeek] = useState<OnCallWeek>();
  const isAccountant = UserRoleUtils.isAccountant();
  const setError = useSetAtom(errorAtom);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOnCallData(selectedDate.year);
  }, [selectedDate.year]);

  useEffect(() => {
    getCurrentOnCallPerson();
  }, [onCallData]);

  /**
   * Fetches on call data
   * @param year year of entries to search
   */
  const getOnCallData = async (year: number) => {
    setLoading(true);
    try {
      const fetchedData = await onCallApi.listOnCallData({ year: year.toString() });
      setOnCallData(fetchedData);
    } catch (error) {
      setError(`${strings.oncall.fetchFailed}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Finds the current on call employee and sets them in a state
   */
  const getCurrentOnCallPerson = () => {
    const currentWeek = DateTime.now().weekNumber;
    const currentOnCallPerson = onCallData.find((item) => item.week === currentWeek)?.username;
    if (currentOnCallPerson) {
      setOnCallPerson(currentOnCallPerson);
    }
    else {
      setOnCallPerson(null);
    }
  };

  /**
   * Updates the selected paid status
   *
   * @param year - Year of the on-call week
   * @param weekNumber - Week number to update
   * @param paid - Current paid status (will be toggled)
   */
  const updatePaidStatus = async (year: number, weekNumber: number, paid: boolean) => {
    const updateParameters: OnCallPaid = {
      year: year,
      week: weekNumber,
      paid: !paid
    };
    try {
      await onCallApi.updatePaid({ onCallPaid: updateParameters });
      // Locally update paid status
      setOnCallData(prev =>
        prev.map(item =>
          item.year === year && item.week === weekNumber
            ? { ...item, paid: !paid }
            : item
        )
      );
    } catch (error) {
      setError(`${error}`);
    }
  };

  /**
   * Renders the current week's on call person if they exist
   */
  const renderCurrentOnCall = () => {
    const isValidPerson = onCallPerson !== null;
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", margin: 2 }}>
        {isValidPerson ? (
          <>
            <Typography sx={{ color: "#5acc31", fontWeight: "bold", textAlign: "center" }}>
              {strings.oncall.onCallPersonExists}
            </Typography>
            <Typography sx={{ color: "black", fontWeight: "bold", ml: 1 }}>
              {onCallPerson}
            </Typography>
          </>
        ) : (
          <Typography sx={{ color: red[700], fontWeight: "bold", textAlign: "center" }}>
            {strings.oncall.noOnCallPerson}
          </Typography>
        )}
      </Box>
    );
  };



  /**
   * Maps on-call data by week number
   */
  const onCallByWeek = useMemo(() => {
    const map = new Map<number, OnCall>();
    for (const entry of onCallData) {
      map.set(entry.week, entry);
    }
    return map;
  }, [onCallData]);

  /**
   * Handles render between list view and calendar view
   *
   * @param toggle - true for calendar view, false for list view
   */
  const handleCalendarViewChange = (toggle: boolean) => {
    setIsCalendarView(toggle);
    localStorage.setItem("calendarViewAsDefault", toggle.toString());
  };

  /**
   * Renders calendar or list view
   */
  const renderCalendarOrList = () => {
    if (loading)
      return (
        <CalendarContainer>
          <CircularProgress sx={{ scale: "150%" }} />
        </CalendarContainer>
      );
    if (isCalendarView)
      return (
        <CalendarContainer>
          <DateCalendar
            defaultValue={selectedDate}
            onMonthChange={setSelectedDate}
            onYearChange={setSelectedDate}
            displayWeekNumber
            showDaysOutsideCurrentMonth
            slots={{ day: fillCalendarDays }}
            
          />
        </CalendarContainer>
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
   * Fills the calendar days with on-call data
   *
   * @param props - Properties for rendering a calendar day
   */
  const fillCalendarDays = (props: PickersDayProps<DateTime>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const weekNumber = day.weekNumber;
    const onCallDayData = onCallByWeek.get(weekNumber);

    // Show badge only on the first day of the week
    const showBadge = day.weekday === 1 && onCallDayData;

    // If there is no username, showing "!"
    const hasUsername = !!onCallDayData?.username;
    const initials = hasUsername
      ? onCallDayData.username.split(" ").map(s => s[0]).join("").toUpperCase()
      : "!";

    const badgeColor = hasUsername
      ? stringToColor(onCallDayData.username)
      : "#d32f2f"; //Red color if there is no username

    const handleDayClick = () => {
      if (onCallDayData && isAccountant) {
        setSelectedOnCallWeek({
          date: day.toISODate(),
          username: onCallDayData.username,
          paid: onCallDayData.paid,
          badgeColor: stringToColor(onCallDayData.username)
        });
        setOpen(true);
      }
    };

    return (
      <Box sx={{ position: "relative" }}>
        {showBadge && (
          <Badge
            overlap="circular"
            badgeContent={initials}
            sx={{
              ".MuiBadge-badge": {
                backgroundColor: badgeColor,
                color: "#fff",
                right: 60,
                top: 10,
                minWidth: 24,
                minHeight: 24,
                fontSize: 12,
                border: "1px none #000",
                zIndex: 1,
                fontWeight: hasUsername ? "normal" : "bold"
              },
            }}
          >
            <StyledPickersDay
              {...other}
              day={day}
              outsideCurrentMonth={outsideCurrentMonth}
              sx={{
                ...(onCallDayData?.paid
                  ? { color: "#000", fontWeight: "bold", border: "2px solid #7bd15c" }
                  : {}),
                background: outsideCurrentMonth ? "#d1d0cf" : "#fff",
                cursor: "pointer",
              }}
              onClick={handleDayClick}
            />
          </Badge>
        )}
        {!showBadge && (
          <StyledPickersDay
            {...other}
            day={day}
            outsideCurrentMonth={outsideCurrentMonth}
            sx={{
              ...(onCallDayData?.paid
                ? { color: "#000", fontWeight: "bold", border: "2px solid #7bd15c" }
                : {}),
              background: outsideCurrentMonth ? "#d1d0cf" : "#fff",
              cursor: onCallDayData ? "pointer" : "default",
            }}
            onClick={handleDayClick}
          />
        )}
      </Box>
    );
  };

  const WEEK_NUMBER_WIDTH = 40; // width for week number column

  const DAY_WIDTH = 56; // width of each day cell in the calendar

  const StyledPickersDay = styled(PickersDay<DateTime>)(({ theme }) => ({
    width: DAY_WIDTH,
    height: DAY_WIDTH,
    fontSize: 18,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    margin: 2,
    "&.Mui-selected": {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    "&:hover": {
      border: `2px solid ${theme.palette.primary.light}`,
      background: theme.palette.action.hover,
    },
  }));

  const CalendarContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "auto",
    minWidth: WEEK_NUMBER_WIDTH + DAY_WIDTH * 7 + 80,
    maxWidth: WEEK_NUMBER_WIDTH + DAY_WIDTH * 7 + 80,
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: 16,
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    padding: theme.spacing(2),
    overflow: "auto",
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {/* Global styles for correct calendar layout */}
      <GlobalStyles styles={{
        // Container for the week
        ".MuiDayCalendar-weekContainer": {
          minHeight: DAY_WIDTH + 8,
        },
        // Root container for the day
        ".MuiDayCalendar-root": {
          minWidth: WEEK_NUMBER_WIDTH + DAY_WIDTH * 7 + 32,
          maxWidth: "none",
        },
        // Container for the days (to prevent clipping)
        ".MuiPickersSlideTransition-root": {
          minHeight: (DAY_WIDTH + 8) * 6,
          height: (DAY_WIDTH + 8) * 6,
        },
        // Container for the calendar
        ".MuiDateCalendar-root": {
          minWidth: WEEK_NUMBER_WIDTH + DAY_WIDTH * 7 + 32,
          maxWidth: "none",
          minHeight: (DAY_WIDTH + 8) * 6 + 120,
          height: (DAY_WIDTH + 8) * 6 + 120,
        },
        // Header for days of the week (Mon, Tue, ...)
        ".MuiDayCalendar-header": {
          minWidth: WEEK_NUMBER_WIDTH + DAY_WIDTH * 7 + 32,
          maxWidth: "none",
          display: "grid",
          gridTemplateColumns: `${WEEK_NUMBER_WIDTH}px repeat(7, ${DAY_WIDTH}px)`,
          marginLeft: 0,
          marginRight: 0,
        },
        // Cell with headers of days of the week
        ".MuiDayCalendar-weekDayLabel": {
          width: DAY_WIDTH,
          minWidth: DAY_WIDTH,
          maxWidth: DAY_WIDTH,
          fontSize: 16,
          textAlign: "center",
          padding: 0,
        },
        // Cell with week number
        ".MuiDayCalendar-weekNumberLabel": {
          width: WEEK_NUMBER_WIDTH,
          minWidth: WEEK_NUMBER_WIDTH,
          maxWidth: WEEK_NUMBER_WIDTH,
          fontSize: 14,
          textAlign: "center",
          padding: 0,
        },
        // Cell with week number
        ".MuiDayCalendar-weekNumber": {
          width: WEEK_NUMBER_WIDTH,
          minWidth: WEEK_NUMBER_WIDTH,
          maxWidth: WEEK_NUMBER_WIDTH,
          fontSize: 14,
          textAlign: "center",
          padding: 0,
        },
      }} />
      <FormControl sx={{ width: "50%", textAlign: "center", margin: "auto" }}>
        <InputLabel id="calendarSelect">{strings.oncall.selectView}</InputLabel>
        <Select
          labelId="calendarSelect"
          id="calendarSelect"
          label={strings.oncall.selectView}
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
      <OnCallPaidStatusDialog
        open={open}
        setOpen={setOpen}
        onCallEntry={selectedOnCallWeek}
        updatePaidStatus={updatePaidStatus}
      />
      {renderCurrentOnCall()}
      {renderCalendarOrList()}
    </Box>
  );
};

export default OnCallCalendarScreen;