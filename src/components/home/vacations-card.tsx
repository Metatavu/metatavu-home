import { Box, Grid, Skeleton, Typography, useTheme } from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user.ts";
import { vacationRequestsAtom } from "src/atoms/vacation";
import type { User } from "src/generated/homeLambdasClient";
import { type VacationRequest, VacationRequestStatuses } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import type { VacationInfoListItem } from "src/types";
import { validateValueIsNotUndefinedNorNull } from "src/utils/check-utils";
import LocalizationUtils from "src/utils/localization-utils";
import { formatDate } from "src/utils/time-utils";
import { getTotalVacationRequestStatus } from "src/utils/vacation-status-utils";
import { PillBadge } from "../generics/badges";
import HomepageCard, { type CardProps } from "../generics/homepageCard";

/**
 * Vacations card component.
 *
 * Shows the number of upcoming vacation requests for the logged in user.
 * Also shows the earliest upcoming vacation request for the logged in user.
 *
 * @param props.hidden - Boolean indicating if card is hidden
 * @param props.onToggleHidden - Functionality for changing card visibility
 * @param props.editmode - Boolean indicating if editmode is on
 *
 * @returns Styled card showing vacation information for the logged in user
 */
const VacationsCard = ({ hidden, onToggleHidden, editmode }: CardProps) => {
  const theme = useTheme();
  const { vacationRequestsApi } = useLambdasApi();
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [vacationRequests, setVacationRequests] = useAtom(vacationRequestsAtom);
  const [loading, setLoading] = useState(false);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const path = "/vacations";
  /**
   * Fetch vacation requests
   */
  const fetchVacationsRequests = async () => {
    if (!loggedInUser) return;
    setLoading(true);
    try {
      const fetchedVacationRequests: VacationRequest[] =
        await vacationRequestsApi.listVacationRequests({ userId: loggedInUser.id });
      setVacationRequests(fetchedVacationRequests);
    } catch (error: any) {
      const errorMessage = await error.response.json();
      setError(`${strings.vacationRequestError.fetchRequestError}, ${errorMessage.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVacationsRequests();
  }, [loggedInUser]);

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
      <Box
        sx={{
          display: "flex",
          direction: "row",
          gap: theme.spaces.s,
          mt: theme.spaces.xs,
          alignItems: "center"
        }}
      >
        <Typography component="div" variant="body" sx={{ fontWeight: 500 }}>
          {vacationInfoListItem.name}
        </Typography>
        <Typography component="div">{vacationInfoListItem.value}</Typography>
      </Box>
    </Grid>
  );

  /**
   * Render the earliest upcoming vacation request
   */
  const renderEarliestUpcomingVacationRequest = () => {
    let earliestUpcomingVacationRequest: VacationRequest | undefined;
    let upcomingVacationRequests = getUpcomingVacationRequests();

    const isInFuture =
      earliestUpcomingVacationRequest &&
      DateTime.fromJSDate(earliestUpcomingVacationRequest.startDate) > DateTime.now();

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
          name: strings.vacationsCard.timeOfVacation,
          value: `${formatDate(
            DateTime.fromJSDate(earliestUpcomingVacationRequest.startDate)
          )} - ${formatDate(DateTime.fromJSDate(earliestUpcomingVacationRequest.endDate))}`
        },
        {
          name: strings.vacationsCard.status,
          value: earliestUpcomingVacationRequest?.status && (
            <PillBadge
              variant="approvalBadge"
              status={getTotalVacationRequestStatus(earliestUpcomingVacationRequest.status)}
              hidden={hidden}
            >
              {LocalizationUtils.getLocalizedVacationRequestStatus(
                getTotalVacationRequestStatus(earliestUpcomingVacationRequest.status)
              )}
            </PillBadge>
          )
        }
      ];

      return (
        <Box>
          {isInFuture && (
            <Grid container>
              {vacationInfoListItems.map((vacationInfoListItem, index) =>
                renderVacationInfoItem(vacationInfoListItem, index)
              )}
            </Grid>
          )}
        </Box>
      );
    }
    return;
  };

  /**
   * Render upcoming vacation requests count
   */
  const renderUpcomingOrPendingVacationRequestsCount = () => {
    const vacationRequestsCount = getUpcomingVacationRequests().length;
    let message: string | (string | number)[] = strings.vacationsCard.noUpcomingVacations;

    if (vacationRequestsCount) {
      message = strings.formatString(
        strings.vacationsCard.upComingVacations,
        vacationRequestsCount
      );
    }

    if (loading) {
      return (
        <>
          <Grid size={1}></Grid>
          <Grid size={11}>
            <Skeleton />
          </Grid>
        </>
      );
    }

    return <Grid size={vacationRequestsCount ? 11 : 12}>{message}</Grid>;
  };

  const renderVacationCard = () => {
    return (
      <Grid container sx={{
        gap: theme.spaces.xs
      }}>
        <Typography variant="caption" sx={{ textWrap: "nowrap", pt: theme.spaces.s }}>
          {renderUpcomingOrPendingVacationRequestsCount()}
        </Typography>
        {renderEarliestUpcomingVacationRequest()}
      </Grid>
    );
  };

  return (
    <HomepageCard
      title={strings.vacationsCard.vacations}
      content={renderVacationCard()}
      path={path}
      hidden={hidden}
      onToggleHidden={onToggleHidden}
      editmode={editmode}
    />
  );
};

export default VacationsCard;
