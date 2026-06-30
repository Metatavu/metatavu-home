import { Box, Typography, useTheme } from "@mui/material";
import { Bar, BarChart, ResponsiveContainer, Text, Tooltip, XAxis, YAxis } from "recharts";
import strings from "src/localization/strings";
import type { SprintViewChartData } from "src/types";
import { getHoursAndMinutes } from "src/utils/time-utils";

/**
 * SprintViewScatterChart component props
 */
interface Props {
  chartData: SprintViewChartData[];
  hidden: boolean;
}

/**
 * CustomTooltip component props
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  dataWithIndex: any[];
}

/**
 * Custom tooltip component for Sprintview bar chart.
 *
 * @param props.active - Boolean indicating if tooltip is visible
 * @param props.payload - Array containing chart data
 * @param props.dataWithIndex - Array containing chart data with indices
 *
 * @returns Customised tooltip
 */
const CustomTooltip = ({ active, payload, dataWithIndex }: CustomTooltipProps) => {
  const theme = useTheme();
  if (!active || !payload?.length) return null;

  const projectName = payload[0]?.payload?.projectName;

  const estimatedEntry = payload.find((entry) => entry.name === "estimatedWorkHour");
  const actualEntry = payload.find((entry) => entry.name === "actualWorkHours");
  const project = dataWithIndex.find((entry) => entry.projectName === projectName);
  const index = project.index;
  const isTop = dataWithIndex.length / 2 > index;

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.tooltip,
        borderRadius: theme.radius.s,
        color: theme.palette.foreground.inversed,
        maxWidth: 280,
        "&::after": {
          content: '""',
          position: "absolute",
          left: 10,
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",

          ...(isTop
            ? {
                top: -5,
                borderBottom: `6px solid ${theme.palette.background.tooltip}`
              }
            : {
                bottom: -5,
                borderTop: `6px solid ${theme.palette.background.tooltip}`
              })
        }
      }}
    >
      <Typography variant="caption">{projectName}</Typography>
      {actualEntry && (
        <Typography variant="caption">
          {strings.sprint.timeAllocated}: {getHoursAndMinutes(actualEntry.value)}
        </Typography>
      )}
      {estimatedEntry && (
        <Typography variant="caption">
          {strings.sprint.timeEntries}: {getHoursAndMinutes(estimatedEntry.value)}
        </Typography>
      )}
    </Box>
  );
};

/**TODO: Target hours are not in the chart yet. Where do they come from?
 *
 * Component for sprintview card bar chart
 *
 * @param props.chartData - Array containing chart data
 * @param props.hidden - Boolean indicating if card is visible
 *
 * @returns Recharts bar chart containing worked and estimated hours for user.
 */
const SprintViewBarChart = ({ chartData, hidden }: Props) => {
  const theme = useTheme();

  const colors = hidden
    ? {
        text: theme.palette.text.disabled,
        icons: theme.palette.icons.disabled,
        primary: theme.palette.chart.disabledPrimary,
        secondary: theme.palette.chart.disabledSecondary
      }
    : {
        text: theme.palette.text.primary,
        icons: theme.palette.icons.primary,
        primary: theme.palette.chart.primary,
        secondary: theme.palette.chart.secondary
      };

  const chartHeight = chartData.length === 1 ? 100 : chartData.length * 100;
  const axisWidth = Math.max(...chartData.map((item) => item.projectName.length * 8));
  const maxWidth = axisWidth > 200 ? 200 : axisWidth;
  const dataWithIndex = chartData.map((item, index) => ({
    ...item,
    index
  }));

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        barGap={-10}
      >
        <XAxis type="number" axisLine={{ stroke: colors.icons }} tickLine={false} />
        <YAxis
          type="category"
          width={maxWidth}
          dataKey="projectName"
          axisLine={{ stroke: colors.icons }}
          tick={(props) => (
            <Text
              x={props.x}
              y={props.y}
              fontStyle="body"
              width={maxWidth}
              fill={colors.text}
              textAnchor="end"
              verticalAnchor="middle"
              breakAll
            >
              {props.payload.value}
            </Text>
          )}
          tickLine={false}
          interval={0}
          tickMargin={15}
        />
        <Tooltip content={<CustomTooltip dataWithIndex={dataWithIndex} />} />
        <Bar
          dataKey="estimatedWorkHour"
          fill={colors.primary}
          radius={[0, 16, 16, 0]}
          barSize={10}
        />
        <Bar
          dataKey="actualWorkHours"
          fill={colors.secondary}
          radius={[0, 16, 16, 0]}
          barSize={10}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SprintViewBarChart;
