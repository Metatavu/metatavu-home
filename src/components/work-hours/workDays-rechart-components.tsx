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
          tick={({ x, y, payload, index }) => {
            const color = chartData[index]?.isHoliday ? "#FF0000" : "#000";
            return (
              <text x={x} y={y + 10} textAnchor="middle" fill={color} fontSize={14}>
                {payload.value}
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
);

export default WorkDaysRechart;
