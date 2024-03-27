import { Grid, Card, CardContent, Skeleton, Typography, Box } from "@mui/material";
import strings from "../../localization/strings";
import { Link } from "react-router-dom";
import LuggageIcon from "@mui/icons-material/Luggage";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import { useState, useMemo } from "react";
import { userProfileAtom } from "../../atoms/auth";
import { errorAtom } from "../../atoms/error";
import {
  VacationRequest,
  VacationRequestStatus,
  VacationRequestStatuses,
  Person
} from "../../generated/client";
import { useApi } from "../../hooks/use-api";
import { DateTime } from "luxon";
import LocalizationUtils from "../../utils/localization-utils";
import {
  allVacationRequestsAtom,
  allVacationRequestStatusesAtom,
  vacationRequestsAtom,
  vacationRequestStatusesAtom
} from "../../atoms/vacation";
import { getVacationRequestStatusColor } from "../../utils/vacation-status-utils";
import UserRoleUtils from "../../utils/user-role-utils";
import { Check, Pending } from "@mui/icons-material";
import { personsAtom } from "../../atoms/person";
import { getVacationRequestPersonFullName } from "../../utils/vacation-request-utils";
import { validateValueIsNotUndefinedNorNull } from "../../utils/check-utils";
import { VacationInfoListItem } from "../../types";
import { formatDate } from "../../utils/time-utils";
import config from "../../app/config";
// TODO: Component is commented out due backend calculations about vacation days being incorrect. Once the error is fixed, introduce the text components back in the code.
// import { renderVacationDaysTextForCard } from "../../utils/vacation-days-utils";

/**
 * Vacations card component
 */
