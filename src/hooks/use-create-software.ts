import { useState } from "react";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { useSnackbar } from "./use-snackbar";

const useCreateSoftware = (
  loggedUserId: string,
  setApplications: React.Dispatch<React.SetStateAction<SoftwareRegistry[]>>
) => {
  const { softwareApi } = useLambdasApi();
  const showSnackbar = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSoftware = async (software: SoftwareRegistry) => {
    setLoading(true);
    setError(null);
    try {
      const newSoftware = {
        ...software,
        createdBy: loggedUserId,
        users: [loggedUserId]
      };
      const createdSoftware = await softwareApi.createSoftware({
        softwareRegistry: newSoftware
      });
      setApplications((prev) => [createdSoftware, ...prev]);
      showSnackbar(strings.snackbar.softwareAdded);
    } catch (error) {
      setError(`${strings.softwareRegistry.errorCreatingSoftware} ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return { createSoftware, loading, error };
};

export default useCreateSoftware;
