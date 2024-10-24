import { useState } from "react";
import { useLambdasApi } from "src/hooks/use-api";
import { SoftwareRegistry } from "src/generated/homeLambdasClient";

const useCreateSoftware = (loggedUserId: string, setApplications: React.Dispatch<React.SetStateAction<SoftwareRegistry[]>>) => {
  const { softwareApi } = useLambdasApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSoftware = async (software: SoftwareRegistry) => {
    setLoading(true);
    setError(null);
    try {
      const newSoftware = {
        ...software,
        createdBy: loggedUserId,
        users: [loggedUserId],
      };
      const createdSoftware = await softwareApi.createSoftware({
        softwareRegistry: newSoftware,
      });
      setApplications((prev) => [createdSoftware, ...prev]);
    } catch (error) {
      setError(`Error creating software: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return { createSoftware, loading, error };
};

export default useCreateSoftware;
