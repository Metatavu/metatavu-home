import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer, Cell } from "recharts";
import { getHours } from "src/utils/time-utils";
import type { SprintViewChartData } from "src/types";
import strings from "src/localization/strings";
import { CustomTooltip } from "src/utils/chart-utils";

/**
 * Component properties
 */
interface Props {
  chartData: SprintViewChartData[];
  vertical?: boolean;
}

/**
 * Sprint overview chart component
 *
 * @param props component properties
 */
const SprintViewBarChart = ({ chartData, vertical = true }: Props) => (
  <ResponsiveContainer
    width="100%"
    height={(vertical && (chartData.length === 1 ? 100 : chartData.length * 60)) || undefined}
  >
    <BarChart
      data={chartData}
      layout={vertical ? "vertical" : "horizontal"}
      barGap={0}
      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
    >
      {Axis(vertical)}
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey={"timeAllocated"} name={strings.sprint.timeAllocated} barSize={20}>
        {chartData.map((entry) => (
          <Cell key={`cell-time-allocated-${entry.id}`} fill={entry.color} />
        ))}
      </Bar>
      <Bar dataKey={"timeEntries"} name={strings.sprint.timeEntries} barSize={20}>
        {chartData.map((entry) => (
          <Cell
            style={{ opacity: "0.5" }}
            key={`cell-time-entries-${entry.id}`}
            fill={entry.color}
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const Axis = (vertical: boolean) => {
  return (
    <>
      {vertical ? (
        <>
          <XAxis
            type="number"
            axisLine={false}
            tickFormatter={(value) => getHours(value as number)}
            domain={[0, (dataMax: number) => dataMax]}
            style={{ fontSize: "18px" }}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis type="category" dataKey="projectName" tick={false} hide={true} />
        </>
      ) : (
        <>
          <XAxis type="category" dataKey="projectName" tick={false} hide={true} />
          <YAxis
            type="number"
            axisLine={false}
            tickFormatter={(value) => getHours(value as number)}
            domain={[0, (dataMax: number) => dataMax]}
            style={{ fontSize: "18px" }}
            padding={{ top: 0, bottom: 0 }}
          />
        </>
      )}
    </>
  );
};

export default SprintViewBarChart;
