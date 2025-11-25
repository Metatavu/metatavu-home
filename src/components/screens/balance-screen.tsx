import { useAtom, useAtomValue } from "jotai";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import WorkDaysChart from "../balance/workDays-chart";

/**
 * Balance screen component.
 */
const BalanceScreen = () => {
  const userProfile = useAtomValue(userProfileAtom);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);

  return (
    <div>
      <div style={{ marginTop: "16px" }} />
      <WorkDaysChart selectedEmployee={loggedInUser} />
    </div>
  );
};

export default BalanceScreen;
