import { Check, Pending } from "@mui/icons-material";
import LuggageIcon from "@mui/icons-material/Luggage";
import { Box, Card, CardContent, Grid, Skeleton, Typography, useTheme } from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user.ts";
import { allVacationRequestsAtom, vacationRequestsAtom } from "src/atoms/vacation";
import type { User } from "src/generated/homeLambdasClient";
import { type VacationRequest, VacationRequestStatuses } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import type { VacationInfoListItem } from "src/types";
import { validateValueIsNotUndefinedNorNull } from "src/utils/check-utils";
import LocalizationUtils from "src/utils/localization-utils";
import { formatDate } from "src/utils/time-utils";
import { renderVacationDaysTextForCard } from "src/utils/vacation-days-utils";
import { getVacationRequestPersonFullName } from "src/utils/vacation-request-utils";
import {
  getTotalVacationRequestStatus,
  getVacationRequestStatusColor
} from "src/utils/vacation-status-utils";

/**
 * Vacations card component
 */
const VacationsCard = () => {
  const theme = useTheme();
  const { adminMode } = useUserRole();
  const { vacationRequestsApi } = useLambdasApi();
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [vacationRequests, setVacationRequests] = useAtom(
    adminMode ? allVacationRequestsAtom : vacationRequestsAtom
  );
  const [loading, setLoading] = useState(false);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  /**
   * Fetch vacations request
   */
  const fetchVacationsRequests = async () => {
    if (!loggedInUser) return;
    setLoading(true);
    try {
      const fetchedVacationRequests: VacationRequest[] = adminMode
        ? await vacationRequestsApi.listVacationRequests({})
        : await vacationRequestsApi.listVacationRequests({ userId: loggedInUser.id });
      setVacationRequests(fetchedVacationRequests);
    } catch (error) {
      setError(`${strings.vacationRequestError.fetchRequestError}, ${error}`);
    } finally {
      setLoading(false);
    }
  };
  useMemo(() => {
    fetchVacationsRequests();
  }, [loggedInUser]);

  /**
   * Get pending vacation requests by checking whether any of its statuses are approved, declined or draft
   *
   * @returns pending vacation requests
   */
  const getPendingVacationRequests = () => {
    return vacationRequests
      .filter(
        (vacationRequest) =>
          vacationRequest.draft !== true &&
          vacationRequest.status?.every(
            (status) =>
              status.status !== VacationRequestStatuses.APPROVED &&
              status.status !== VacationRequestStatuses.DECLINED
          )
      )
      .filter(validateValueIsNotUndefinedNorNull);
  };

  /**
   * Get upcoming vacation requests and filter out declined/draft vacation requests
   *
   * @returns upcoming vacation requests
   */
  const getUpcomingVacationRequests = () => {
    return vacationRequests
      .filter(
        (vacationRequest) =>
          vacationRequest.draft !== true &&
          DateTime.fromJSDate(vacationRequest.startDate) > DateTime.now() &&
          !vacationRequest.status?.some(
            (status) => status.status === VacationRequestStatuses.DECLINED
          )
      )
      .filter(validateValueIsNotUndefinedNorNull);
  };

  /**
   * Render vacation info item
   *
   * @param vacationInfoListItem vacation info list item
   * @param index index
   */
  const renderVacationInfoItem = (vacationInfoListItem: VacationInfoListItem, index: number) => (
    <Grid key={`vacations-info-list-item-${index}`} size={12}>
      <Box sx={{ display: "flex" }}>
        <Typography sx={{ flex: 1 }}>{vacationInfoListItem.name}</Typography>
        <Typography sx={{ flex: 1 }}>{vacationInfoListItem.value}</Typography>
      </Box>
    </Grid>
  );

  /**
   * Render the earliest upcoming vacation request
   */
  const renderEarliestUpcomingVacationRequest = () => {
    let earliestUpcomingVacationRequest: VacationRequest | undefined;
    let upcomingVacationRequests = getUpcomingVacationRequests();

    if (upcomingVacationRequests.length) {
      upcomingVacationRequests = upcomingVacationRequests.filter(
        validateValueIsNotUndefinedNorNull
      );

      earliestUpcomingVacationRequest = upcomingVacationRequests.reduce((vacationA, vacationB) =>
        DateTime.fromJSDate(vacationA.startDate) > DateTime.fromJSDate(vacationB.startDate)
          ? vacationB
          : vacationA
      );

      const vacationInfoListItems: VacationInfoListItem[] = [
        {
          name: strings.vacationsCard.vacationType,
          value: LocalizationUtils.getLocalizedVacationRequestType(
            earliestUpcomingVacationRequest.type
          )
        },
        {
          name: strings.vacationsCard.applicant,
          value: getVacationRequestPersonFullName(
            earliestUpcomingVacationRequest,
            users,
            userProfile
          )
        },
        {
          name: strings.vacationsCard.timeOfVacation,
          value: `${formatDate(
            DateTime.fromJSDate(earliestUpcomingVacationRequest.startDate)
          )} - ${formatDate(DateTime.fromJSDate(earliestUpcomingVacationRequest.endDate))}`
        },
        {
          name: strings.vacationsCard.status,
          value: earliestUpcomingVacationRequest.status ? (
            <span
              style={{
                color: getVacationRequestStatusColor(
                  getTotalVacationRequestStatus(earliestUpcomingVacationRequest?.status),
                  theme
                )
              }}
            >
              {LocalizationUtils.getLocalizedVacationRequestStatus(
                getTotalVacationRequestStatus(earliestUpcomingVacationRequest?.status)
              )}
            </span>
          ) : (
            <span
              style={{
                color: getVacationRequestStatusColor(VacationRequestStatuses.PENDING, theme)
              }}
            >
              {strings.vacationRequest.pending}
            </span>
          )
        }
      ];

      return (
        <>
          <Grid size={1}>
            <LuggageIcon />
          </Grid>
          <Grid size={11}>
            <Box>
              {earliestUpcomingVacationRequest &&
                DateTime.fromJSDate(earliestUpcomingVacationRequest.startDate) > DateTime.now() && (
                  <>
                    <Typography fontWeight={"bold"}>
                      {`${strings.vacationsCard.nextUpcomingVacation}`}
                    </Typography>
                    <Grid container>
                      {vacationInfoListItems.map((vacationInfoListItem, index) =>
                        renderVacationInfoItem(vacationInfoListItem, index)
                      )}
                    </Grid>
                  </>
                )}
            </Box>
          </Grid>
        </>
      );
    }
    return;
  };

  /**
   * Render upcoming vacation requests count if not admin mode
   * Render pending vacation requests count if admin mode
   */
  const renderUpcomingOrPendingVacationRequestsCount = () => {
    const vacationRequestsCount = adminMode
      ? getPendingVacationRequests().length
      : getUpcomingVacationRequests().length;
    let message: string | (string | number)[] = adminMode
      ? strings.vacationsCard.noPendingVacations
      : strings.vacationsCard.noUpcomingVacations;

    if (vacationRequestsCount) {
      if (adminMode) {
        message = strings.formatString(
          strings.vacationsCard.pendingVacations,
          vacationRequestsCount
        );
      } else {
        message = strings.formatString(
          strings.vacationsCard.upComingVacations,
          vacationRequestsCount
        );
      }
    }

    if (loading) {
      return (
        <>
          <Grid size={1}>
            <Pending />
          </Grid>
          <Grid size={11}>
            <Skeleton />
          </Grid>
        </>
      );
    }

    return (
      <>
        {adminMode || vacationRequestsCount ? (
          <Grid size={1}>{vacationRequestsCount ? <Pending /> : <Check />}</Grid>
        ) : null}
        <Grid size={adminMode || vacationRequestsCount ? 11 : 12}>{message}</Grid>
      </>
    );
  };

  return (
    <Link to={adminMode ? "/admin/vacations" : "/vacations"} style={{ textDecoration: "none" }}>
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
            {adminMode ? strings.tableToolbar.manageRequests : strings.tableToolbar.myRequests}
          </Typography>
          <Grid container>
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", mb: 2 }}>
              {loggedInUser && renderVacationDaysTextForCard(loggedInUser, theme)}
            </Box>
            {renderUpcomingOrPendingVacationRequestsCount()}
            {renderEarliestUpcomingVacationRequest()}
          </Grid>
        </CardContent>
      </Card>
    </Link>
  );
};

export default VacationsCard;
