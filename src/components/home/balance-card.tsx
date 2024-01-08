import { getHoursAndMinutes } from "../../utils/time-utils";
import { Grid, Typography, Card, CardContent, Skeleton } from "@mui/material";
import strings from "../../localization/strings";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { errorAtom } from "../../atoms/error";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/use-api";
import { Person, PersonTotalTime, Timespan } from "../../generated/client";
import { personsAtom, personTotalTimeAtom, timespanAtom } from "../../atoms/person";
import { Link } from "react-router-dom";
import { userProfileAtom } from "../../atoms/auth";
import config from "../../app/config";
import UserRoleUtils from "../../utils/user-role-utils";
import { theme } from "../../theme";
import { DateTime } from "luxon";

/**
 * Component for displaying user's balance
 */
const BalanceCard = () => {
  const persons = useAtomValue(personsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const [timespan, setTimespan] = useAtom(timespanAtom);
  const { personsApi } = useApi();
  const setError = useSetAtom(errorAtom);
  const [loading, setLoading] = useState(false);
  const [personTotalTime, setPersonTotalTime] = useAtom(personTotalTimeAtom);
  const adminMode = UserRoleUtils.adminMode();
  const yesterday = DateTime.now().minus({ days: 1 });

  /**
   * Initialize logged in person's time data.
   */
  const getPersons = async () => {
    if (!persons.length) {
      setLoading(true);
      const loggedInPerson = persons.find(
        (person: Person) => person.keycloakId === userProfile?.id
      );
      if (loggedInPerson || config.person.id) {
        try {
          const fetchedPerson = await personsApi.listPersonTotalTime({
            personId: loggedInPerson?.id || config.person.id,
            timespan: Timespan.ALL_TIME,
            before: yesterday.toJSDate()
          });
          setPersonTotalTime(fetchedPerson[0]);
        } catch (error) {
          setError(`${strings.error.fetchFailedGeneral}, ${error}`);
        }
      }
      setLoading(false);
    }
  };

  /**
   * Get person total time if it is undefined or set to "all time"
   */
  useEffect(() => {
    if (!personTotalTime || timespan !== Timespan.ALL_TIME) {
      setTimespan(Timespan.ALL_TIME);
      getPersons();
    }
  }, [persons, timespan]);

  /**
   * Renders person's total time
   *
   * @param personTotalTime PersonTotalTime
   */
  const renderPersonTotalTime = (personTotalTime: PersonTotalTime | undefined) => {
    const balanceColor =
      personTotalTime && personTotalTime.balance > 0
        ? theme.palette.success.main
        : theme.palette.error.main;

    if (adminMode) {
      return <Typography>{strings.placeHolder.notYetImplemented}</Typography>;
    } else if (!personTotalTime && !loading && persons.length) {
      return (
        <Typography color={balanceColor}>{strings.error.fetchFailedNoEntriesGeneral}</Typography>
      );
    } else if (personTotalTime) {
      return (
        <Typography color={balanceColor}>{getHoursAndMinutes(personTotalTime.balance)}</Typography>
      );
    }
    return <Skeleton />;
  };

  return (
    <Link
      to={adminMode ? "/admin/timebank/viewall" : "/timebank"}
      style={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          "&:hover": {
            background: "#efefef"
          }
        }}
      >
        {adminMode ? (
          <CardContent>
            <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
              {strings.timebank.employeeBalances}
            </Typography>
            <Typography variant="body1">{strings.timebank.viewAllTimeEntries}</Typography>
          </CardContent>
        ) : (
          <CardContent>
            <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
              {strings.timebank.balance}
            </Typography>
            <Grid container>
              <Grid item xs={12}>
                {strings.formatString(strings.timebank.atTheEndOf, yesterday.toLocaleString())}
              </Grid>
              <Grid style={{ marginBottom: 1 }} item xs={1}>
                <ScheduleIcon style={{ marginTop: 1 }} />
              </Grid>
              <Grid item xs={11}>
                {loading ? <Skeleton /> : renderPersonTotalTime(personTotalTime)}
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};

export default BalanceCard;
