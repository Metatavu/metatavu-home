import type React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import strings from "src/localization/strings";
import type { SprintViewChartData } from "src/types";
import { getHoursAndMinutes } from "src/utils/time-utils";

interface Props {
  chartData: SprintViewChartData[];
  showActualWorkHours?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const tooltipContainerStyle: React.CSSProperties = {
  backgroundColor: "white",
  opacity: 0.8,
  borderRadius: "10px",
  boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)",
};

const tooltipTitleStyle: React.CSSProperties = {
  padding: "10px",
  fontWeight: "bold",
  margin: 0,
};

const tooltipItemStyle: React.CSSProperties = {
  padding: "0 10px 10px 10px",
  margin: 0,
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const projectName = payload[0]?.payload?.projectName;

  const estimatedEntry = payload.find(
    (entry) => entry.name === strings.sprint.timeEntries
  );
  const actualEntry = payload.find(
    (entry) => entry.name === strings.sprint.timeAllocated
  );

  return (
    <div style={tooltipContainerStyle}>
      <p style={tooltipTitleStyle}>{projectName}</p>
      {actualEntry && (
        <p style={tooltipItemStyle}>
          {strings.sprint.timeAllocated}:{" "}
          {getHoursAndMinutes(actualEntry.value)}
        </p>
      )}
      {estimatedEntry && (
        <p style={tooltipItemStyle}>
          {strings.sprint.timeEntries}:{" "}
          {getHoursAndMinutes(estimatedEntry.value)}
        </p>
      )}
    </div>
  );
};

const SprintViewScatterChart: React.FC<Props> = ({ chartData }) => {
    const chartHeight = chartData.length === 1 ? 100 : chartData.length * 60;
    const estimatedData = chartData.map((item) => ({
      projectName: item.projectName,
      x: item.estimatedWorkHour,
    }));

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="x"
          name="Work Hours"
          tick={{ fontSize: 14 }}
          axisLine
          padding={{ left: 0, right: 0 }}
          domain={[0, (dataMax: number) => dataMax]}
        />
        <YAxis
          type="category"
          dataKey="projectName"
          name="Project"
          tick={{ fontSize: 14 }}
          width={150}
          interval={0}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter
          name={strings.sprint.timeEntries}
          data={estimatedData}
          fill="#4d4788"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default SprintViewScatterChart;