import { Box, CircularProgress, Typography } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { errorAtom } from "src/atoms/error";
import { languageAtom } from "src/atoms/language";
import { workDayAtom } from "src/atoms/workDay";
import type { Flextime, ListWorkdaysForUser, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { getSeveraUserId } from "src/utils/user-utils";
import {
  getCurrentYearRange,
  getMonthData,
  getWeekData,
  getYearData
} from "src/utils/workDay-utils";
import BackButton from "../generics/back-button";
import RangeControls from "./range-controls";
import WorkDaysRechart from "./workDays-rechart-components";

/**
 * Data point structure for the work days chart
 */
export interface ChartDataPoint {
  period: string;
  hours: number;
  expected: number;
  isHoliday?: boolean;
  holidayName?: string | null;
  week?: string;
  month?: string;
  targetWeek?: Date;
}

/**
 * Range key type definition
 */
type RangeKey = "week" | "month" | "year";

/**
 * Y-axis domain settings for different range selections
 */
const YAXIS_DOMAIN: Record<RangeKey, [number, number]> = {
  week: [0, 12],
  month: [0, 60],
  year: [0, 240]
};

/** 
 * Work days chart component
 * 
 * @param selectedEmployee - The employee whose work days are to be displayed

 */
const WorkDaysChart = ({ selectedEmployee }: { selectedEmployee?: User }) => {
  const [selectedRange, setSelectedRange] = useState<RangeKey>("month");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [usersFlextime, setUsersFlextime] = useState<Flextime>();
  const [loading, setLoading] = useState(false);
  const setError = useSetAtom(errorAtom);
  const [workdays, setWorkdays] = useAtom(workDayAtom);
  const [language] = useAtom(languageAtom);
  const locale = language === "fi" ? "fi-FI" : "en-US";
  const resetWeekOffset = useCallback(() => setWeekOffset(0), []);
  const resetMonthOffset = useCallback(() => setMonthOffset(0), []);

  const severaUserId = getSeveraUserId(selectedEmployee);
  const { flexTimeApi, workDaysApi } = useLambdasApi();

  useEffect(() => {
    if (!severaUserId) return;
    fetchFlextime();
    // biome(suppressions/react-hooks/exhaustive-deps)
    // fetchFlextime is intentionally omitted from dependencies to avoid redefining on every render
  }, [severaUserId]);

  useEffect(() => {
    if (!severaUserId) return;
    fetchWorkdays();
    // biome(suppressions/react-hooks/exhaustive-deps)
    // fetchWorkdays is intentionally omitted from dependencies to avoid redefining on every render
  }, [severaUserId]);

  /**
   * Fetches the current user's flextime from the API.
   */
  const fetchFlextime = async () => {
    try {
      setLoading(true);
      const data = await flexTimeApi.getFlextimeBySeveraUserId({ userId: severaUserId });
      setUsersFlextime(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches workdays for the current user from the API.
   *
   * @returns Returns Array of workday entries for current year's worth of data.
   */
  const fetchWorkdays = async () => {
    const { startDate, endDate } = getCurrentYearRange();
    try {
      const result = await workDaysApi.listWorkdaysForUser({ severaUserId, startDate, endDate });
      const mapped: ListWorkdaysForUser[] = result.map((w) => ({
        date: w.date,
        userGuid: w.userGuid,
        enteredHours: w.enteredHours ?? 0,
        expectedHours: w.expectedHours ?? 0,
        isHoliday: w.isHoliday ?? false,
        holidayName: w.holidayName ?? null
      }));
      setWorkdays(mapped);
    } catch (err) {
      setError(`${strings.error.fetchWorkDaysFailed}, ${err}`);
    }
  };

  /**
   *  Memoized computation of chart data based on selected range and offsets.
   *
   * @returns Array of ChartDataPoint objects for the chart.
   */
  const chartData: ChartDataPoint[] = useMemo(() => {
    const today = new Date();
    const selectedDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const targetMonth = selectedDate.getMonth();
    const targetYear = selectedDate.getFullYear();

    switch (selectedRange) {
      case "week":
        return getWeekData(workdays, weekOffset, locale);
      case "month":
        return getMonthData(workdays, targetMonth, targetYear, locale);
      case "year":
        return getYearData(workdays, locale);
      default:
        return [];
    }
  }, [workdays, selectedRange, weekOffset, monthOffset, locale]);

  /**
   * Handles changes to the week offset for week range selection.
   *
   * @param delta - The change in week offset (positive or negative).
   */
  const handleWeekOffsetChange = useCallback(
    (delta: number) => setWeekOffset((prev) => prev + delta),
    []
  );

  /**
   * Handles changes to the month offset for month range selection.
   *
   * @param delta - The change in month offset (positive or negative).
   */
  const handleMonthOffsetChange = useCallback(
    (delta: number) => setMonthOffset((prev) => prev + delta),
    []
  );

  /**
   * Determines the color of the bars in the chart based on hours entered vs expected.
   *
   * @param hours - The number of hours entered.
   * @param expected - The number of expected hours.
   * @returns A string representing the color code for the bar.
   */
  const getBarColor = (hours: number, expected: number) =>
    hours >= expected ? "#4caf50" : "#f44336";

  /**
   * Renders the user's total flextime balance with proper color coding.
   */
  const renderUserFlextime = () => {
    if (!usersFlextime?.totalFlextimeBalance && usersFlextime?.totalFlextimeBalance !== 0) {
      return <Typography variant="h4">{strings.error.noFlextimeData}</Typography>;
    }
    const balance = usersFlextime.totalFlextimeBalance;
    return (
      <Typography variant="h4">
        {strings.balanceCard.totalFlextimeBalance}{" "}
        <Box component="span" sx={{ color: balance >= 0 ? "green" : "red" }}>
          {balance}
        </Box>{" "}
        <Box component="span" ml={1}>
          {balance === 1 ? strings.timeExpressions.hour : strings.timeExpressions.hours}
        </Box>
      </Typography>
    );
  };

  return (
    <>
      {/* Flextime balance header */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: -3, mt: 7, height: "75px" }}>
        {loading ? <CircularProgress /> : renderUserFlextime()}
      </Box>

      {/* Range controls */}
      <RangeControls
        selectedRange={selectedRange}
        chartData={chartData}
        weekOffset={weekOffset}
        monthOffset={monthOffset}
        onWeekOffsetChange={handleWeekOffsetChange}
        onMonthOffsetChange={handleMonthOffsetChange}
        setSelectedRange={setSelectedRange}
        strings={strings}
        resetWeekOffset={resetWeekOffset}
        resetMonthOffset={resetMonthOffset}
      />

      {/* Chart */}
      <WorkDaysRechart
        chartData={chartData}
        selectedRange={selectedRange}
        getBarColor={getBarColor}
        strings={strings}
        YAXIS_DOMAIN={YAXIS_DOMAIN}
      />

      <BackButton />
    </>
  );
};

export default WorkDaysChart;
