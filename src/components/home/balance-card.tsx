import { Grid, Typography, Card, CardContent, Skeleton } from "@mui/material";
import strings from "src/localization/strings";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { errorAtom } from "src/atoms/error";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userProfileAtom } from "src/atoms/auth";
import UserRoleUtils from "src/utils/user-role-utils";
import { DateTime } from "luxon";
import { usersAtom } from "src/atoms/user";
import type { Flextime } from "src/generated/homeLambdasClient";
import type { User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import { getSeveraUserId } from "src/utils/user-utils";

/**
 * Component for displaying user's balance
 */
const BalanceCard = () => {
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [loading, setLoading] = useState(false);
  const adminMode = UserRoleUtils.adminMode();
  const [usersFlextime, setUsersFlextime] = useState<Flextime>();
  const yesterday = DateTime.now().minus({ days: 1 });
  const { flexTimeApi } = useLambdasApi();
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const severaUserId = getSeveraUserId(loggedInUser);

  /**
   * Fetch user's flextime data when it is undefined.
   */
  useEffect(() => {
    // This card shows admin links if adminMode is true, not personal flextime for the admin themselves.
    // So, only fetch if not adminMode and flextime data is not yet available.
    if (!adminMode && !usersFlextime) {
      getUsersFlextimes();
    } else if (adminMode) {
      // If in admin mode, we are not displaying personal flextime, so ensure loading is false.
      setLoading(false);
    }
    // Adding usersFlextime to dependencies to prevent re-fetch if data is already loaded.
    // Adding adminMode to control fetching based on user role.
    // loggedInUser and severaUserId are derived from users and userProfile, which are in the original deps or implied.
  }, [users, userProfile, adminMode, usersFlextime]);

  /**
   * Initialize logged in users's time data.
   */
  const getUsersFlextimes = async () => {
    setLoading(true);
    // Only proceed if loggedInUser exists and has a valid severaUserId
    if (loggedInUser && severaUserId) {
      try {
        const fetchedUsersFlextime = await flexTimeApi.getFlextimeBySeveraUserId({
          severaUserId
        });
        setUsersFlextime(fetchedUsersFlextime);
      } catch (error) {
        setError(`${strings.error.fetchFailedFlextime}, ${error}`);
      } finally {
        setLoading(false); // Ensure loading is set to false after the try/catch block
      }
    } else {
      // If loggedInUser exists, is not in adminMode, but severaUserId is missing, set a specific error.
      if (loggedInUser && !severaUserId && !adminMode) {
        setError(strings.error.noSeveraUserId);
      }
      setLoading(false); // Conditions for API call not met, ensure loading is false.
    }
  };

  /**
   * Render user's flextime data.
   */
  const renderUserFlextime = () => {
    if (!usersFlextime?.totalFlextimeBalance) {
      return <Typography variant="body1">{strings.error.noFlextimeData}</Typography>;
    }
    const totalFlextimeBalance = usersFlextime.totalFlextimeBalance;
    const textColor = totalFlextimeBalance >= 0 ? "green" : "red";
    const hourLabel =
      totalFlextimeBalance === 1 ? strings.balanceCard.hour : strings.balanceCard.hours;

    return (
      <Typography variant="body1">
        {strings.balanceCard.totalFlextimeBalance}{" "}
        <span style={{ color: textColor }}>{totalFlextimeBalance}</span> {hourLabel}
      </Typography>
    );
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
              {strings.balanceCard.employeeBalances}
            </Typography>
            <Typography variant="body1">{strings.balanceCard.viewAllTimeEntries}</Typography>
          </CardContent>
        ) : (
          <CardContent>
            <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
              {strings.balanceCard.balance}
            </Typography>
            <Grid container>
              <Grid item xs={12}>
                {strings.formatString(strings.balanceCard.atTheEndOf, yesterday.toLocaleString())}
              </Grid>
              <Grid style={{ marginBottom: 1 }} item xs={1}>
                <ScheduleIcon style={{ marginTop: 1 }} />
              </Grid>
              <Grid item xs={11}>
                {loading ? <Skeleton /> : renderUserFlextime()}
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};

export default BalanceCard;
