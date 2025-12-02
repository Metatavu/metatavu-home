// NOTE: This method was only used in timebank screens and is now commented out due to the removal of the timebank client.
// import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
// import {
//   renderCustomizedLabel,
//   dailyEntryToChart,
//   renderCustomizedTooltipPieChart
// } from "src/utils/chart-utils";
// import { Typography } from "@mui/material";
// import strings from "src/localization/strings";
// import { COLORS } from "../constants";
// //import type { DailyEntry } from "src/generated/client";

// /**
//  * Component properties
//  */
// interface Props {
//   personDailyEntry: DailyEntry;
// }

// /**
//  * Time bank pie chart component
//  *
//  * @returns A pie chart containing logged time breakdown of the daily entry
//  */
// const TimebankPieChart = ({ personDailyEntry }: Props) => {
//   if (!personDailyEntry?.logged) {
//     return (
//       <ResponsiveContainer width={"75%"} height={200}>
//         <Typography sx={{ textAlign: "center", marginTop: "12%" }}>
//           {strings.timebank.noData}
//         </Typography>
//       </ResponsiveContainer>
//     );
//   }
//   return (
//     <ResponsiveContainer width={"75%"} height={200}>
//       <PieChart>
//         <Pie
//           data={dailyEntryToChart(personDailyEntry).filter((entry) => entry.dataKey)}
//           dataKey="dataKey"
//           cx="50%"
//           cy="50%"
//           outerRadius={50}
//           label={(entry) => {
//             return renderCustomizedLabel(entry);
//           }}
//           labelLine={false}
//         >
//           {dailyEntryToChart(personDailyEntry).map((_entry, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index]} />
//           ))}
//         </Pie>
//         <Tooltip content={renderCustomizedTooltipPieChart} />
//       </PieChart>
//     </ResponsiveContainer>
//   );
// };
// export default TimebankPieChart;
