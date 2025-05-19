// // TODO: This screen is not currently in use and needs to be restored using lambdas and severa

// import {
//   Grow,
//   Container,
//   Box,
//   Typography,
//   FormControl,
//   TextField,
//   MenuItem,
//   CircularProgress,
//   List,
//   ListItem,
//   ListItemText
// } from "@mui/material";
// import {
//   TimebankCard,
//   TimebankCardFlexBox,
//   TimebankCardTitle
// } from "./generic/generic-card-components";
// import strings from "src/localization/strings";
// import { formatTimePeriod, getHoursAndMinutes } from "src/utils/time-utils";
// import { type PersonTotalTime, Timespan } from "src/generated/client";
// import LocalizationUtils from "src/utils/localization-utils";
// import TimebankOverviewChart from "src/components/charts/timebank-overview-chart";
// import { theme } from "src/theme";
// import { useEffect, useState } from "react";
// import { useApi } from "src/hooks/use-api";
// import { DateTime } from "luxon";
// import { useSetAtom } from "jotai";
// import { errorAtom } from "src/atoms/error";

// /**
//  * Component properties
//  */
// interface Props {
//   selectedEmployeeId?: number;
// }

// /**
//  * Component that contains card with the summary of time entries chart
//  *
//  * @param props Component properties
//  */
// const SummaryTimEntriesCard = ({ selectedEmployeeId }: Props) => {
//   const [timespan, setTimespan] = useState<Timespan>(Timespan.ALL_TIME);
//   const [loading, setLoading] = useState(false);
//   const { personsApi } = useApi();
//   const [personTotalTime, setPersonTotalTime] = useState<PersonTotalTime>();
//   const setError = useSetAtom(errorAtom);

//   useEffect(() => {
//     if (selectedEmployeeId) {
//       getPersonTotalTime(selectedEmployeeId);
//     }
//   }, [selectedEmployeeId, timespan]);

//   /**
//    * Gets person's total time data.
//    *
//    * @param selectedPersonId selected person id
//    */
//   const getPersonTotalTime = async (selectedPersonId: number) => {
//     setLoading(true);
//     if (selectedPersonId) {
//       try {
//         const fetchedPersonTotalTime = await personsApi.listPersonTotalTime({
//           personId: selectedPersonId,
//           timespan: timespan || Timespan.ALL_TIME,
//           before: DateTime.now().minus({ days: 1 }).toJSDate()
//         });
//         setPersonTotalTime(fetchedPersonTotalTime[0]);
//       } catch (error) {
//         setError(`${strings.error.totalTimeFetch}, ${error}`);
//       }
//     }
//     setLoading(false);
//   };

//   /**
//    * Render timespan select component
//    *
//    * @returns timespan select component
//    */
//   const renderTimespanSelect = () => (
//     <TextField
//       select
//       label={strings.timebank.selectTimespan}
//       sx={{
//         width: "100%"
//       }}
//       value={timespan}
//       onChange={(e) => {
//         setTimespan(e.target.value as Timespan);
//       }}
//     >
//       {Object.keys(Timespan).map((item) => {
//         return (
//           <MenuItem key={`timespan-select-menuitem-${item}`} value={item}>
//             {LocalizationUtils.getLocalizedTimespan(item as Timespan)}
//           </MenuItem>
//         );
//       })}
//     </TextField>
//   );

//   /**
//    * Renders overview chart and list item elements containing total time summaries
//    */
//   const renderOverViewChart = () => {
//     if (loading) {
//       return (
//         <CircularProgress
//           sx={{
//             margin: "auto",
//             mt: "5%",
//             mb: "5%"
//           }}
//         />
//       );
//     }
//     if (!personTotalTime) return null;

//     return (
//       <>
//         <TimebankOverviewChart personTotalTime={personTotalTime} />
//         <List style={{ width: "12%", minWidth: "110px" }} dense sx={{ marginLeft: "5%" }}>
//           <ListItem>
//             <ListItemText
//               sx={{
//                 color: getHoursAndMinutes(personTotalTime.balance).startsWith("-")
//                   ? theme.palette.error.main
//                   : theme.palette.success.main
//               }}
//               primary={strings.timebank.balance}
//               secondary={getHoursAndMinutes(personTotalTime.balance)}
//             />
//           </ListItem>
//           <ListItem>
//             <ListItemText
//               primary={strings.timebank.logged}
//               secondary={getHoursAndMinutes(personTotalTime.logged)}
//             />
//           </ListItem>
//           <ListItem>
//             <ListItemText
//               primary={strings.timebank.expected}
//               secondary={getHoursAndMinutes(personTotalTime.expected)}
//             />
//           </ListItem>
//         </List>
//       </>
//     );
//   };

//   return (
//     <Grow in>
//       <TimebankCard>
//         {TimebankCardTitle(strings.timebank.barChartDescription)}
//         <Container sx={{ p: 3 }}>
//           <Box
//             sx={{
//               textAlign: "center",
//               scale: "150%",
//               mb: 3
//             }}
//           >
//             <Typography>{strings.timebank.timeperiod}</Typography>
//             <Typography sx={{ color: "grey" }}>
//               {formatTimePeriod(personTotalTime?.timePeriod?.split(","))}
//             </Typography>
//           </Box>
//           <Box sx={{ display: "flex", justifyContent: "center" }}>
//             <FormControl
//               sx={{
//                 width: "50%",
//                 marginRight: "1%",
//                 textAlign: "center"
//               }}
//             >
//               {renderTimespanSelect()}
//             </FormControl>
//           </Box>
//           <TimebankCardFlexBox>{renderOverViewChart()}</TimebankCardFlexBox>
//         </Container>
//       </TimebankCard>
//     </Grow>
//   );
// };

// export default SummaryTimEntriesCard;
