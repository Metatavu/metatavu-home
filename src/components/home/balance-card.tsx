
import { Grid, Typography, Card, CardContent, Skeleton } from "@mui/material";
import strings from "src/localization/strings";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { errorAtom } from "src/atoms/error";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";



import { Link } from "react-router-dom";
import { userProfileAtom } from "src/atoms/auth";

import UserRoleUtils from "src/utils/user-role-utils";

import { DateTime } from "luxon";
import { useLambdasApi } from "src/hooks/use-api";
import type { User } from "src/generated/homeLambdasClient/models/User";
import { usersAtom } from "src/atoms/user";
import { type Flextime, FlexTimeApi } from "src/generated/homeLambdasClient";

/**
 * Component for displaying user's balance
 */
const BalanceCard = () => {
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const { flexTimeApi } = useLambdasApi();
  const setError = useSetAtom(errorAtom);
  const [loading, setLoading] = useState(false);
  const [ usersFlextime, setUsersFlextime ] = useState<Flextime[]>([]);
  const adminMode = UserRoleUtils.adminMode();
  const yesterday = DateTime.now().minus({ days: 1 });

  /**
   * Initialize logged in users's time data.
   */
  const getPersons = async () => {
    setLoading(true);
    const loggedInPerson = users.find(
      (users: User) =>
        users.id === userProfile?.id
    );
    if (loggedInPerson) {
      try {
        const fetchedUsersFlextime = await flexTimeApi.getFlextimeBySeveraUserId({
          severaUserId: loggedInPerson?.severaUserId,
          eventDate: yesterday.toJSDate()
        });

        setUsersFlextime(fetchedUsersFlextime);

        console.log(fetchedUsersFlextime);
      } catch (error) {
        setError(`${strings.error.fetchFailedGeneral}, ${error}`);
      }
    }
    setLoading(false);
  };

  /**
   * Renders users's total time
   *
   * @param personTotalTime PersonTotalTime
   */
  const renderUsersFlextime = () => {
    const userFlextime = usersFlextime[0];
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
                {loading ? <Skeleton /> : renderUsersFlextime()}
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};

export default BalanceCard;
