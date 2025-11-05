import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Input,
  CircularProgress,
  Typography
} from "@mui/material";
import { ArrowBack, ArrowForward, CalendarToday } from "@mui/icons-material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useMemo, useState, useCallback, useEffect } from "react";
import strings from "src/localization/strings";
import { employeeMockData } from "./mockdata";
import BackButton from "../generics/back-button";
import {
  formatDate,
  getDayLabel,
  getMonthLabel,
  getWeekEnd,
  getWeekLabel,
  getWeekStart
} from "src/utils/timeBank-utils";
import { useAtomValue } from "jotai";
import { usersAtom } from "src/atoms/user";
import { userProfileAtom } from "src/atoms/auth";
import type { Flextime, User } from "src/generated/homeLambdasClient";
import { getSeveraUserId } from "src/utils/user-utils";
import { useLambdasApi } from "src/hooks/use-api";

export interface TimebankEntry {
  date: string;
  enteredHours: number;
  expectedHours: number;
  isHoliday?: boolean;
  holidayName?: string | null;
}

export interface ChartDataPoint {
  period: string;
  hours: number;
  expected: number;
  isHoliday?: boolean;
  holidayName?: string | null;
  week?: string;
  month?: string;
}

// Stable keys for ranges
type RangeKey = "week" | "month" | "year";
const RANGE_KEYS: RangeKey[] = ["week", "month", "year"];

// Localized labels for display only
const RANGE_LABELS: Record<RangeKey, string> = {
  week: strings.timeExpressions.week,
  month: strings.timeExpressions.month,
  year: strings.timeExpressions.year
};

// Expected hours constants
const EXPECTED_HOURS: Record<RangeKey, number> = {
  week: 7.25,
  month: 36.25,
  year: 145
};

// Y-axis domain constants
const YAXIS_DOMAIN: Record<RangeKey, [number, number]> = {
  week: [0, 12],
  month: [0, 60],
  year: [0, 240]
};

const TimebankContent: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<RangeKey>("month");
  const [amountWeeks, setAmountWeeks] = useState<number>(4);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [usersFlextime, setUsersFlextime] = useState<Flextime>();
  const [loading, setLoading] = useState<Boolean>(true);
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const severaUserId = getSeveraUserId(loggedInUser);
  const { flexTimeApi } = useLambdasApi();

  useEffect(() => {
    if (!usersFlextime) {
      getUsersFlextimes();
    }
  }, [users, userProfile, usersFlextime]);

  const getUsersFlextimes = async () => {
    if (!loggedInUser || !severaUserId) return;
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

  const getWeekData = (entries: TimebankEntry[]): ChartDataPoint[] => {
    const today = new Date();
    const currentWeekStart = getWeekStart(today);
    const targetWeekStart = new Date(currentWeekStart);
    targetWeekStart.setDate(currentWeekStart.getDate() + weekOffset * 7);
    const targetWeekEnd = getWeekEnd(targetWeekStart);

    const entryMap = new Map(entries.map((e) => [e.date, e]));
    const weekDays: Date[] = [];

    for (let d = new Date(targetWeekStart); d <= targetWeekEnd; d.setDate(d.getDate() + 1)) {
      if (d.getDay() >= 1 && d.getDay() <= 5) weekDays.push(new Date(d));
    }

    return weekDays.map((d) => {
      const entry = entryMap.get(formatDate(d));
      return {
        period: getDayLabel(d),
        hours: entry?.enteredHours || 0,
        expected: entry?.expectedHours || 0,
        isHoliday: entry?.isHoliday || false,
        holidayName: entry?.holidayName || null,
        week: getWeekLabel(targetWeekStart)
      };
    });
  };

  const getMonthData = (entries: TimebankEntry[]): ChartDataPoint[] => {
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
          period: getWeekLabel(weekDate),
          hours: values.hours,
          expected: values.expected,
          month: weekDate.toLocaleString("default", { month: "long" })
        };
      })
      .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
  };

  const getYearData = (entries: TimebankEntry[]): ChartDataPoint[] => {
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
        period: getMonthLabel(new Date(year, Number(month))),
        hours: values.hours,
        expected: values.expected
      }));
  };

  const chartData = useMemo<ChartDataPoint[]>(() => {
    switch (selectedRange) {
      case "week":
        return getWeekData(employeeMockData);
      case "month":
        return getMonthData(employeeMockData);
      case "year":
        return getYearData(employeeMockData);
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

  return (
    <>
      {/* BALANCE HEADER */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: -3, mt: 7, height: "75px" }}>
        <Typography variant="h4">
          {loading ? <CircularProgress /> : renderUserFlextime()}
        </Typography>
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
            <Typography variant="h4">{chartData[0]?.week || RANGE_LABELS.week}</Typography>
            <ButtonGroup sx={{ mt: 1 }}>
              <IconButton onClick={() => handleWeekOffsetChange(-1)}>
                <ArrowBack />
              </IconButton>
              <IconButton disabled={weekOffset === 0} onClick={() => handleWeekOffsetChange(1)}>
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
                  disabled={monthOffset === -12}
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
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tick={({ x, y, payload, index }) => {
                const dataPoint = chartData[index];
                const color = dataPoint?.isHoliday ? "#FF0000" : "#000";
                return (
                  <text x={x} y={y + 10} textAnchor="middle" fill={color} fontSize={14}>
                    {payload.value}
                    {dataPoint?.isHoliday && <title>{dataPoint.holidayName}</title>}
                  </text>
                );
              }}
            />
            <YAxis domain={YAXIS_DOMAIN[selectedRange]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" fill="#515151" isAnimationActive />
            <ReferenceLine
              y={EXPECTED_HOURS[selectedRange]}
              stroke="red"
              strokeDasharray="3 3"
              label={{
                value: strings.timebank.expected,
                fill: "#ff0000",
                fontSize: 16,
                position: "top"
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <BackButton />
    </>
  );
};

export default TimebankContent;
