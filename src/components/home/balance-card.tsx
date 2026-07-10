import { Box, Skeleton, Typography, useTheme } from "@mui/material";
import { useAtomValue, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type { Flextime, User } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { getSeveraUserId } from "src/utils/user-utils";
import HomepageCard, { type CardProps } from "../generics/homepageCard";

/**TODO: Once side navigation is implemented the path to adminside
 * screen can be removed.
 *
 * Card component that displays personal flextime balance for users.
 *
 * @param props.hidden - Boolean defining if the card is visible
 * @param props.onToggleHidden - functionality to hide the card
 * @param props.editmode - Boolean defining if editmode is on
 *
 * @component
 * @returns React functional component that renders a balance card
 *
 * @description
 * - Shows personal flextime balance with link to timebank
 * - Handles loading states and error management for flextime data fetching
 */
const BalanceCard = ({ hidden, onToggleHidden, editmode }: CardProps) => {
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
  const theme = useTheme();
  const path = adminMode ? "/admin/severa/employee-flextime" : "/balance";

  /**
   * Effect hook that fetches flextime data for the logged-in user.
   */
  useEffect(() => {
    if (!usersFlextime) {
      getUsersFlextimes();
    }
  }, [users, userProfile]);

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
    } catch (error: any) {
      const errorMessage = await error.response.json();
      setError(`${strings.error.fetchFailedFlextime}: ${errorMessage.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renders the user's personal flextime balance with appropriate styling.
   *
   * @returns JSX.Element Typography component displaying balance or error message
   */
  const renderUserFlextime = () => {
    if (!usersFlextime?.totalFlextimeBalance) {
      return <Typography fontStyle="body">{strings.error.noFlextimeData}</Typography>;
    }
    const totalFlextimeBalance = usersFlextime.totalFlextimeBalance;
    const textColor =
      totalFlextimeBalance >= 0
        ? theme.palette.foreground.positive
        : theme.palette.foreground.negative;
    const hourLabel =
      totalFlextimeBalance === 1 ? strings.timeExpressions.hour : strings.timeExpressions.hours;

    return (
      <Box>
        <Typography variant="caption">
          {strings.formatString(strings.balanceCard.atTheEndOf, yesterday.toLocaleString())}
        </Typography>
        <Typography fontStyle="body">{strings.balanceCard.totalFlextimeBalance}</Typography>
        <Typography
          sx={{ color: hidden ? theme.palette.text.disabled : textColor, fontWeight: 700 }}
        >
          {totalFlextimeBalance} {hourLabel}
        </Typography>
      </Box>
    );
  };

  return (
    <HomepageCard
      title={strings.balanceCard.balance}
      content={loading ? <Skeleton /> : renderUserFlextime()}
      path={path}
      hidden={hidden}
      onToggleHidden={onToggleHidden}
      editmode={editmode}
    />
  );
};

export default BalanceCard;
