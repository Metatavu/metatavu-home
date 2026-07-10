import { ChevronLeftRounded, ChevronRightRounded } from "@mui/icons-material";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { DateTime } from "luxon";
import type { Dispatch, SetStateAction } from "react";
import type { MockCalendar } from "./renderCalendar";

interface EventProps {
  event: MockCalendar;
  hourNow: number;
  pixels: number;
}

/**
 * Event component for calendar card.
 *
 * Renders events for selected day and calculates the placement
 * in the calendar timeline.
 * @param props.event - Calendar event
 * @param props.hourNow - Current hour as a number
 * @param props.pixels - Pixels per hour
 *
 * @returns Event component styled to match the theme.
 */
const Event = ({ event, hourNow, pixels }: EventProps) => {
  const theme = useTheme();
  const start = DateTime.fromISO(event.start.dateTime);
  const end = DateTime.fromISO(event.end.dateTime);
  const duration = end.diff(start, "minutes").minutes;
  const timing = `${start.toLocaleString(DateTime.TIME_24_SIMPLE)} - ${end.toLocaleString(DateTime.TIME_24_SIMPLE)}`;

  const height = duration * pixels;
  const position = ((start.hour - hourNow) * 60 + start.minute) * pixels;

  return (
    <Box
      position="absolute"
      height={height}
      display="flex"
      justifyContent="start"
      gap={theme.spaces.m}
      p={theme.spaces.m}
      alignItems="center"
      sx={{
        top: position,
        paddingX: theme.spaces.xxl,
        backgroundColor: "background.event",
        ml: theme.spaces.xxxl,
        borderRadius: theme.radius.s,
        overflow: "hidden"
      }}
    >
      <Typography variant="caption">{timing}</Typography>
      <Typography variant="body">{event.summary}</Typography>
    </Box>
  );
};

interface CalendarProps {
  pixelsPerMinute: number;
  timeNow: DateTime;
  hidden: boolean;
  calendarData: MockCalendar[];
}

/**
 * Component rendering the calendar time area.
 *
 * Shows 6.5 hour timeline from previous hour to 5.5 hours from now.
 * Includes times on the left and lines representing each hour.
 * @param props.pixelsPerMinute - Space that each minute takes in pixels
 * @param props.timeNow - Current time
 * @param props.hidden - Boolean indicating if card is hidden
 * @param props.calendarData - Data for the calendar, currently mock.
 *
 * @returns Time area of the calendar including calendar elements.
 */
export const CalendarTimeArea = ({
  pixelsPerMinute,
  timeNow,
  hidden,
  calendarData
}: CalendarProps) => {
  const theme = useTheme();
  const hourNow = timeNow.hour - 1;
  const dayHeight = 6.5 * 60 * pixelsPerMinute;

  return (
    <Box
      sx={{
        position: "relative",
        height: dayHeight,
        overflowY: "hidden",
        border: `${theme.borders.s} solid`,
        borderTop: 0,
        borderColor: theme.palette.border.subtle,
        borderBottomLeftRadius: theme.radius.s,
        borderBottomRightRadius: theme.radius.s
      }}
    >
      {Array.from({ length: 7 }, (_, i) => {
        const hour = hourNow + i;

        return (
          <Box
            key={hour}
            sx={{
              position: "absolute",
              top: i * 60 * pixelsPerMinute,
              left: 0,
              right: 20,
              display: "flex",
              alignItems: "flex-end"
            }}
          >
            <Typography
              variant="caption"
              sx={{ ml: theme.spaces.s, position: "absolute", top: pixelsPerMinute - 6.5 }}
            >
              {hour}.00
            </Typography>

            <Box
              sx={{
                flex: 1,
                ml: `${theme.spaces.xxxl}`,
                borderTop: `${theme.borders.xs} solid`,
                borderColor: theme.palette.border.subtle
              }}
            />
          </Box>
        );
      })}
      <CalendarElements
        pixelsPerMinute={pixelsPerMinute}
        timeNow={timeNow}
        hidden={hidden}
        calendarData={calendarData}
      />
    </Box>
  );
};

/**
 * Component responsible for calendar elements.
 *
 * Renders bar indicating current time as well as events.
 * @param props.pixelsPerMinute - Space that each minute takes in pixels
 * @param props.timeNow - Current time
 * @param props.hidden - Boolean indicating if card is hidden
 * @param props.calendarData - Data for the calendar, currently mock
 *
 * @returns elements for calendar and their positions on time area.
 */
