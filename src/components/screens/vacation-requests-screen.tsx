import { Card } from "@mui/material";
import type { GridRowId } from "@mui/x-data-grid";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import {
  allVacationRequestsAtom,
  displayedVacationRequestsAtom,
  vacationRequestsAtom
} from "src/atoms/vacation";
import type { User } from "src/generated/homeLambdasClient";
import { type VacationRequest, VacationRequestStatuses } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import UserRoleUtils from "src/utils/user-role-utils";
import { renderVacationDaysTextForScreen } from "src/utils/vacation-days-utils";
import BackButton from "../generics/back-button";
import VacationRequestsTable from "../vacation-requests-table/vacation-requests-table";

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

  const [loading, setLoading] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(true);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  /**
   * Decide if we show upcoming or past vacations
   */
  useEffect(() => {
    isUpcoming
      ? setDisplayedVacationRequests(upcomingVacationRequests)
      : setDisplayedVacationRequests(pastVacationRequests);
  }, [isUpcoming, vacationRequests]);

  /**
   * Handler for upcoming/ past vacations toggle click
   */
  const toggleIsUpcoming = () => {
    setIsUpcoming(!isUpcoming);
  };

  /**
   * Fetch vacation requests
   */
  const fetchVacationsRequests = async () => {
    if (!loggedInUser) return;
    setLoading(true);
    try {
      let fetchedVacationRequests: VacationRequest[];
      if (adminMode) {
        fetchedVacationRequests = await vacationRequestsApi.listVacationRequests({});
      } else {
        fetchedVacationRequests = await vacationRequestsApi.listVacationRequests({
          userId: loggedInUser.id
        });
      }
      setVacationRequests(fetchedVacationRequests);
    } catch (error) {
      setError(`${strings.vacationRequestError.fetchRequestError}, ${error}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVacationsRequests();
  }, [loggedInUser, isUpcoming]);

  /**
   * Delete vacation requests
   *
   * @param selectedRowIds GridRowId[] a list of Ids of selected rows (vacation requests)
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

  /**
   * Create a vacation request
   *
   * @param vacationRequestData vacation data from the create form
   */
  const createVacationRequest = async (vacationRequestData: VacationRequest) => {
    if (!loggedInUser) return;
    try {
      setLoading(true);
      const createdRequest = await vacationRequestsApi.createVacationRequest({
        vacationRequest: {
          userId: loggedInUser.id,
          startDate: vacationRequestData.startDate,
          endDate: vacationRequestData.endDate,
          type: vacationRequestData.type,
          message: vacationRequestData.message,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: loggedInUser?.id,
          days: vacationRequestData.days,
          draft: false,
          status: [
            {
              createdBy: loggedInUser.id,
              updatedAt: new Date(),
              status: VacationRequestStatuses.PENDING
            }
          ]
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
   * @param vacationRequestData vacation request data from the update form
   * @param vacationRequestId vacation request id
   */
  const updateVacationRequest = async (
    vacationRequestData: VacationRequest,
    vacationRequestId: string
  ) => {
    if (!loggedInUser) return;
    try {
      setLoading(true);
      const vacationRequest = vacationRequests.find(
        (vacationRequest) => vacationRequest.id === vacationRequestId
      );
      if (!vacationRequest) return;

      let latestStatus = vacationRequest.status?.[0]?.status ?? "PENDING";
      if (!latestStatus) {
        setError(strings.vacationRequestError.noVacationRequestsStatusFound);
      }
      if ((!adminMode && latestStatus === "APPROVED") || latestStatus === "DECLINED") {
        latestStatus = "PENDING";
      }
      const newOrUpdatedStatus = {
        status: latestStatus,
        createdBy: loggedInUser.id,
        updatedAt: new Date()
      };
      const updatedStatus = [newOrUpdatedStatus];

      const updatedRequest = await vacationRequestsApi.updateVacationRequest({
        id: vacationRequestId,
        vacationRequest: {
          ...vacationRequest,
          startDate: vacationRequestData.startDate,
          endDate: vacationRequestData.endDate,
          type: vacationRequestData.type,
          message: vacationRequestData.message,
          updatedAt: new Date(),
          days: vacationRequestData.days,
          status: updatedStatus
        }
      });
      const updatedVacationRequests = vacationRequests.map((vacationRequest) =>
        vacationRequest.id === updatedRequest.id ? updatedRequest : vacationRequest
      );
      setVacationRequests(updatedVacationRequests);
    } catch (error) {
      setError(`${strings.vacationRequestError.updateRequestError}, ${error}`);
    }
    setLoading(false);
  };

  /**
   * Update a vacation request status
   *
   * @param status VacationRequestStatus value for the new status
   * @param selectedRowIds GridRowId[] list of Ids of selected rows(vacation requests)
   */
  const updateVacationRequestStatus = async (
    status: VacationRequestStatuses,
    selectedRowIds: GridRowId[]
  ) => {
    if (!loggedInUser) return;
    try {
      setLoading(true);
      const updatedVacationRequests = await Promise.all(
        selectedRowIds.map(async (vacationRequestId) => {
          const vacationRequest = vacationRequests.find(
            (vacationRequest) => vacationRequest.id === vacationRequestId
          );
          if (!vacationRequest) return;
          const newOrUpdatedStatus = {
            status,
            createdBy: loggedInUser.id,
            updatedAt: new Date()
          };
          const updatedStatus = [newOrUpdatedStatus];
          return vacationRequestsApi.updateVacationRequest({
            id: vacationRequestId.toString(),
            vacationRequest: {
              ...vacationRequest,
              status: updatedStatus
            }
          });
        })
      );

      setVacationRequests((prevRequests) =>
        prevRequests.map(
          (vacationRequest) =>
            updatedVacationRequests.find((req) => req?.id === vacationRequest.id) || vacationRequest
        )
      );
    } catch (error) {
      setError(`${strings.vacationRequestError.updateRequestError}, ${error}`);
    }
    setLoading(false);
  };

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
          updateVacationRequestStatus={updateVacationRequestStatus}
          loading={loading}
        />
      </Card>
      <BackButton styles={{ mt: 2, marginBottom: 2 }} />
    </>
  );
};

export default VacationRequestsScreen;
