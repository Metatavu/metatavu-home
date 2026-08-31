import { Box } from "@mui/material";
import { useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { displayedVacationRequestsAtom } from "src/atoms/vacation";
import { type VacationRequest, VacationRequestStatuses } from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import useVacationRequests from "src/hooks/useVacationRequests";
import strings from "src/localization/strings";
import type { FilterType } from "src/utils/vacation-filter-type";
import type { Tab } from "../generics/tabBar";
import VacationRequestsTable from "../vacation-requests-table/vacation-requests-table";
import AdminVacationManagementTable from "./admin-vacation-management/admin-vacation-management-table";

/**
 * Vacation requests screen
 */
const VacationRequestsScreen = () => {
  const {
    fetchVacationsRequests,
    createVacationRequest,
    updateVacationRequest,
    updateVacationRequestStatus,
    deleteVacationRequests,
    loading,
    vacationRequests,
    loggedInUser
  } = useVacationRequests();

  const { adminMode } = useUserRole();
  const pending = vacationRequests.filter((request: VacationRequest) =>
    request.status?.every(
      (status) =>
        status.status !== VacationRequestStatuses.APPROVED &&
        status.status !== VacationRequestStatuses.DECLINED
    )
  ).length;
  const setDisplayedVacationRequests = useSetAtom(displayedVacationRequestsAtom);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedId = params.get("selectedId");

  const upcomingVacationRequests = useMemo(
    () => vacationRequests.filter((request) => request.endDate.getTime() > Date.now()),
    [vacationRequests]
  );
  const pastVacationRequests = useMemo(
    () => vacationRequests.filter((request) => request.endDate.getTime() <= Date.now()),
    [vacationRequests]
  );
  const [isUpcoming, setIsUpcoming] = useState(true);
  const [filters, setFilters] = useState<FilterType[]>(["ALL"]);
  const [currentTab, setCurrentTab] = useState(adminMode ? "days" : "upcoming");
  const showManagement = adminMode && currentTab === "days";
  const adminNotification = pending > 0 ? `(${pending})` : "";
  const tabs: Tab[] = adminMode
    ? [
        { id: "vacations", title: `${strings.tableToolbar.myRequests} ${adminNotification}` },
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
  }, [loggedInUser, currentTab]);

  /**
   * Handler for upcoming/ past vacations toggle click
   */
  const toggleIsUpcoming = () => {
    setIsUpcoming(!isUpcoming);
  };

  /**
   * Filters a list of vacation requests based on the given filters.
   *
   * @param requests - The list of vacation requests to filters.
   * @param filters - The filters criteria.
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
   * Decide if we show upcoming or past vacations and apply the selected filters
   */
  useEffect(() => {
    let baseRequests: VacationRequest[];

    if (adminMode) {
      baseRequests = vacationRequests;
    } else if (isUpcoming) {
      baseRequests = upcomingVacationRequests;
    } else {
      baseRequests = pastVacationRequests;
    }

    let filteredRequests = filterVacationRequests(baseRequests, filters);

    if (selectedId) {
      filteredRequests = filteredRequests.filter((req) => req.id === selectedId);
    }

    setDisplayedVacationRequests(filteredRequests);
  }, [isUpcoming, filters, upcomingVacationRequests, pastVacationRequests, selectedId, adminMode]);

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto"
      }}
    >
      {showManagement ? (
        <AdminVacationManagementTable
          adminMode={adminMode}
          filters={filters}
          setFilters={setFilters}
          tabs={tabs}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />
      ) : (
        <VacationRequestsTable
          toggleIsUpcoming={toggleIsUpcoming}
          deleteVacationRequests={deleteVacationRequests}
          createVacationRequest={createVacationRequest}
          updateVacationRequest={updateVacationRequest}
          updateVacationRequestStatus={updateVacationRequestStatus}
          loading={loading}
          filters={filters}
          setFilters={setFilters}
          tabs={tabs}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          adminMode={adminMode}
        />
      )}
    </Box>
  );
};

export default VacationRequestsScreen;
