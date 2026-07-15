import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import type { CardVisibilityProps } from "src/components/generics/homepageCard";
import { ScheduleTimeArea, ScheduleTopBar } from "./scheduleContent";

/**
 * TODO: Delete when real data is implemented
 */
export interface MockCalendar {
  id: string;
  summary: string;
  start: {
    date: string;
    dateTime: string;
  };
  end: {
    date: string;
    dateTime: string;
  };
}

/**TODO: This component uses mockdata now. When backend for google
 * calendar API is implemented, this should be edited to use actual data.
 *
 * Renders Calendar for schedule card component.
 *
 * @param props.hidden - Boolean indicating if card is hidden
 * @returns Calendar day view for schedule card with ineractive buttons to change date
 */
export const RenderSchedule = ({ hidden }: CardVisibilityProps) => {
  const [timeNow, setTimeNow] = useState(DateTime.now());
  const today = DateTime.now();
  const yesterday = today.minus({ days: 1 });
  const tomorrow = today.plus({ days: 1 });

  const PIXELS_PER_MINUTE = 0.7;
  const UPDATE_INTERVAL = 15 * 60 * 1000;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(DateTime.now());
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const calendarData: MockCalendar[] = [
    {
      id: "1234",
      summary: "Meeting 1",
      start: {
        date: yesterday.toISODate().toString(),
        dateTime: `${yesterday.toISODate()}T12:00:00.869+03:00`
      },
      end: {
        date: yesterday.toISODate().toString(),
        dateTime: `${yesterday.toISODate()}T13:00:00.869+03:00`
      }
    },
    {
      id: "4321",
      summary: "Meeting 2",
      start: {
        date: yesterday.toISODate().toString(),
        dateTime: `${yesterday.toISODate()}T14:00:00.869+03:00`
      },
      end: {
        date: yesterday.toISODate().toString(),
        dateTime: `${yesterday.toISODate()}T15:20:00.869+03:00`
      }
    },
    {
      id: "0987",
      summary: "Meeting 3",
      start: {
        date: today.toISODate().toString(),
        dateTime: `${today.toISODate()}T13:20:00.869+03:00`
      },
      end: {
        date: today.toISODate().toString(),
        dateTime: `${today.toISODate()}T14:20:00.869+03:00`
      }
    },
    {
      id: "7890",
      summary: "Meeting 4",
      start: {
        date: tomorrow.toISODate().toString(),
        dateTime: `${tomorrow.toISODate()}T13:12:00.869+03:00`
      },
      end: {
        date: tomorrow.toISODate().toString(),
        dateTime: `${tomorrow.toISODate()}T14:20:00.869+03:00`
      }
    }
  ];
  return (
    <>
      <ScheduleTopBar hidden={hidden} timeNow={timeNow} setTimeNow={setTimeNow} />
      <ScheduleTimeArea
        hidden={hidden}
        timeNow={timeNow}
        pixelsPerMinute={PIXELS_PER_MINUTE}
        calendarData={calendarData}
      />
    </>
  );
};
