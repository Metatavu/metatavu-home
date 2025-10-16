import ScheduleIcon from "@mui/icons-material/Schedule";
import { Card, CardContent, Grid, Skeleton, Typography } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type { Flextime, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { getSeveraUserId } from "src/utils/user-utils";

/**
 * Card component that displays either personal flextime balance for regular users
 * or provides admin access to view all employees' flextime data in the same tab.
 *
 * @component
 * @returns React functional component that renders a balance card
 *
 * @description
 * - For regular users: Shows personal flextime balance with link to timebank
 * - For admin users: Shows clickable card that navigates to employee flextime page
 * - Handles loading states and error management for flextime data fetching
 */
const BalanceCard = () => {
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const setError = useSetAtom(errorAtom);
  const [loading, setLoading] = useState(false);
  const { adminMode } = useUserRole();
  const [usersFlextime, setUsersFlextime] = useState<Flextime>();
  const yesterday = DateTime.now().minus({ days: 1 });
  const { flexTimeApi } = useLambdasApi();
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const severaUserId = getSeveraUserId(loggedInUser);
  const navigate = useNavigate();

  /**
   * Effect hook that fetches flextime data for the logged-in user.
   * Only executes for non-admin users when flextime data is not yet available.
   */
  useEffect(() => {
    if (!adminMode && !usersFlextime) {
      getUsersFlextimes();
    }
  }, [users, userProfile, adminMode, usersFlextime]);

  /**
   * Asynchronously retrieves flextime balance data for the currently logged-in user.
   *
   * @async
   * @returns Promise<void> Resolves when flextime data is fetched and state is updated
   */
  const getUsersFlextimes = async () => {
    if (!loggedInUser || !severaUserId) return;

    setLoading(true);
    try {
      const fetchedUsersFlextime = await flexTimeApi.getFlextimeBySeveraUserId({
        userId: severaUserId
      });
      setUsersFlextime(fetchedUsersFlextime);
    } catch (error) {
      setError(`${strings.error.fetchFailedFlextime}, ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Event handler that navigates to the employee flextime page in the same tab.
   * Used when admin users click the balance card.
   */
  const handleAdminCardClick = () => {
    navigate("/admin/severa/employee-flextime");
  };

  /**
   * Renders the user's personal flextime balance with appropriate styling.
   *
   * @returns JSX.Element Typography component displaying balance or error message
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

  if (adminMode) {
    return (
      <Card
        sx={{
          "&:hover": {
            background: "#efefef",
            transform: "translateY(-2px)",
            boxShadow: 3
          },
          minHeight: 150,
          cursor: "pointer",
          transition: "all 0.2s ease-in-out"
        }}
        onClick={handleAdminCardClick}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
            {strings.balanceCard.employeeBalances}
          </Typography>
          <Typography variant="body1">{strings.balanceCard.viewAllTimeEntries}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to="/timebank" style={{ textDecoration: "none" }}>
      <Card
        sx={{
          "&:hover": {
            background: "#efefef"
          },
          minHeight: 150
        }}
      >
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
      </Card>
    </Link>
  );
};

export default BalanceCard;
