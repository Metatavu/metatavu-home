import { Box, Typography, useTheme } from "@mui/material";
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
import type { ChartDataPoint } from "./workDays-chart";

/**
 * Props for WorkDaysRechart component
 */
interface WorkDaysRechartProps {
  chartData: ChartDataPoint[];
  selectedRange: "week" | "month" | "year";
  getBarColor: (hours: number, expected: number) => string;
  strings: any;
  YAXIS_DOMAIN: Record<"week" | "month" | "year", [number, number]>;
}

/**
 * XAxis Tick component
 */
const XAxisTick = ({
  x,
  y,
  payload,
  isHoliday
}: {
  x: number;
  y: number;
  payload: any;
  isHoliday?: boolean;
}) => {
  const theme = useTheme();
  const color = isHoliday ? theme.palette.error.main : theme.palette.text.primary;
  return (
    <text x={x} y={y + 10} textAnchor="middle" fill={color} fontSize={14}>
      {payload.value}
    </text>
  );
};

/**
 * Custom Tooltip component
 */
const ChartTooltip = ({ active, payload, label, strings }: any) => {
  const theme = useTheme();
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as ChartDataPoint;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`,
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
      <Typography variant="body2">
        {strings.timebank.enteredHours}: {data.hours}
      </Typography>
      <Typography variant="body2">
        {strings.timebank.expectedHours}: {data.expected}
      </Typography>
    </Box>
  );
};

/**
 * Custom Bar Shape component
 */
const CustomBarShape = ({ x, y, width, height, payload, getBarColor }: any) => {
  const color = getBarColor(payload.hours, payload.expected);
  return <rect x={x} y={y} width={width} height={height} fill={color} />;
};

/**
 * Renders XAxis tick with holiday coloring
 */
const renderXAxisTick = (chartData: ChartDataPoint[]) => {
  return (props: any) => <XAxisTick {...props} isHoliday={chartData[props.index]?.isHoliday} />;
};

/**
 * Renders Tooltip component
 */
const renderTooltip = (strings: any) => {
  return (props: any) => <ChartTooltip {...props} strings={strings} />;
};

/**
 * Renders Bar Shape component
 */
const renderBarShape = (getBarColor: (hours: number, expected: number) => string) => {
  return (props: any) => <CustomBarShape {...props} getBarColor={getBarColor} />;
};

/**
 * Work days rechart component
 */
const WorkDaysRechart = ({
  chartData,
  selectedRange,
  getBarColor,
  strings,
  YAXIS_DOMAIN
}: WorkDaysRechartProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%", height: 500 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" tick={renderXAxisTick(chartData)} />
          <YAxis domain={YAXIS_DOMAIN[selectedRange]} />
          <Tooltip content={renderTooltip(strings)} />
          <Legend />
          <Bar
            dataKey="hours"
            name={strings.timebank.logged}
            fill={theme.palette.primary.main}
            isAnimationActive
            shape={renderBarShape(getBarColor)}
          />
          <Line
            type="monotone"
            dataKey="expected"
            name={strings.timebank.expected}
            stroke={theme.palette.text.primary}
            strokeWidth={2}
            dot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default WorkDaysRechart;
