import {
  Badge,
  Box,
  CircularProgress,
  FormControl,
  GlobalStyles,
  InputLabel,
  MenuItem,
  Select,
  styled,
  Tooltip,
  Typography
} from "@mui/material";
import { red } from "@mui/material/colors";
import { DateCalendar, PickersDay, type PickersDayProps } from "@mui/x-date-pickers";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useId, useMemo, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import type { OnCallPaid } from "src/generated/homeLambdasClient";
import type { OnCall } from "src/generated/homeLambdasClient/models/OnCall";
import useUserRole from "src/hooks/use-user-role";
import { errorAtom } from "../../atoms/error";
import { onCallAtom } from "../../atoms/oncall";
import { useLambdasApi } from "../../hooks/use-api";
import strings from "../../localization/strings";
import type { OnCallWeek } from "../../types";
import { stringToColor } from "../../utils/oncall-utils";
import OnCallListView from "../onCall/oncall-list-view";
import OnCallPaidStatusDialog from "../onCall/oncall-paid-status-dialog";

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
  const [onCallPerson, setOnCallPerson] = useState<string | undefined>(undefined);
  const [selectedOnCallWeek, setSelectedOnCallWeek] = useState<OnCallWeek>();
  const { isAccountant } = useUserRole();
  const setError = useSetAtom(errorAtom);
  const [loading, setLoading] = useState(false);
  const userProfile = useAtomValue(userProfileAtom);

  useEffect(() => {
    getOnCallData(selectedDate.year);
  }, [selectedDate.year]);

  useEffect(() => {
    getCurrentOnCallPerson();
  }, []);

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
      if (!(error instanceof SyntaxError)) {
        setError(`${strings.oncall.fetchFailed} ${error}`);
      }
      setOnCallData([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finds the current on call employee and sets them in a state
   */
  const getCurrentOnCallPerson = async () => {
    const currentYear = DateTime.now().year;
    const currentWeek = DateTime.now().weekNumber;
    try {
      const fetchedData = await onCallApi.listOnCallData({ year: currentYear.toString() });
      const currentOnCallPerson = fetchedData.find((item) => item.week === currentWeek)?.username;
      setOnCallPerson(currentOnCallPerson ?? undefined);
    } catch (error) {
      setError(`${strings.oncall.fetchFailed} ${error}`);
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
      setOnCallData((prev) =>
        prev.map((item) =>
          item.year === year && item.week === weekNumber ? { ...item, paid: !paid } : item
        )
      );
    } catch (error) {
      setError(`${strings.oncall.errorUpdatingPaidStatus}, ${error}`);
    }
  };

  /**
   * Formats the returned string for oncall person
   */
  const formatOnCallPerson = (username: string | null) => {
    if (!username) return "";
    return username
      .replace(/\./g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /**
   * Renders the current week's on call person if they exist
   */
  const renderCurrentOnCall = () => {
    return (
      <Box
        sx={{
          display: "inline-block",
          backgroundColor: "#f5f5f5",
          color: "#191970",
          borderRadius: 4,
          px: 3,
          py: 2,
          textAlign: "center",
          mx: "auto",
          mb: 3,
          mt: 3,
          maxWidth: 600
        }}
      >
        {onCallPerson === undefined ? (
          <CircularProgress sx={{ color: "black" }} />
        ) : onCallPerson ? (
          <>
            <Typography
              variant="h5"
              sx={{
                display: "block",
                mb: 1,
                fontWeight: "bold",
                color: "#191970"
              }}
            >
              {strings.oncall.onCallPersonExists}
            </Typography>
            <Typography
              variant="h5"
              sx={{ display: "block", color: "#191970", fontWeight: "bold" }}
            >
              {formatOnCallPerson(onCallPerson)}
            </Typography>
          </>
        ) : (
          <Typography variant="h5" sx={{ display: "block", color: red[700], fontWeight: "bold" }}>
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
    const isCurrentOnCallPerson = onCallDayData?.username === onCallPerson;

    // Show badge only on the first day of the week
    const showBadge = day.weekday === 1 && onCallDayData;

    // If there is no username, showing "!"
    const hasUsername = !!onCallDayData?.username;
    const initials = hasUsername
      ? onCallDayData.username
          .split(" ")
          .map((s) => s[0])
          .join("")
          .toUpperCase()
      : "!";

    const badgeColor = hasUsername ? stringToColor(onCallDayData.username) : "#d32f2f"; //Red color if there is no username

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

    /**
     * TODO:
     * Change so that highlighting is available to logged in user matching on-call user.
     */
    const isCurrentUserOnCall = onCallDayData?.username === userProfile?.username;

    return (
      <Box sx={{ position: "relative" }}>
        {showBadge && (
          <Tooltip title={onCallDayData?.username}>
            <Badge
              overlap="circular"
              badgeContent={initials}
              sx={{
                ".MuiBadge-badge": {
                  backgroundColor: isCurrentUserOnCall ? "#ff9800" : badgeColor,
                  color: "#fff",
                  right: 60,
                  top: 10,
                  minWidth: 24,
                  minHeight: 24,
                  fontSize: 12,
                  zIndex: 1,
                  fontWeight: isCurrentUserOnCall ? "900" : "normal",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  ...(isCurrentOnCallPerson && {
                    animation: "pulse 1.5s ease-in-out 2"
                  })
                },
                "@keyframes pulse": {
                  "0%": { transform: "scale(1)", opacity: 1 },
                  "50%": { transform: "scale(1.1)", opacity: 0.7 },
                  "100%": { transform: "scale(1)", opacity: 1 }
                }
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
                  cursor: "pointer"
                }}
                onClick={handleDayClick}
              />
            </Badge>
          </Tooltip>
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
              cursor: onCallDayData ? "pointer" : "default"
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
      border: `2px solid ${theme.palette.primary.main}`
    },
    "&:hover": {
      border: `2px solid ${theme.palette.primary.light}`,
      background: theme.palette.action.hover
    }
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
    overflow: "auto"
  }));

  const calendarSelectId = useId();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {/* Global styles for correct calendar layout */}
      <GlobalStyles
        styles={{
          // Container for the week
          ".MuiDayCalendar-weekContainer": {
            minHeight: DAY_WIDTH + 8
          },
          // Root container for the day
          ".MuiDayCalendar-root": {
            minWidth: WEEK_NUMBER_WIDTH + DAY_WIDTH * 7 + 32,
            maxWidth: "none"
          },
          // Container for the days (to prevent clipping)
          ".MuiPickersSlideTransition-root": {
            minHeight: (DAY_WIDTH + 8) * 6,
            height: (DAY_WIDTH + 8) * 6
          },
          // Container for the calendar
          ".MuiDateCalendar-root": {
            minWidth: WEEK_NUMBER_WIDTH + DAY_WIDTH * 7 + 32,
            maxWidth: "none",
            minHeight: (DAY_WIDTH + 8) * 6 + 120,
            height: (DAY_WIDTH + 8) * 6 + 120
          },
          // Header for days of the week (Mon, Tue, ...)
          ".MuiDayCalendar-header": {
            minWidth: WEEK_NUMBER_WIDTH + DAY_WIDTH * 7 + 32,
            maxWidth: "none",
            display: "grid",
            gridTemplateColumns: `${WEEK_NUMBER_WIDTH}px repeat(7, ${DAY_WIDTH}px)`,
            marginLeft: 0,
            marginRight: 0
          },
          // Cell with headers of days of the week
          ".MuiDayCalendar-weekDayLabel": {
            width: DAY_WIDTH,
            minWidth: DAY_WIDTH,
            maxWidth: DAY_WIDTH,
            fontSize: 16,
            textAlign: "center",
            padding: 0
          },
          // Cell with week number
          ".MuiDayCalendar-weekNumberLabel": {
            width: WEEK_NUMBER_WIDTH,
            minWidth: WEEK_NUMBER_WIDTH,
            maxWidth: WEEK_NUMBER_WIDTH,
            fontSize: 14,
            textAlign: "center",
            padding: 0
          },
          // Cell with week number
          ".MuiDayCalendar-weekNumber": {
            width: WEEK_NUMBER_WIDTH,
            minWidth: WEEK_NUMBER_WIDTH,
            maxWidth: WEEK_NUMBER_WIDTH,
            fontSize: 14,
            textAlign: "center",
            padding: 0
          }
        }}
      />
      <FormControl sx={{ width: "50%", textAlign: "center", margin: "auto" }}>
        <InputLabel id={calendarSelectId}>{strings.oncall.selectView}</InputLabel>
        <Select
          labelId={calendarSelectId}
          id={`${calendarSelectId}-select`}
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
