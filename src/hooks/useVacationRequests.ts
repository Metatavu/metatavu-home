import type { GridRowId } from "@mui/x-data-grid";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import { vacationRequestsAtom } from "src/atoms/vacation";
import {
  type User,
  type VacationRequest,
  VacationRequestStatuses
} from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { getVacationYear, validateUserVacationRequest } from "src/utils/vacations-utils";
import { useLambdasApi } from "./use-api";
import { useSnackbar } from "./use-snackbar";
import useUserRole from "./use-user-role";

/**
 * Custom hook for managing vacation requests.
 *
 * Provides functionality for fetching, creating, updating, deleting,
 * and changing the status of vacation requests. The available requests
 * depend on the current user's role: administrators can access all
 * requests, while regular users only access their own requests.
 *
 * The hook also manages loading and error states and keeps the global
 * vacation request and user atoms up to date after changes.
 *
 * @returns Vacation request management functions, current requests,
 * logged-in user, and loading state.
 */
const useVacationRequests = () => {
  const { adminMode } = useUserRole();
  const { vacationRequestsApi } = useLambdasApi();
  const { usersApi } = useLambdasApi();
  const [vacationRequests, setVacationRequests] = useAtom(vacationRequestsAtom);
  const setError = useSetAtom(errorAtom);
  const showSnackbar = useSnackbar();
  const [users, setUsers] = useAtom(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const currentYear = getVacationYear().toString();

  const [loading, setLoading] = useState(false);

  const fetchRequests = async (): Promise<VacationRequest[]> => {
    if (!loggedInUser) return [];

    return adminMode
      ? vacationRequestsApi.listVacationRequests({})
      : vacationRequestsApi.listVacationRequests({
          userId: loggedInUser.id
        });
  };

  /**
   * Fetch vacation requests
   */
  const fetchVacationsRequests = async () => {
    if (!loggedInUser) return;
    setLoading(true);

    try {
      const fetchedVacationRequests = await fetchRequests();
      setVacationRequests(fetchedVacationRequests);
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.vacationRequestError.fetchRequestError}: ${errorMessage?.message || error}`
      );
    }
    setLoading(false);
  };

  /**
   * Fetch a single vacation request by ID for the logged-in user (or admin)
   *
   * @param vacationRequestId string ID of the vacation request
   * @returns VacationRequest | null
   */
  const fetchVacationRequestById = async (
    vacationRequestId: string
  ): Promise<VacationRequest | null> => {
    if (!loggedInUser) return null;

    setLoading(true);

    try {
      const fetchedVacationRequests = await fetchRequests();

      const vacationRequest = fetchedVacationRequests.find(
        (request) => request.id === vacationRequestId
      );

      if (!vacationRequest) {
        setError(strings.vacationRequestError.fetchRequestError);
        return null;
      }

      return vacationRequest;
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.vacationRequestError.fetchRequestError}: ${errorMessage?.message || error}`
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

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
          } catch (error: any) {
            const errorMessage = await error?.response?.json();
            setError(
              `${strings.vacationRequestError.deleteRequestError}: ${errorMessage?.message || error}`
            );
          }
          setLoading(false);
        })
      );
      setVacationRequests(updatedVacationRequests);

      showSnackbar(strings.snackbar.vacationRequestDeleted);
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
      if (
        !validateUserVacationRequest(
          loggedInUser,
          vacationRequestData,
          currentYear,
          setError,
          setLoading
        )
      ) {
        return;
      }
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
      showSnackbar(strings.snackbar.vacationRequestCreated);
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.vacationRequestError.createRequestError}: ${errorMessage?.message || error}`
      );
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

      if (status === VacationRequestStatuses.APPROVED) {
        for (const vacationRequestId of selectedRowIds) {
          const vacationRequest = vacationRequests.find((req) => req.id === vacationRequestId);

          if (!vacationRequest) continue;

          const selectedUser = await usersApi.findUser({ userId: vacationRequest.userId });

          const isValid = validateUserVacationRequest(
            selectedUser,
            vacationRequest,
            currentYear,
            setError,
            setLoading,
            adminMode
          );

          if (!isValid) {
            return;
          }
        }
      }

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
      // Refresh user data to get updated remaining vacation days.
      const updatedUser = await usersApi.findUser({ userId: loggedInUser.id });
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      showSnackbar(strings.snackbar.vacationRequestStatusUpdated);
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.vacationRequestError.updateRequestError}: ${errorMessage?.message || error}`
      );
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
      const selectedUser = await usersApi.findUser({ userId: vacationRequest.userId });

      if (
        !validateUserVacationRequest(
          selectedUser,
          vacationRequestData,
          currentYear,
          setError,
          setLoading,
          adminMode
        )
      ) {
        return;
      }

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
          status: updatedStatus,
          draft: false
        }
      });
      const updatedVacationRequests = vacationRequests.map((vacationRequest) =>
        vacationRequest.id === updatedRequest.id ? updatedRequest : vacationRequest
      );
      setVacationRequests(updatedVacationRequests);
      showSnackbar(strings.snackbar.vacationRequestUpdated);
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.vacationRequestError.updateRequestError}: ${errorMessage?.message || error}`
      );
    }
    setLoading(false);
  };

  return {
    fetchVacationsRequests,
    createVacationRequest,
    updateVacationRequest,
    updateVacationRequestStatus,
    deleteVacationRequests,
    fetchVacationRequestById,
    loading,
    vacationRequests,
    loggedInUser
  };
};

export default useVacationRequests;
