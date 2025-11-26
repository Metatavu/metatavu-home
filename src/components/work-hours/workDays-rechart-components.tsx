import { Box, Typography } from "@mui/material";
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
 *
 * @param x - The x position of the tick.
 * @param y - The y position of the tick.
 * @param payload - The payload containing the tick value.
 * @param isHoliday - Indicates if the tick represents a holiday.
 *
 * @returns A custom SVG text element for the XAxis tick.
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
  const color = isHoliday ? "#FF0000" : "#000";
  return (
    <text x={x} y={y + 10} textAnchor="middle" fill={color} fontSize={14}>
      {payload.value}
    </text>
  );
};

/**
 * Custom Tooltip component
 *
 * @param active - Indicates if the tooltip is active.
 * @param payload - The data payload for the tooltip.
 * @param label - The label for the tooltip.
 * @param strings - Localization strings.
 *
 * @returns A custom tooltip box displaying work day information.
 */
const ChartTooltip = ({ active, payload, label, strings }: any) => {
  if (!active || !payload || !payload.length) return null;

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
 *
 * @param x - The x position of the bar.
 * @param y - The y position of the bar.
 * @param width - The width of the bar.
 * @param height - The height of the bar.
 * @param payload - The data payload for the bar.
 * @param getBarColor - Function to determine the color of the bar.
 *
 * @returns A custom SVG rectangle element for the bar with dynamic color.
 */
const CustomBarShape = ({ x, y, width, height, payload, getBarColor }: any) => {
  const color = getBarColor(payload.hours, payload.expected);
  return <rect x={x} y={y} width={width} height={height} fill={color} />;
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
}: WorkDaysRechartProps) => (
  <Box sx={{ width: "100%", height: 500 }}>
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="period"
          tick={(props) => <XAxisTick {...props} isHoliday={chartData[props.index]?.isHoliday} />}
        />
        <YAxis domain={YAXIS_DOMAIN[selectedRange]} />
        <Tooltip content={(props) => <ChartTooltip {...props} strings={strings} />} />
        <Legend />
        <Bar
          dataKey="hours"
          name={strings.timebank.logged}
          isAnimationActive
          shape={(props: any) => <CustomBarShape {...props} getBarColor={getBarColor} />}
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
);

export default WorkDaysRechart;
