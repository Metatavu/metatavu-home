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
  Typography,
  useTheme
} from "@mui/material";

import { DateCalendar, PickersDay, type PickersDayProps } from "@mui/x-date-pickers";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useId, useMemo, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import type { OnCallPaid } from "src/generated/homeLambdasClient";
import type { OnCall } from "src/generated/homeLambdasClient/models/OnCall";
import useUserRole from "src/hooks/use-user-role";
import { customTheme } from "src/theme";
import { errorAtom } from "../../atoms/error";
import { onCallAtom } from "../../atoms/oncall";
import { useLambdasApi } from "../../hooks/use-api";
import strings from "../../localization/strings";
import type { OnCallWeek } from "../../types";
import { formatUsername, stringToColor } from "../../utils/oncall-utils";
import BackButton from "../generics/back-button";
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
  const calendarSelectId = useId();
  const endOfCurrentWeek = DateTime.now().endOf("week");

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
  const theme = useTheme();
  /**
   * Renders the current week's on call person if they exist
   */
  const renderCurrentOnCall = () => {
    if (onCallPerson === undefined) {
      return (
        <Box sx={customTheme(theme).customStyles.onCallBox}>
          <CircularProgress sx={{ color: theme.palette.text.primary }} />
        </Box>
      );
    }

    if (onCallPerson) {
      return (
        <Box sx={customTheme(theme).customStyles.onCallBox}>
          <Typography
            variant="h5"
            sx={{ display: "block", mb: 1, fontWeight: "bold", color: theme.palette.text.primary }}
          >
            {strings.oncall.onCallPersonExists}
          </Typography>
          <Typography
            variant="h5"
            sx={{ display: "block", color: theme.palette.text.primary, fontWeight: "bold" }}
          >
            {formatUsername(onCallPerson)}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={customTheme(theme).customStyles.onCallBox}>
        <Typography
          variant="h5"
          sx={{ display: "block", color: theme.palette.error.main, fontWeight: "bold" }}
        >
          {strings.oncall.noOnCallPerson}
        </Typography>
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
            onMonthChange={(date) => {
              if (date.valueOf() > endOfCurrentWeek.valueOf()) return;
              setSelectedDate(date);
            }}
            onYearChange={(date) => {
              if (date.valueOf() > endOfCurrentWeek.valueOf()) return;
              setSelectedDate(date);
            }}
            displayWeekNumber
            showDaysOutsideCurrentMonth
            slots={{ day: fillCalendarDays }}
            maxDate={endOfCurrentWeek}
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
    const whenUserIsOnCall = onCallDayData?.email === userProfile?.email;

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

    const badgeColor = hasUsername
      ? stringToColor(onCallDayData.username)
      : theme.palette.error.main; //Red color if there is no username

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
          <Tooltip title={formatUsername(onCallDayData?.username)}>
            <Badge
              overlap="circular"
              badgeContent={initials}
              sx={{
                ".MuiBadge-badge": {
                  backgroundColor: whenUserIsOnCall
                    ? customTheme(theme).colors.onCallHighlight
                    : badgeColor,
                  color: theme.palette.getContrastText(
                    whenUserIsOnCall ? customTheme(theme).colors.onCallHighlight : badgeColor
                  ),
                  right: 60,
                  top: 10,
                  minWidth: 24,
                  minHeight: 24,
                  fontSize: 12,
                  zIndex: 1,
                  fontWeight: whenUserIsOnCall ? "900" : "normal",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  overflow: "visible",
                  ...(whenUserIsOnCall && {
                    animation: "pulseGlow 1.5s ease-in-out 4"
                  })
                },
                "@keyframes pulseGlow": {
                  "0%": {
                    boxShadow: "0 0 0 0 rgba(150, 96, 15, 0.7)"
                  },
                  "70%": {
                    boxShadow: "0 0 0 8px rgba(255, 152, 0, 0)"
                  },
                  "100%": {
                    boxShadow: "0 0 0 0 rgba(255, 152, 0, 0)"
                  }
                }
              }}
            >
              <StyledPickersDay
                {...other}
                day={day}
                outsideCurrentMonth={outsideCurrentMonth}
                selected={false}
                sx={{
                  ...(onCallDayData?.paid
                    ? {
                        color: theme.palette.text.primary,
                        fontWeight: "bold",
                        border: `2px solid ${customTheme(theme).colors.paidGreen}`
                      }
                    : {}),
                  background: outsideCurrentMonth
                    ? theme.palette.action.disabledBackground
                    : theme.palette.background.paper,
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
            selected={false}
            sx={{
              ...(onCallDayData?.paid
                ? {
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                    border: `2px solid ${customTheme(theme).colors.paidGreen}`
                  }
                : {}),
              background: outsideCurrentMonth
                ? theme.palette.action.disabledBackground
                : theme.palette.background.paper,
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
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    "&:hover": {
      border: `2px solid ${theme.palette.primary.main}`,
      background: theme.palette.action.hover
    }
  }));

  const CalendarContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "auto",
    marginBottom: 30,
    minWidth: WEEK_NUMBER_WIDTH + DAY_WIDTH * 7 + 80,
    maxWidth: WEEK_NUMBER_WIDTH + DAY_WIDTH * 7 + 80,
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: 16,
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    padding: theme.spacing(2),
    overflow: "auto"
  }));

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
            minHeight: (DAY_WIDTH + 8) * 6 + 50,
            height: (DAY_WIDTH + 8) * 6 + 50,
            marginBottom: 3
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
      <FormControl
        sx={{
          width: "50%",
          textAlign: "center",
          margin: "auto",
          "& .MuiInputLabel-root": { color: theme.palette.text.primary }
        }}
      >
        <InputLabel id={calendarSelectId}>{strings.oncall.selectView}</InputLabel>
        <Select
          sx={{
            color: theme.palette.text.primary,
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.divider
            }
          }}
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
      <BackButton
        styles={
          isCalendarView
            ? {
                width: "50%",
                textAlign: "center",
                margin: "auto"
              }
            : {
                mb: 2
              }
        }
      />
    </Box>
  );
};

export default OnCallCalendarScreen;
