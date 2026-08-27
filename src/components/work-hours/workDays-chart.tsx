import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
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
import PeriodNavigator from "./period-navigator";
import RangeTypeSelector from "./range-type-selector";
import WorkDaysRechart from "./workDays-rechart-components";

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

type RangeKey = "week" | "month" | "year";

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
  const theme = useTheme();
  const [selectedRange, setSelectedRange] = useState<RangeKey>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);
  const [usersFlextime, setUsersFlextime] = useState<Flextime>();
  const [loading, setLoading] = useState(false);
  const setError = useSetAtom(errorAtom);
  const [workdays, setWorkdays] = useAtom(workDayAtom);
  const [language] = useAtom(languageAtom);
  const locale = language === "fi" ? "fi-FI" : "en-US";

  const severaUserId = getSeveraUserId(selectedEmployee);
  const { flexTimeApi, workDaysApi } = useLambdasApi();

  useEffect(() => {
    if (!severaUserId) return;
    fetchFlextime();
    // biome(suppressions/react-hooks/exhaustive-deps)
  }, [severaUserId]);

  useEffect(() => {
    if (!severaUserId) return;
    fetchWorkdays();
    // biome(suppressions/react-hooks/exhaustive-deps)
  }, [severaUserId]);

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
    } catch (error: any) {
      const errorMessage = await error.response.json();
      setError(`${strings.error.fetchFailedFlextime}: ${errorMessage.message}`);
    }
  };

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
        return getYearData(workdays, locale, yearOffset);
      default:
        return [];
    }
  }, [workdays, selectedRange, weekOffset, monthOffset, yearOffset, locale]);

  const handleWeekOffsetChange = useCallback(
    (delta: number) => setWeekOffset((prev) => prev + delta),
    []
  );
  const handleMonthOffsetChange = useCallback(
    (delta: number) => setMonthOffset((prev) => prev + delta),
    []
  );
  const handleYearOffsetChange = useCallback(
    (delta: number) => setYearOffset((prev) => prev + delta),
    []
  );

  const getBarColor = () => theme.palette.chart.primary;

  const renderUserFlextime = () => {
  if (!usersFlextime?.totalFlextimeBalance && usersFlextime?.totalFlextimeBalance !== 0) {
    return <Typography variant="h4">{strings.error.noFlextimeData}</Typography>;
  }
  const balance = usersFlextime.totalFlextimeBalance;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.accentSecondary,
        border: `${theme.borders.s} solid`,
        borderColor: theme.palette.border.subtle,
        borderRadius: theme.radius.s,
        paddingBlock: theme.spaces.m,
        paddingInline: theme.spaces.xl,
        textAlign: "center"
      }}
    >
      <Typography variant="body">{strings.balanceCard.totalFlextimeBalance}</Typography>
      <Typography variant="h3" sx={{ mt: theme.spaces.xs }}>
        {balance >= 0 ? "+" : ""}
        {balance}h
      </Typography>
      <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
        {strings.balanceCard.atTheEndOf.replace("{0}", new Date().toLocaleDateString(locale))}
      </Typography>
    </Box>
  );
};

  const periodLabel = (() => {
    if (selectedRange === "week") return chartData[0]?.week ?? "";
    if (selectedRange === "month") return chartData[0]?.month ?? "";
    return String(new Date().getFullYear() + yearOffset);
  })();

  const handlePrevious = () => {
    if (selectedRange === "week") handleWeekOffsetChange(-1);
    else if (selectedRange === "month") handleMonthOffsetChange(-1);
    else handleYearOffsetChange(-1);
  };

  const handleNext = () => {
    if (selectedRange === "week") handleWeekOffsetChange(1);
    else if (selectedRange === "month") handleMonthOffsetChange(1);
    else handleYearOffsetChange(1);
  };

  const nextDisabled =
    selectedRange === "week"
      ? weekOffset === 0
      : selectedRange === "month"
        ? monthOffset === 0
        : yearOffset === 0;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 7, mb: theme.spaces.l }}>
        {loading ? <CircularProgress /> : renderUserFlextime()}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: theme.spaces.l }}>
        <RangeTypeSelector selectedRange={selectedRange} onChange={setSelectedRange} />
      </Box>

      <WorkDaysRechart
        chartData={chartData}
        selectedRange={selectedRange}
        getBarColor={getBarColor}
        strings={strings}
        YAXIS_DOMAIN={YAXIS_DOMAIN}
      />

      <Box sx={{ display: "flex", justifyContent: "center", mt: theme.spaces.l }}>
        <PeriodNavigator
          label={periodLabel}
          onPrevious={handlePrevious}
          onNext={handleNext}
          nextDisabled={nextDisabled}
        />
      </Box>
    </>
  );
};

export default WorkDaysChart;