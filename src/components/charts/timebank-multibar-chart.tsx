// NOTE: This entire file is commented out because it uses timebank client which is removed for restoring.
// import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from "recharts";
// import type { DailyEntry } from "src/generated/client";
// import { theme } from "src/theme";
// import strings from "src/localization/strings";
// import { getHours } from "src/utils/time-utils";
// import { Typography } from "@mui/material";
// import { renderCustomizedTooltipBarChart } from "src/utils/chart-utils";
// import { type ChartData, Worktime } from "src/types";

// /**
//  * Component properties
//  */
// // interface Props {
// //   selectedEntries: DailyEntry[];
// // }

// /**
//  * Timebank multiple bar chart component representing data from a selected range
//  *
//  * @param props component properties
//  */
// const TimebankMultiBarChart = ({ selectedEntries }: Props) => {
//   const chartData: ChartData[] = selectedEntries.map((entry) => ({
//     name: entry.date.toLocaleDateString(strings.localization.time, {
//       day: "numeric",
//       month: "numeric"
//     }),
//     internal: entry.internalTime,
//     billableProject: entry.billableProjectTime,
//     nonBillableProject: entry.nonBillableProjectTime,
//     expected: entry.expected
//   }));

//   if (!chartData) {
//     return (
//       <ResponsiveContainer width="75%" height={400}>
//         <Typography sx={{ textAlign: "center", marginTop: "12%" }}>
//           {strings.timebank.noData}
//         </Typography>
//       </ResponsiveContainer>
//     );
//   }

//   return (
//     <ResponsiveContainer width="75%" height={400}>
//       <BarChart
//         data={chartData}
//         layout="horizontal"
//         barGap={10}
//         margin={{
//           top: 20,
//           right: 30,
//           left: 20,
//           bottom: 5
//         }}
//       >
//         <YAxis
//           type="number"
//           axisLine={false}
//           tickFormatter={(value) => getHours(value as number)}
//           domain={[0, (dataMax: number) => dataMax]}
//         />
//         <XAxis type="category" dataKey="name" />
//         <Tooltip content={renderCustomizedTooltipBarChart} />
//         <Legend />
//         <Bar
//           dataKey={Worktime.Billable}
//           name={strings.timebank.billableProjectTime}
//           barSize={60}
//           stackId="stackedBar"
//           fill={theme.palette.success.dark}
//         />
//         <Bar
//           dataKey={Worktime.NonBillable}
//           name={strings.timebank.nonBillableProjectTime}
//           barSize={60}
//           stackId="stackedBar"
//           fill={theme.palette.success.light}
//         />
//         <Bar
//           dataKey={Worktime.Internal}
//           name={strings.timebank.internalTime}
//           barSize={60}
//           stackId="stackedBar"
//           fill={theme.palette.warning.main}
//         />
//         <Bar
//           dataKey={Worktime.Expected}
//           name={strings.timebank.expected}
//           barSize={60}
//           fill={theme.palette.info.main}
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   );
// };

// export default TimebankMultiBarChart;