const VacationsCard = () => {
  const adminMode = UserRoleUtils.adminMode();
  const { vacationRequestsApi, vacationRequestStatusApi } = useApi();
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [vacationRequests, setVacationRequests] = useAtom(
    adminMode ? allVacationRequestsAtom : vacationRequestsAtom
  );
  const [latestVacationRequestStatuses, setLatestVacationRequestStatuses] = useAtom(
    adminMode ? allVacationRequestStatusesAtom : vacationRequestStatusesAtom
  );
  const [loading, setLoading] = useState(false);
  const [persons] = useAtom(personsAtom);
  const loggedInPerson = persons.find(
    (person: Person) => person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  );

  /**
   * Fetch vacation request statuses
   */
  const fetchVacationRequestStatuses = async () => {
    if (vacationRequests.length && !latestVacationRequestStatuses.length) {
      try {
        setLoading(true);
        const vacationRequestStatuses: VacationRequestStatus[] = [];

        await Promise.all(
          vacationRequests.map(async (vacationRequest) => {
            let createdStatuses: VacationRequestStatus[] = [];
            if (vacationRequest.id) {
              createdStatuses = await vacationRequestStatusApi.listVacationRequestStatuses({
                id: vacationRequest.id
              });
            }
            createdStatuses.forEach((createdStatus) => {
              vacationRequestStatuses.push(createdStatus);
            });
          })
        );
        await filterLatestVacationRequestStatuses(vacationRequestStatuses);
      } catch (error) {
        setError(`${strings.vacationRequestError.fetchStatusError}, ${error}`);
      }
    }
  };

  useMemo(() => {
    fetchVacationRequestStatuses();
  }, [vacationRequests]);

  /**
   * Filter latest vacation request statuses, so there would be only one status(the latest one) for each request showed on the UI
   */
  const filterLatestVacationRequestStatuses = async (
    vacationRequestStatuses: VacationRequestStatus[]
  ) => {
    if (vacationRequests.length && vacationRequestStatuses.length) {
      const selectedLatestVacationRequestStatuses: VacationRequestStatus[] = [];

      vacationRequests.forEach((vacationRequest) => {
        const selectedVacationRequestStatuses: VacationRequestStatus[] = [];

        vacationRequestStatuses.forEach((vacationRequestStatus) => {
          if (vacationRequest.id === vacationRequestStatus.vacationRequestId) {
            selectedVacationRequestStatuses.push(vacationRequestStatus);
          }
        });

        if (selectedVacationRequestStatuses.length) {
          const latestStatus = selectedVacationRequestStatuses.reduce((a, b) => {
            if (a.updatedAt && b.updatedAt) {
              return a.updatedAt > b.updatedAt ? a : b;
            } else if (a.updatedAt) {
              return a;
            }
            return b;
          });
          selectedLatestVacationRequestStatuses.push(latestStatus);
        }
      });
      setLatestVacationRequestStatuses(selectedLatestVacationRequestStatuses);
    }
    setLoading(false);
  };

  /**
   * Fetch vacation requests
   */
  const fetchVacationsRequests = async () => {
    setLoading(true);
    if (!loggedInPerson) return;

    if (!vacationRequests.length) {
      try {
        let fetchedVacationRequests: VacationRequest[] = [];
        if (adminMode) {
          fetchedVacationRequests = await vacationRequestsApi.listVacationRequests({});
        } else {
          fetchedVacationRequests = await vacationRequestsApi.listVacationRequests({
            personId: loggedInPerson.keycloakId
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
  }, [loggedInPerson]);

  /**
   * Get pending vacation requests by checking wether it has a status or not
   *
   * @returns pending vacation requests
   */
  const getPendingVacationRequests = () => {
    const pendingVacationRequests = vacationRequests
      .filter(
        (vacationRequest) =>
          vacationRequest &&
          !latestVacationRequestStatuses.find(
            (latestVacationRequestStatus) =>
              latestVacationRequestStatus.vacationRequestId === vacationRequest.id
          )
      )
      .filter(validateValueIsNotUndefinedNorNull);

    return pendingVacationRequests;
  };

  /**
   * Get upcoming vacation requests and filter out declined vacation requests
   *
   * @returns upcoming vacation requests
   */
  const getUpcomingVacationRequests = () => {
    const upcomingVacationRequests = vacationRequests
      .filter(
        (vacationRequest) =>
          vacationRequest &&
          DateTime.fromJSDate(vacationRequest.startDate) > DateTime.now() &&
          !latestVacationRequestStatuses.find(
            (latestVacationRequestStatus) =>
              latestVacationRequestStatus.vacationRequestId === vacationRequest.id &&
              latestVacationRequestStatus.status === VacationRequestStatuses.DECLINED
          )
      )
      .filter(validateValueIsNotUndefinedNorNull);

    return upcomingVacationRequests;
  };

  /**
   * Render vacation info item
   *
   * @param vacationInfoListItem vacation info list item
   * @param index index
   */
  const renderVacationInfoItem = (vacationInfoListItem: VacationInfoListItem, index: number) => (
    <Grid item xs={12} key={`vacations-info-list-item-${index}`}>
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
    let earliestUpcomingVacationRequest: VacationRequest | undefined = undefined;
    let earliestUpcomingVacationRequestStatus: VacationRequestStatuses | undefined;
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

      earliestUpcomingVacationRequestStatus = latestVacationRequestStatuses.find(
        (vacationRequestStatus) =>
          earliestUpcomingVacationRequest &&
          earliestUpcomingVacationRequest.id === vacationRequestStatus.vacationRequestId
      )?.status;

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
            persons,
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
          value: earliestUpcomingVacationRequestStatus ? (
            <span
              style={{
                color: getVacationRequestStatusColor(earliestUpcomingVacationRequestStatus)
              }}
            >
              {LocalizationUtils.getLocalizedVacationRequestStatus(
                earliestUpcomingVacationRequestStatus
              )}
            </span>
          ) : (
            <span
              style={{
                color: getVacationRequestStatusColor(VacationRequestStatuses.PENDING)
              }}
            >
              {strings.vacationRequest.pending}
            </span>
          )
        }
      ];

      return (
        <>
          <Grid item xs={1}>
            <LuggageIcon />
          </Grid>
          <Grid item xs={11}>
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
          <Grid item xs={1}>
            <Pending />
          </Grid>
          <Grid item xs={11}>
            <Skeleton />
          </Grid>
        </>
      );
    }

    return (
      <>
        {adminMode || vacationRequestsCount ? (
          <Grid item xs={1}>
            {vacationRequestsCount ? <Pending /> : <Check />}
          </Grid>
        ) : (
          <></>
        )}
        <Grid item xs={adminMode || vacationRequestsCount ? 11 : 12}>
          {message}
        </Grid>
      </>
    );
  };

  return (
    <Link to={adminMode ? "/admin/vacations" : "/vacations"} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          "&:hover": {
            background: "#efefef"
          }
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
            {adminMode ? strings.tableToolbar.manageRequests : strings.tableToolbar.myRequests}
          </Typography>
          <Grid container>
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", mb: 2 }}>
              {/* TODO: Component is commented out due backend calculations about vacation days being incorrect. Once the error is fixed, introduce the text components back in the code. */}
              {/* {loggedInPerson && renderVacationDaysTextForCard(loggedInPerson)} */}
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
