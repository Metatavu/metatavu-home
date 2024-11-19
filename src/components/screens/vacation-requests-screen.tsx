import { Button, Card, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import VacationRequestsTable from "../vacation-requests-table/vacation-requests-table";
import type {
  VacationRequest,
  VacationRequestStatuses,
} from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import type { GridRowId } from "@mui/x-data-grid";
import type { VacationData } from "src/types";
import strings from "src/localization/strings";
import {
  allVacationRequestsAtom,
  vacationRequestsAtom,
  displayedVacationRequestsAtom
} from "src/atoms/vacation";
import UserRoleUtils from "src/utils/user-role-utils";
import { Link } from "react-router-dom";
import { KeyboardReturn } from "@mui/icons-material";
import LocalizationUtils from "src/utils/localization-utils";
import { renderVacationDaysTextForScreen } from "src/utils/vacation-days-utils";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";

/**
 * Vacation requests screen
 */
const VacationRequestsScreen = () => {
  const adminMode = UserRoleUtils.adminMode();
  const { vacationRequestsApi } = useLambdasApi();
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [vacationRequests, setVacationRequests] = useAtom(
    adminMode ? allVacationRequestsAtom : vacationRequestsAtom
  );
  const setDisplayedVacationRequests = useSetAtom(displayedVacationRequestsAtom);

  const upcomingVacationRequests = useMemo(
    () => vacationRequests.filter((request) => request.endDate.getTime() > Date.now()),
    [vacationRequests]
  );
  const pastVacationRequests = useMemo(
    () => vacationRequests.filter((request) => request.endDate.getTime() <= Date.now()),
    [vacationRequests]
  );

  // const [latestVacationRequestStatuses, setLatestVacationRequestStatuses] = useAtom(
  //   adminMode ? allVacationRequestStatusesAtom : vacationRequestStatusesAtom
  // );
  const [loading, setLoading] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(true);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find(
    (user: User) =>
      user.id === userProfile?.id
  );

  /**
   * Decide if we show upcoming or past vacations
   */
  useEffect(() => {
    isUpcoming
      ? setDisplayedVacationRequests(upcomingVacationRequests)
      : setDisplayedVacationRequests(pastVacationRequests);
  }, [isUpcoming, vacationRequests]);

  /**
   * Fetch vacation request statuses
   */
  // const fetchVacationRequestStatuses = async () => {
  //   if (vacationRequests.length && !latestVacationRequestStatuses.length) {
  //     try {
  //       setLoading(true);
  //       const vacationRequestStatuses: VacationRequestStatus[] = [];
  //       await Promise.all(
  //         vacationRequests.map(async (vacationRequest) => {
  //           let createdStatuses: VacationRequestStatus[] = [];
  //           if (vacationRequest.id) {
  //             createdStatuses = await vacationRequestStatusApi.listVacationRequestStatuses({
  //               id: vacationRequest.id
  //             });
  //           }
  //           createdStatuses.forEach((createdStatus) => {
  //             vacationRequestStatuses.push(createdStatus);
  //           });
  //         })
  //       );
  //       await filterLatestVacationRequestStatuses(vacationRequestStatuses);
  //     } catch (error) {
  //       setError(`${strings.vacationRequestError.fetchStatusError}, ${error}`);
  //     }
  //     setLoading(false);
  //   }
  // };

    /**
   * Handler for upcoming/ past vacations toggle click
   */
  const toggleIsUpcoming = () => {
    setIsUpcoming(!isUpcoming);
  };

  // useMemo(() => {
  //   fetchVacationRequestStatuses();
  // }, [vacationRequests]);

  /**
   * Filter latest vacation request statuses, so there would be only one status(the latest one) for each request showed on the UI
   */
  // const filterLatestVacationRequestStatuses = async (
  //   vacationRequestStatuses: VacationRequestStatus[]
  // ) => {
  //   if (vacationRequests.length && vacationRequestStatuses.length) {
  //     const selectedLatestVacationRequestStatuses: VacationRequestStatus[] = [];
  //
  //     vacationRequests.forEach((vacationRequest) => {
  //       const selectedVacationRequestStatuses: VacationRequestStatus[] = [];
  //
  //       vacationRequestStatuses.forEach((vacationRequestStatus) => {
  //         if (vacationRequest.id === vacationRequestStatus.vacationRequestId) {
  //           selectedVacationRequestStatuses.push(vacationRequestStatus);
  //         }
  //       });
  //
  //       if (selectedVacationRequestStatuses.length) {
  //         const latestStatus = selectedVacationRequestStatuses.reduce((a, b) => {
  //           if (a.updatedAt && b.updatedAt) {
  //             return a.updatedAt > b.updatedAt ? a : b;
  //           }
  //           if (a.updatedAt) {
  //             return a;
  //           }
  //           return b;
  //         });
  //         selectedLatestVacationRequestStatuses.push(latestStatus);
  //       }
  //     });
  //     setLatestVacationRequestStatuses(selectedLatestVacationRequestStatuses);
  //     setLoading(false);
  //   }
  // };

  /**
   * Fetch vacation requests
   */
  const fetchVacationsRequests = async () => {
    setLoading(true);
    if (!loggedInUser) return;

    if (!vacationRequests.length) {
      try {
        let fetchedVacationRequests = [];
        if (adminMode) {
          fetchedVacationRequests = await vacationRequestsApi.listVacationRequests({});
        } else {
          fetchedVacationRequests = await vacationRequestsApi.listVacationRequests({
            userId: loggedInUser?.id
          });
        }
        setVacationRequests(fetchedVacationRequests);
      } catch (error) {
        setError(`${strings.vacationRequestError.fetchRequestError}, ${error}`);
      }
    }
    setLoading(false);
  };

  useMemo(() => {
    fetchVacationsRequests();
  }, [loggedInUser]);

  //FIXME: introduce this function when status functionality is discussed
  /**
   * Delete vacation request status
   *
   * @param selectedRow selected row
   */
  // const deleteVacationRequestStatus = async (selectedRow: GridRowId) => {
  //   const selectedVacationRequest = vacationRequests[Number(selectedRow)]
  //   if (selectedVacationRequest.status?.length) {
  //     try {
  //       setLoading(true);
  //       if (selectedVacationRequest?.id) {
  //         await vacationRequestStatusApi.deleteVacationRequestStatus({
  //           id: foundVacationRequestStatus.id,
  //           statusId: foundVacationRequestStatus.id
  //         });
  //         const filteredVacationRequestStatuses = latestVacationRequestStatuses.filter(
  //           (vacationRequestStatus) => vacationRequestStatus.id !== foundVacationRequestStatus.id
  //         );
  //         setLatestVacationRequestStatuses(filteredVacationRequestStatuses);
  //       }
  //     } catch (error) {
  //       setError(`${strings.vacationRequestError.deleteStatusError}, ${error}`);
  //     }
  //     setLoading(false);
  //   }
  // };

  /**
   * Delete vacation requests
   *
   * @param selectedRowIds selected row ids
   */
  const deleteVacationRequests = async (selectedRowIds: GridRowId[]) => {
    if (vacationRequests.length) {
      let updatedVacationRequests: VacationRequest[] = vacationRequests;
      await Promise.all(
        selectedRowIds.map(async (selectedRowId) => {
          try {
            setLoading(true);
            await vacationRequestsApi.deleteVacationRequest({
              id: selectedRowId as string
            });
            updatedVacationRequests = updatedVacationRequests.filter(
              (vacationRequest) => vacationRequest.id !== selectedRowId
            );
          } catch (error) {
            setError(`${strings.vacationRequestError.deleteRequestError}, ${error}`);
          }
          setLoading(false);
        })
      );
      setVacationRequests(updatedVacationRequests);
    }
  };

  //FIXME: Introduce this function when the status functionality is discussed
  /**
   * Create a vacation request status
   *
   * @param newStatus new vacation request status
   * @param selectedRowId selected row ids
   */
  // const createVacationRequestStatus = async (
  //   newStatus: VacationRequestStatuses,
  //   selectedRowId: GridRowId
  // ) => {
  //   if (!loggedInUser) return;
  //
  //   try {
  //     setLoading(true);
  //     const vacationRequestId = selectedRowId as string;
  //     const createdVacationRequestStatus =
  //       await vacationRequestStatusApi.createVacationRequestStatus({
  //         id: vacationRequestId,
  //         vacationRequestStatus: {
  //           vacationRequestId: vacationRequestId,
  //           status: newStatus,
  //           message: LocalizationUtils.getLocalizedVacationRequestStatus(newStatus),
  //           createdAt: new Date(),
  //           createdBy: loggedInUser.id,
  //           updatedAt: new Date(),
  //           updatedBy: loggedInUser.id
  //         }
  //       });
  //     return createdVacationRequestStatus;
  //   } catch (error) {
  //     setError(`${strings.vacationRequestError.createStatusError}, ${error}`);
  //   }
  //   setLoading(false);
  // };

  /**
   * Create a vacation request
   *
   * @param vacationData vacation data
   */
  const createVacationRequest = async (vacationData: VacationData) => {
    if (!loggedInUser) return;

    try {
      setLoading(true);
      const createdRequest = await vacationRequestsApi.createVacationRequest({
        vacationRequest: {
          userId: loggedInUser.id,
          startDate: vacationData.startDate.toJSDate(),
          endDate: vacationData.endDate.toJSDate(),
          type: vacationData.type,
          message: vacationData.message,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: loggedInUser?.id,
          days: vacationData.days,
          draft: false,
        }
      });
      setVacationRequests([createdRequest, ...vacationRequests]);
    } catch (error) {
      setError(`${strings.vacationRequestError.createRequestError}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Update a vacation request
   *
   * @param vacationData vacation request data
   * @param vacationRequestId vacation request id
   */
  const updateVacationRequest = async (vacationData: VacationData, vacationRequestId: string) => {
    if (!loggedInUser) return;

    try {
      setLoading(true);
      const vacationRequest = vacationRequests.find(
        (vacationRequest) => vacationRequest.id === vacationRequestId
      );
      if (vacationRequest) {
        const updatedRequest = await vacationRequestsApi.updateVacationRequest({
          id: vacationRequestId,
          vacationRequest: {
            ...vacationRequest,
            startDate: vacationData.startDate.toJSDate(),
            endDate: vacationData.endDate.toJSDate(),
            type: vacationData.type,
            message: vacationData.message,
            updatedAt: new Date(),
            days: vacationData.days
          }
        });
        const updatedVacationRequests = vacationRequests.map((vacationRequest) =>
          vacationRequest.id === updatedRequest.id ? updatedRequest : vacationRequest
        );
        setVacationRequests(updatedVacationRequests);
      }
    } catch (error) {
      setError(`${strings.vacationRequestError.updateRequestError}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Get updated vacation requests statuses
   *
   * @param newStatus vacation request status
   * @param selectedRowIds selected row ids
   * @returns updated vacation request statuses
   */
  // const getUpdatedVacationRequestStatuses = async (
  //   newStatus: VacationRequestStatuses,
  //   selectedRowIds: GridRowId[]
  // ) => {
  //   const updatedVacationRequestStatuses: VacationRequestStatus[] = [];
  //
  //   await Promise.all(
  //     selectedRowIds.map(async (selectedRowId) => {
  //       const vacationRequestStatus = latestVacationRequestStatuses.find(
  //         (vacationRequestStatus) => vacationRequestStatus.vacationRequestId === selectedRowId
  //       );
  //       try {
  //         if (vacationRequestStatus?.id) {
  //           const updatedVacationRequestStatus =
  //             await vacationRequestStatusApi.updateVacationRequestStatus({
  //               id: vacationRequestStatus.id,
  //               statusId: vacationRequestStatus.id,
  //               vacationRequestStatus: {
  //                 ...vacationRequestStatus,
  //                 status: newStatus
  //               }
  //             });
  //           updatedVacationRequestStatuses.push(updatedVacationRequestStatus);
  //         }
  //       } catch (error) {
  //         setError(`${strings.vacationRequestError.updateStatusError}, ${error}`);
  //       }
  //     })
  //   );
  //
  //   return updatedVacationRequestStatuses;
  // };

  /**
   * Get created vacation request statuses
   *
   * @param newStatus vacation request status
   * @param selectedRowIds selected row ids
   * @returns created vacation request statuses
   */
  // const getCreatedVacationRequestStatuses = async (
  //   newStatus: VacationRequestStatuses,
  //   selectedRowIds: GridRowId[]
  // ) => {
  //   const createdVacationRequestStatuses: VacationRequestStatus[] = [];
  //
  //   await Promise.all(
  //     selectedRowIds.map(async (selectedRowId) => {
  //       const foundVacationRequestStatus = latestVacationRequestStatuses.find(
  //         (vacationRequestStatus) => vacationRequestStatus.vacationRequestId === selectedRowId
  //       );
  //       if (!foundVacationRequestStatus) {
  //         const createdVacationRequestStatus = await createVacationRequestStatus(
  //           newStatus,
  //           selectedRowId
  //         );
  //         if (createdVacationRequestStatus) {
  //           createdVacationRequestStatuses.push(createdVacationRequestStatus);
  //         }
  //       }
  //     })
  //   );
  //
  //   return createdVacationRequestStatuses;
  // };

  //FIXME: Introduce this function when the status functionality is discussed
  /**
   * Update vacation request statuses
   *
   * @param newStatus vacation request status
   * @param selectedRowIds selected row ids
   */
  // const updateVacationRequestStatuses = async (
  //   newStatus: VacationRequestStatuses,
  //   selectedRowIds: GridRowId[]
  // ) => {
  //   const updatedVacationRequestStatuses = await getUpdatedVacationRequestStatuses(
  //     newStatus,
  //     selectedRowIds
  //   );
  //   const createdVacationRequestStatuses = await getCreatedVacationRequestStatuses(
  //     newStatus,
  //     selectedRowIds
  //   );
  //
  //   const foundVacationRequestStatuses = latestVacationRequestStatuses.map(
  //     (latestVacationRequestStatus) => {
  //       const foundUpdatedVacationRequestStatus = updatedVacationRequestStatuses.find(
  //         (updatedVacationRequestStatus) =>
  //           updatedVacationRequestStatus.id === latestVacationRequestStatus.id
  //       );
  //       if (foundUpdatedVacationRequestStatus) {
  //         return foundUpdatedVacationRequestStatus;
  //       }
  //       return latestVacationRequestStatus;
  //     }
  //   );
  //
  //   const createdAndFoundVacationRequestStatuses = foundVacationRequestStatuses.concat(
  //     createdVacationRequestStatuses
  //   );
  //   setLatestVacationRequestStatuses(createdAndFoundVacationRequestStatuses);
  // };

  return (
    <>
      {loggedInUser && renderVacationDaysTextForScreen(loggedInUser)}
      <Card sx={{ margin: 0, padding: "10px", width: "100%", height: "100", marginBottom: "16px" }}>
        <VacationRequestsTable
          isUpcoming={isUpcoming}
          toggleIsUpcoming={toggleIsUpcoming}
          deleteVacationRequests={deleteVacationRequests}
          createVacationRequest={createVacationRequest}
          updateVacationRequest={updateVacationRequest}
          // updateVacationRequestStatuses={updateVacationRequest}
          loading={loading}
        />
      </Card>
      <Card sx={{ margin: 0, padding: "10px", width: "100%" }}>
        <Link to={adminMode ? "/admin" : "/"} style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={{ padding: "10px", width: "100%" }}>
            <KeyboardReturn sx={{ marginRight: "10px" }} />
            <Typography>{strings.vacationsScreen.back}</Typography>
          </Button>
        </Link>
      </Card>
    </>
  );
};

export default VacationRequestsScreen;