const CalendarElements = ({ pixelsPerMinute, timeNow, hidden, calendarData }: CalendarProps) => {
  const theme = useTheme();
  const hourNow = timeNow.hour - 1;
  const nowTop = ((timeNow.hour - hourNow) * 60 + timeNow.minute) * pixelsPerMinute;
  const eventsToday = calendarData.filter(
    (event) => event.start.date === timeNow.toISODate()?.toString()
  );

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          top: nowTop,
          left: 50,
          right: 20,
          height: 2,
          bgcolor: hidden ? theme.palette.icons.disabled : theme.palette.border.accent,
          zIndex: 10
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: theme.radius.full,
            bgcolor: hidden ? theme.palette.icons.disabled : theme.palette.border.accent,
            left: -4,
            top: -3
          }}
        />
      </Box>
      {eventsToday?.map((event) => (
        <Event key={event.id} event={event} hourNow={hourNow} pixels={pixelsPerMinute} />
      ))}
    </>
  );
};

interface TopBarProps {
  hidden: boolean;
  timeNow: DateTime;
  setTimeNow: Dispatch<SetStateAction<DateTime>>;
}

/**
 * Component for calendar top bar.
 *
 * Has 5 days visible from ereyesterday to overmorrow and
 * arrow buttons to change the chosen day.
 *
 * @param props.hidden - Boolean indicating if card is hidden
 * @param props.timeNow - Current time
 * @param props.setTimeNow - SetState to change the chosen day
 *
 * @returns Styled component for the calendar top
 */
export const CalendarTopBar = ({ hidden, timeNow, setTimeNow }: TopBarProps) => {
  const theme = useTheme();
  const week = Array.from({ length: 5 }, (_, i) => timeNow.plus({ days: i - 2 }));
  const weekDays = week.map((day) => ({
    number: day.day,
    weekday: day.weekdayShort,
    today: day.hasSame(timeNow, "day")
  }));

  const colors = hidden
    ? {
        bg: theme.palette.background.event,
        accent: theme.palette.background.disabled,
        text: theme.palette.text.disabled
      }
    : {
        bg: theme.palette.background.accentSecondary,
        accent: theme.palette.background.selected,
        text: theme.palette.text.accent
      };

  return (
    <Box
      sx={{
        backgroundColor: colors.bg,
        border: `${theme.borders.s} solid`,
        borderColor: theme.palette.border.subtle,
        borderBottom: 0,
        borderRadius: `${theme.radius.s} ${theme.radius.s} 0px 0px`,
        py: theme.spaces.m,
        pl: theme.spaces.s,
        mt: theme.spaces.m
      }}
    >
      {timeNow.monthLong}
      <Box display="flex">
        <Button
          startIcon={<ChevronLeftRounded sx={{ color: theme.palette.icons.primary }} />}
          onClick={() => handleDayChange("back", setTimeNow)}
        />
        {weekDays.map((day) => (
          <Box key={day.number} display="flex" flex={1} justifyContent="center">
            <Box
              sx={{
                backgroundColor: day.today ? colors.accent : "transparent",
                color: day.today ? colors.text : "inherit",
                fontStyle: theme.typography.body,
                fontWeight: 700,
                border: 0,
                borderRadius: theme.radius.s,
                textAlign: "center",
                p: theme.spaces.s
              }}
            >
              {day.number}
              <Box sx={{ fontWeight: 400 }}>{day.weekday}</Box>
            </Box>
          </Box>
        ))}
        <Button
          startIcon={<ChevronRightRounded sx={{ color: theme.palette.icons.primary }} />}
          onClick={() => handleDayChange("forward", setTimeNow)}
        />
      </Box>
    </Box>
  );
};

type DayAction = "back" | "forward";

/**
 * Changes the day chosen
 *
 * @param action - Indicates which button user pressed
 * @param setTimeNow - SetState to change the chosen day
 */
const handleDayChange = (action: DayAction, setTimeNow: Dispatch<SetStateAction<DateTime>>) => {
  setTimeNow((current) =>
    action === "back" ? current.minus({ days: 1 }) : current.plus({ days: 1 })
  );
};
