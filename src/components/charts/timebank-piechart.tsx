import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  renderCustomizedLabel,
  dailyEntryToChart,
  renderCustomizedTooltipPieChart
} from "../../utils/chart-utils";
import { Typography } from "@mui/material";
import strings from "../../localization/strings";
import { COLORS } from "../constants";
import { DailyEntry } from "../../generated/client";

/**
 * Component properties
 */
interface Props {
  personDailyEntry: DailyEntry;
}

/**
 * Time bank pie chart component
 *
 * @returns A pie chart containing logged time breakdown of the daily entry
 */
const TimebankPieChart = ({ personDailyEntry }: Props) => {
  if (!personDailyEntry?.logged) {
    return (
      <ResponsiveContainer width={"75%"} height={200}>
        <Typography sx={{ textAlign: "center", marginTop: "12%" }}>
          {strings.timebank.noData}
        </Typography>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width={"75%"} height={200}>
      <PieChart>
        <Pie
          data={dailyEntryToChart(personDailyEntry)}
          dataKey="dataKey"
          cx="50%"
          cy="50%"
          outerRadius={50}
          label={(entry) => {
            if (!entry.dataKey) {
              return null; 
            } else {
              return renderCustomizedLabel(entry);
            }
          }}
          labelLine={false}
        >     
          {dailyEntryToChart(personDailyEntry).map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip content={renderCustomizedTooltipPieChart} />
      </PieChart>
    </ResponsiveContainer>
  );
};
export default TimebankPieChart;
