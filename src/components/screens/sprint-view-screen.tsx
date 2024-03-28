import strings from "../../localization/strings";
import { useLambdasApi } from "../../hooks/use-api";
import { Person } from "../../generated/client";
import { useAtomValue } from "jotai";
import { personsAtom } from "../../atoms/person";
import config from "../../app/config";
import { userProfileAtom } from "../../atoms/auth";
import { useEffect } from "react";

/**
 * Sprint View screen component
 */
const SprintViewScreen = () => {
  const { allocationsApi } = useLambdasApi();
  const { tasksApi } = useLambdasApi();
  const { timeEntriesApi } = useLambdasApi();
  const persons = useAtomValue(personsAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInPerson = persons.find(
    (person: Person) => person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  );

  useEffect(() => {
    getPersonAllocations()
  }, [persons]);
  const getPersonAllocations = async () => {
    if (loggedInPerson) {
      try {
        const fetchedAllocations = await allocationsApi.listAllocations({
          startDate: new Date("2024-03-7")
        });

        const fetchedTasks = await tasksApi.listProjectTasks({
          projectId: 418125
        });
        
        const fetchedTimeEntries = await timeEntriesApi.listProjectTimeEntries({
          projectId: 418125
        });

      } catch (error) {
        console.log("error");
      }
    }
  };

  return (
    <h1>{ strings.sprint.sprintviewScreen }</h1>
  );
};
export default SprintViewScreen;
