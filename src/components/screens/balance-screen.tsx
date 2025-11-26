import { Box } from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import WorkDaysChart from "../work-hours/workDays-chart";

/**
 * Balance screen component.
 */
const BalanceScreen = () => {
  const userProfile = useAtomValue(userProfileAtom);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  return (
    <Box style={{ marginTop: "16px" }}>
      <WorkDaysChart selectedEmployee={loggedInUser} />
    </Box>
  );
};

export default BalanceScreen;
