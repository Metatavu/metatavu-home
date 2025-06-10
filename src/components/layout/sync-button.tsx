// TODO: Code no longer needed can probably be removed

// import { Button, Box, LinearProgress, Snackbar, Alert } from "@mui/material";
// import { DateTime } from "luxon";
// import { type SyntheticEvent, useState, useEffect } from "react";
// import { useApi } from "src/hooks/use-api";
// import { errorAtom } from "src/atoms/error";
// import { useAtomValue, useSetAtom } from "jotai";
// import SyncDialog from "../contexts/sync-handler";
// import strings from "src/localization/strings";
// import type { DailyEntry, Person } from "src/generated/client";
// import config from "src/app/config";
// import { userProfileAtom } from "src/atoms/auth";
// import { personsAtom } from "src/atoms/person";
// /**
//  * Sync button component
//  */
// const SyncButton = () => {
//   const { synchronizeApi } = useApi();
//   const setError = useSetAtom(errorAtom);
//   const yesterday: DateTime = DateTime.now().minus({ days: 1 });
//   const [syncStartDate, setSyncStartDate] = useState(yesterday);
//   const [syncing, setSyncing] = useState(false);
//   const [syncSuccess, setSyncSuccess] = useState(false);
//   const [syncHandlerOpen, setSyncHandlerOpen] = useState(false);
//   const [enableSync, setEnableSync] = useState(false);
//   const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>();
//   const { dailyEntriesApi } = useApi();
//   const userProfile = useAtomValue(userProfileAtom);
//   const persons = useAtomValue(personsAtom);
//   const loggedInPerson = persons?.find((person: Person) => person.keycloakId === userProfile?.id);

//   /**
//    * fetching daily entries
//    */
//   const fetchDailyEntries = async () => {
//     try {
//       const fetchedDailyEntries = await dailyEntriesApi.listDailyEntries({
//         personId: loggedInPerson?.id || config.person.forecastUserIdOverride,
//         vacation: false
//       });
//       setDailyEntries(fetchedDailyEntries);
//     } catch (error) {
//       setError(`${strings.error.fetchFailedNoEntriesGeneral}, ${error}`);
//     }
//     setEnableSync(true);
//   };

//   useEffect(() => {
//     if (persons.length) {
//       fetchDailyEntries();
//     }
//   }, [persons]);

//   /**
//    * Update latest daily entry date
//    */
//   const updateSyncFromDailyEntries = async () => {
//     let dailyEntryDates: DateTime[] = [];
//     try {
//       if (dailyEntries?.length) {
//         dailyEntryDates = dailyEntries.map((dailyEntry) => DateTime.fromJSDate(dailyEntry.date));
//       }
//     } catch (error) {
//       setError(`${strings.error.fetchFailedNoEntriesGeneral}, ${error}`);
//     }

//     if (dailyEntryDates.length) {
//       setSyncStartDate(DateTime.max(...dailyEntryDates));
//     }
//   };

//   /**
//    * Handle sync button close
//    *
//    * @param _event event object
//    * @param reason reason for button close
//    */
//   const handleSyncButtonClose = (_event?: SyntheticEvent | Event, reason?: string) => {
//     if (reason === "clickaway") {
//       return;
//     }

//     setSyncSuccess(false);
//   };

//   /**
//    * Synchronize time entries
//    */
//   const synchronizeTimeEntries = async () => {
//     setSyncing(true);
//     try {
//       await synchronizeApi.synchronizeTimeEntries({
//         after: syncStartDate.toJSDate() || undefined,
//         syncDeleted: false
//       });
//       setSyncSuccess(true);
//     } catch (error) {
//       setError(`${strings.syncButton.error} ${error}`);
//       setSyncSuccess(false);
//     }
//     setSyncing(false);
//     setSyncStartDate(yesterday);
//   };

//   /**
//    * Event handler for sync button click
//    */
//   const handleSyncButtonClick = () => {
//     updateSyncFromDailyEntries().then(() => {
//       setSyncHandlerOpen(true);
//     });
//   };

//   return (
//     <>
//       <SyncDialog
//         setSyncStartDate={setSyncStartDate}
//         syncStartDate={syncStartDate}
//         syncHandlerOpen={syncHandlerOpen}
//         setSyncHandlerOpen={setSyncHandlerOpen}
//         synchronizeTimeEntries={synchronizeTimeEntries}
//       />
//       <Button
//         variant="contained"
//         onClick={() => {
//           handleSyncButtonClick();
//         }}
//         disabled={syncing || !enableSync}
//       >
//         <Box sx={{ width: "100%" }}>
//           {strings.syncButton.sync}
//           {syncing && <LinearProgress />}
//         </Box>
//       </Button>
//       <Snackbar open={syncSuccess} autoHideDuration={6000} onClose={handleSyncButtonClose}>
//         <Alert onClose={handleSyncButtonClose} severity={"success"} sx={{ width: "100%" }}>
//           {strings.syncButton.success}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default SyncButton;
