import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import WorkDaysChart from "../balance/workDays-chart";

/**
 * Timebank screen component.
 */
const BalanceScreen = () => {
  const userProfile = useAtomValue(userProfileAtom);
  const [users] = useAtom(usersAtom);
  const loggedInUser = users.find((user: User) => user.id === userProfile?.id);
  const [selectedEmployee, setSelectedEmployee] = useState(loggedInUser);

  useEffect(() => {
    if (loggedInUser) {
      setSelectedEmployee(loggedInUser);
    }
  }, [loggedInUser]);

  return (
    <div>
      <div style={{ marginTop: "16px" }} />
      <WorkDaysChart selectedEmployee={selectedEmployee} />
    </div>
  );
};

export default BalanceScreen;
