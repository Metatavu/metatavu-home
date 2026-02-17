import { Box } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import WorkDaysChart from "../work-hours/workDays-chart";
import OptInRedirect from "../generics/opt-in-redirect";
import { isUserOptedIn } from "src/utils/user-utils";

/**
 * Balance screen component.
 */
const BalanceScreen = () => {
  const userProfile = useAtomValue(userProfileAtom);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  if (!loggedInUser) {
    return null;
  }

  if (!isUserOptedIn(loggedInUser)) {
    return <OptInRedirect />;
  }

  return (
    <Box style={{ marginTop: "16px" }}>
      <WorkDaysChart selectedEmployee={loggedInUser} />
    </Box>
  );
};

export default BalanceScreen;
