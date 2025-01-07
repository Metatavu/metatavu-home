import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import strings from "src/localization/strings";
import type { SprintViewChartData } from "src/types";
import { getHoursAndMinutes } from "src/utils/time-utils";

/**
 * Component properties
 */
interface Props {
  chartData: SprintViewChartData[];
}

/**
 * Sprint overview chart component
 * 
 * @param props component properties
 */
const SprintViewBarChart = ({chartData}: Props) => 
  <ResponsiveContainer
  width="100%"
  height={chartData.length === 1 ? 100 : chartData.length * 60}
  >
  <BarChart
    data={chartData}
    layout="vertical"
    barGap={0}
    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
  >
    <XAxis
      type="number"
      axisLine
      domain={[0, (dataMax: number) => dataMax]} 
      style={{ fontSize: "14px" }}
      padding={{ left: 0, right: 0 }}
    />
    <YAxis
      type="category"
      dataKey="projectName"
      tick={{ fontSize: "14px" }}
      width={150}
    />
    <Tooltip content={<CustomTooltip />} />
    <Bar
      dataKey="actualWorkHours"
      name={strings.sprint.timeAllocated}
      barSize={20}
    >
      {chartData.map((entry) => (
          <Cell key={`cell-actual-workHours-${entry.actualWorkHours}`} fill="#8884d8"  />
        ))}
    </Bar>
    <Bar
      dataKey="estimatedWorkHour"
      name={strings.sprint.timeEntries}
      barSize={20}
    >
      {chartData.map((entry) => (
          <Cell style={{opacity: "0.5"}} key={`cell-estimated-WorkHours-${entry.estimatedWorkHour}`} fill="#82ca9d"  />
        ))}
    </Bar>
  </BarChart>
  </ResponsiveContainer>

export default SprintViewBarChart;

/**
 * Tooltip for chart component
 * 
 * @param payload project values
 * @param label name of the project
 */
const CustomTooltip = ({ payload, label }: any) => {
  if (!payload.length) return;

  return (
    <div style={{backgroundColor:"white", opacity:"0.8", borderRadius:"10px"}}>
      <p style={{padding:"10px 10px 0px 10px"}}>{label}</p>
      <p style={{padding:"0px 10px 0px 10px"}}>
        {strings.sprint.allocation}: {getHoursAndMinutes(payload[0].value as number)}
      </p>
      <p style={{padding:"0px 10px 10px 10px"}}>
        {strings.sprint.timeEntries}: {getHoursAndMinutes(payload[1].value as number)}
      </p>
    </div>
  );
};