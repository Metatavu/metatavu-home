import type { GridRowId } from "@mui/x-data-grid";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
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
import { useSnackbar } from "src/hooks/use-snackbar";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import type { FilterType } from "src/utils/vacation-filter-type";
import { getVacationYear, validateUserVacationRequest } from "src/utils/vacations-utils";
import type { Tab } from "../generics/tabBar";
import VacationRequestsTable from "../vacation-requests-table/vacation-requests-table";

/**
 * Vacation requests screen
 */
const VacationRequestsScreen = () => {
  const { adminMode } = useUserRole();
  const { vacationRequestsApi } = useLambdasApi();
  const { usersApi } = useLambdasApi();
  const userProfile = useAtomValue(userProfileAtom);
  const [users, setUsers] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const setError = useSetAtom(errorAtom);
  const [vacationRequests, setVacationRequests] = useAtom(
    adminMode ? allVacationRequestsAtom : vacationRequestsAtom
  );
  const setDisplayedVacationRequests = useSetAtom(displayedVacationRequestsAtom);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedId = params.get("selectedId");
  const showSnackbar = useSnackbar();

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
  const [filters, setFilters] = useState<FilterType[]>(["ALL"]);
  const [currentTab, setCurrentTab] = useState<string>(adminMode ? "vacations" : "upcoming");
  const currentYear = getVacationYear().toString();

  const tabs: Tab[] = adminMode
    ? [
        { id: "vacations", title: `${strings.tableToolbar.myRequests} ` },
        { id: "days", title: strings.adminVacationManagement.heading }
      ]
    : [
        { id: "upcoming", title: strings.tableToolbar.future },
        { id: "past", title: strings.tableToolbar.past }
      ];

  useEffect(() => {
    setCurrentTab(adminMode ? "vacations" : "upcoming");
  }, [adminMode]);

  useEffect(() => {
    fetchVacationsRequests();
  }, [currentTab, loggedInUser]);

  /**
   * Handler for upcoming/ past vacations toggle click
   */
  const toggleIsUpcoming = () => {
    setIsUpcoming(!isUpcoming);
  };

  /**
   * Filters a list of vacation requests based on the given filter.
   *
   * @param requests - The list of vacation requests to filter.
   * @param filter - The filter criteria.
   *   - `"ALL"`: Returns all requests (excluding drafts in admin mode).
   *   - `"DRAFT"`: Returns only draft requests.
   *   - A specific `VacationRequestStatuses` value: Returns requests matching that status.
   * @returns The filtered list of vacation requests.
   */
  const filterVacationRequests = (requests: VacationRequest[], filters: FilterType[]) => {
    return requests.filter((request) => {
      if (filters.includes("ALL")) {
        return adminMode ? request.draft !== true : true;
      }
      if (request.draft) {
        return filters.includes("DRAFT");
      }

      const status = request.status?.[0]?.status;

      return status ? filters.includes(status as FilterType) : false;
    });
  };
  /**
   * Decide if we show upcoming or past vacations and apply the selected filter
   */
  useEffect(() => {
    const baseRequests = isUpcoming ? upcomingVacationRequests : pastVacationRequests;
    let filteredRequests = filterVacationRequests(baseRequests, filters);

    if (selectedId) {
      filteredRequests = filteredRequests.filter((req) => req.id === selectedId);
    }

    setDisplayedVacationRequests(filteredRequests);
  }, [isUpcoming, filters, vacationRequests, selectedId]);

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
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.vacationRequestError.fetchRequestError}: ${errorMessage?.message || error}`
      );
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
      const updatedVacationRequests: VacationRequest[] = [];

      for (const vacationRequestId of selectedRowIds) {
        const vacationRequest = vacationRequests.find(
          (vacationRequest) => vacationRequest.id === vacationRequestId
        );

        if (!vacationRequest) continue;

        const newOrUpdatedStatus = {
          status,
          createdBy: loggedInUser.id,
          updatedAt: new Date()
        };

        const updated = await vacationRequestsApi.updateVacationRequest({
          id: vacationRequestId.toString(),
          vacationRequest: {
            ...vacationRequest,
            status: [newOrUpdatedStatus]
          }
        });

        updatedVacationRequests.push(updated);
      }

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

  return (
    <VacationRequestsTable
      toggleIsUpcoming={toggleIsUpcoming}
      deleteVacationRequests={deleteVacationRequests}
      createVacationRequest={createVacationRequest}
      updateVacationRequest={updateVacationRequest}
      updateVacationRequestStatus={updateVacationRequestStatus}
      loading={loading}
      filter={filters}
      setFilter={setFilters}
      tabs={tabs}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      adminMode={adminMode}
    />
  );
};

export default VacationRequestsScreen;
