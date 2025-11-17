import { ArrowBack, ArrowForward, CalendarToday } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
  Input,
  Tooltip as MuiTooltip,
  Typography
} from "@mui/material";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { languageAtom } from "src/atoms/language";
import { workDayAtom } from "src/atoms/workDay";
import type { Flextime, ListWorkdaysForUser, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { getSeveraUserId } from "src/utils/user-utils";
import {
  formatDate,
  getCurrentYearRange,
  getDayLabel,
  getMonthLabel,
  getNumberWeekLabel,
  getWeekEnd,
  getWeekStart,
  normalizeDate
} from "src/utils/workDay-utils";
import BackButton from "../generics/back-button";

/**
 * Represents aggregated chart data for rendering workday bars.
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

/** Keys for different range views */
type RangeKey = "week" | "month" | "year";

/** Available range keys */
const RANGE_KEYS: RangeKey[] = ["week", "month", "year"];

/** Y-axis domain configuration per range */
const YAXIS_DOMAIN: Record<RangeKey, [number, number]> = {
  week: [0, 12],
  month: [0, 60],
  year: [0, 240]
};

/**
 * Main component displaying the user's workday information and chart.
 */
const WorkDaysChart = ({
  selectedEmployee
}: {
  selectedEmployee: User | undefined;
}): JSX.Element => {
  const [selectedRange, setSelectedRange] = useState<RangeKey>("month");
  const [amountWeeks, setAmountWeeks] = useState<number>(4);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [usersFlextime, setUsersFlextime] = useState<Flextime>();
  const [loading, setLoading] = useState(false);
  const severaUserId = getSeveraUserId(selectedEmployee);
  const { flexTimeApi } = useLambdasApi();
  const { resourceAllocationsApi } = useLambdasApi();
  const [language] = useAtom(languageAtom);
  const locale = language === "fi" ? "fi-FI" : "en-US";
  const [workdays, setWorkdays] = useAtom(workDayAtom);

  useEffect(() => {
    if (!usersFlextime) {
      getUsersFlextimes();
    }
  }, [usersFlextime]);

  useEffect(() => {
    if (!severaUserId) return;
    fetchWorkdays();
  }, [severaUserId]);

  /**
   * Fetches the current user's flextime from the API.
   */
  const getUsersFlextimes = async () => {
    if (!severaUserId) return;
    try {
      const fetchedUsersFlextime = await flexTimeApi.getFlextimeBySeveraUserId({
        userId: severaUserId
      });
      setUsersFlextime(fetchedUsersFlextime);
    } catch (error) {
      console.error(error);
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
    if (!severaUserId) return;
    setLoading(true);

    const { startDate, endDate } = getCurrentYearRange();

    try {
      const result = await resourceAllocationsApi.listWorkdaysForUser({
        severaUserId: severaUserId,
        startDate,
        endDate
      });
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
      console.error("Failed to load work days:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renders the user's total flextime balance with proper color coding.
   */
  const renderUserFlextime = () => {
    if (
      !usersFlextime ||
      usersFlextime.totalFlextimeBalance === undefined ||
      usersFlextime.totalFlextimeBalance === null
    ) {
      return <Typography variant="h4">{strings.error.noFlextimeData}</Typography>;
    }

    const totalFlextimeBalance = usersFlextime.totalFlextimeBalance;
    const textColor = totalFlextimeBalance >= 0 ? "green" : "red";
    const hourLabel =
      totalFlextimeBalance === 1 ? strings.balanceCard.hour : strings.balanceCard.hours;

    return (
      <Typography variant="h4">
        {strings.balanceCard.totalFlextimeBalance}{" "}
        <span style={{ color: textColor }}>{totalFlextimeBalance}</span> {hourLabel}
      </Typography>
    );
  };

  /**
   * Aggregates timebank entries by week.
   * @param entries Array of WorkDayEntry
   * @returns ChartDataPoint array for the selected week
   */
  const getWeekData = (entries: ListWorkdaysForUser[]): ChartDataPoint[] => {
    const today = new Date();
    const currentWeekStart = getWeekStart(today);
    const targetWeekStart = new Date(currentWeekStart);
    targetWeekStart.setDate(currentWeekStart.getDate() + weekOffset * 7);
    const targetWeekEnd = getWeekEnd(targetWeekStart);

    const entryMap = new Map(entries.map((e) => [normalizeDate(e.date), e]));
    const weekDays: Date[] = [];

    for (let d = new Date(targetWeekStart); d <= targetWeekEnd; d.setDate(d.getDate() + 1)) {
      if (d.getDay() >= 1 && d.getDay() <= 5) weekDays.push(new Date(d));
    }

    return weekDays.map((d) => {
      const entry = entryMap.get(normalizeDate(d));
      return {
        period: getDayLabel(d, locale),
        hours: entry?.enteredHours || 0,
        expected: entry?.expectedHours || 0,
        isHoliday: entry?.isHoliday || false,
        holidayName: entry?.holidayName || null,
        week: getNumberWeekLabel(targetWeekStart),
        targetWeek: targetWeekStart
      };
    });
  };

  /**
   * Aggregates timebank entries by month for charting.
   * @param entries Array of WorkDayEntry
   * @returns ChartDataPoint array grouped by weeks in the month
   */
  const getMonthData = (entries: ListWorkdaysForUser[]): ChartDataPoint[] => {
    const referenceDate = entries.length
      ? new Date(Math.max(...entries.map((e) => new Date(e.date).getTime())))
      : new Date();

    const targetReference = new Date(referenceDate);
    targetReference.setMonth(referenceDate.getMonth() + monthOffset);

    const end = new Date(targetReference);
    const start = getWeekStart(end);
    start.setDate(start.getDate() - (amountWeeks - 1) * 7);

    const grouped: Record<string, { hours: number; expected: number }> = {};
    entries.forEach((e) => {
      const d = new Date(e.date);
      if (d >= start && d <= end) {
        const weekStart = formatDate(getWeekStart(d));
        if (!grouped[weekStart]) grouped[weekStart] = { hours: 0, expected: 0 };
        grouped[weekStart].hours += e.enteredHours;
        grouped[weekStart].expected += e.expectedHours;
      }
    });

    return Object.entries(grouped)
      .map(([period, values]) => {
        const weekDate = new Date(period);
        return {
          period: getNumberWeekLabel(weekDate),
          hours: values.hours,
          expected: values.expected,
          month: weekDate.toLocaleString(locale, { month: "long" })
        };
      })
      .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
  };

  /**
   * Aggregates timebank entries by month for the current year.
   * @param entries Array of WorkDayEntry
   * @returns ChartDataPoint array grouped by month
   */
  const getYearData = (entries: ListWorkdaysForUser[]): ChartDataPoint[] => {
    const year = new Date().getFullYear();
    const grouped: Record<number, { hours: number; expected: number }> = {};
    entries.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === year) {
        const month = d.getMonth();
        if (!grouped[month]) grouped[month] = { hours: 0, expected: 0 };
        grouped[month].hours += e.enteredHours;
        grouped[month].expected += e.expectedHours;
      }
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([month, values]) => ({
        period: getMonthLabel(new Date(year, Number(month)), locale),
        hours: values.hours,
        expected: values.expected
      }));
  };

  const chartData = useMemo<ChartDataPoint[]>(() => {
    switch (selectedRange) {
      case "week":
        return getWeekData(workdays);
      case "month":
        return getMonthData(workdays);
      case "year":
        return getYearData(workdays);
      default:
        return [];
    }
  }, [selectedRange, weekOffset, monthOffset, amountWeeks, strings.timeExpressions.week]);

  const handleWeekOffsetChange = useCallback((delta: number) => {
    setWeekOffset((prev) => prev + delta);
  }, []);

  const handleMonthOffsetChange = useCallback((delta: number) => {
    setMonthOffset((prev) => prev + delta);
  }, []);

  const getBarColor = (hours: number, expected: number) => {
    return hours >= expected ? "#4caf50" : "#f44336";
  };

  return (
    <>
      {/* BALANCE HEADER */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: -3, mt: 7, height: "75px" }}>
        {loading ? <CircularProgress /> : renderUserFlextime()}
      </Box>

      {/* RANGE CONTROLS */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "30px",
          position: "relative"
        }}
      >
        {/* WEEK CONTROLS */}
        {selectedRange === "week" && (
          <Box
            sx={{
              position: "absolute",
              left: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "250px"
            }}
          >
            <MuiTooltip
              placement="top"
              title={
                chartData[0]?.targetWeek
                  ? `${getNumberWeekLabel(chartData[0].targetWeek)}: ${formatDate(
                      getWeekStart(chartData[0].targetWeek)
                    )} → ${formatDate(getWeekEnd(chartData[0].targetWeek))}`
                  : strings.timeExpressions.week
              }
            >
              <Typography variant="h4">
                {chartData[0]?.week || strings.timeExpressions.week}
              </Typography>
            </MuiTooltip>
            <ButtonGroup sx={{ mt: 1 }}>
              <IconButton onClick={() => handleWeekOffsetChange(-1)}>
                <ArrowBack />
              </IconButton>
              <IconButton onClick={() => handleWeekOffsetChange(1)}>
                <ArrowForward />
              </IconButton>
              <IconButton onClick={() => setWeekOffset(0)}>
                <CalendarToday />
              </IconButton>
            </ButtonGroup>
          </Box>
        )}

        {/* MONTH CONTROLS */}
        {selectedRange === "month" && (
          <>
            <Box
              sx={{
                position: "absolute",
                right: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "200px"
              }}
            >
              <Typography variant="h4">{strings.timebank.numberOfWeeks}</Typography>
              <Input
                value={amountWeeks}
                onChange={(e) => setAmountWeeks(Number(e.target.value))}
                sx={{ width: 60, mt: 1 }}
                inputProps={{ step: 1, min: 1, max: 10, type: "number" }}
              />
            </Box>

            <Box
              sx={{
                position: "absolute",
                left: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "250px"
              }}
            >
              <Typography variant="h4">
                {`${strings.timeExpressions.month}: ${chartData[0]?.month || "-"}`}
              </Typography>
              <ButtonGroup sx={{ mt: 1 }}>
                <IconButton
                  disabled={monthOffset === -12 || Object.entries(chartData).length === 0}
                  onClick={() => handleMonthOffsetChange(-1)}
                >
                  <ArrowBack />
                </IconButton>
                <IconButton disabled={monthOffset === 0} onClick={() => handleMonthOffsetChange(1)}>
                  <ArrowForward />
                </IconButton>
                <IconButton onClick={() => setMonthOffset(0)}>
                  <CalendarToday />
                </IconButton>
              </ButtonGroup>
            </Box>
          </>
        )}

        {/* RANGE BUTTONS */}
        <ButtonGroup>
          {RANGE_KEYS.map((key) => (
            <Button
              key={key}
              variant={selectedRange === key ? "contained" : "outlined"}
              onClick={() => setSelectedRange(key)}
            >
              {strings.timeExpressions[key]}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* CHART */}
      <Box sx={{ width: "100%", height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tick={({ x, y, payload, index }) => {
                const dataPoint = chartData[index];
                const color = dataPoint?.isHoliday ? "#FF0000" : "#000";
                return (
                  <text x={x} y={y + 10} textAnchor="middle" fill={color} fontSize={14}>
                    {payload.value}
                    <title>{dataPoint.holidayName}</title>
                  </text>
                );
              }}
            />
            <YAxis domain={YAXIS_DOMAIN[selectedRange]} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataPoint;

                  return (
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        padding: "8px",
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {label}
                      </Typography>
                      {data.holidayName && (
                        <Typography variant="body2">
                          {strings.timebank.holidayName} {data.holidayName}
                        </Typography>
                      )}

                      {/* Actual and expected hours */}
                      <Typography variant="body2">
                        {strings.timebank.enteredHours}: {data.hours}
                      </Typography>
                      <Typography variant="body2">
                        {strings.timebank.expectedHours}: {data.expected}
                      </Typography>
                    </Box>
                  );
                }

                return null;
              }}
            />
            <Legend />
            <Bar
              dataKey="hours"
              name={strings.timebank.logged}
              isAnimationActive
              shape={(props: any) => {
                const { x, y, width, height, payload } = props;
                const color = getBarColor(payload.hours, payload.expected);
                return <rect x={x} y={y} width={width} height={height} fill={color} />;
              }}
            />
            <Line
              type="monotone"
              dataKey="expected"
              name={strings.timebank.expected}
              stroke="#000"
              strokeWidth={2}
              dot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>

      <BackButton />
    </>
  );
};

export default WorkDaysChart;
