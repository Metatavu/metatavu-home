import { useEffect, useState } from "react";
import SettingsScreen from "src/components/screens/settings-screen";
import { UsersApi } from "src/generated/homeLambdasClient";

const ConsentUtils = ({ userId, children }: { userId: string; children: React.ReactNode }) => {
  const [isConsentGiven, setIsConsentGiven] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const consent = await UsersApi.getUserAttribute(userId, "isSeveraOptin");
        setIsConsentGiven(consent !== "");
      } catch (error) {
        console.error("Error fetching consent:", error);
        setError("Error fetching consent");
      }
    };
    fetchConsent();
  }, [userId]);

  const handleSave = async (isAccepted: boolean) => {
    try {
      await UsersApi.updateUserAttribute(userId, "isSeveraOptin", isAccepted ? "true" : "");
      setIsConsentGiven(isAccepted);
    } catch (error) {
      console.error("Error saving consent:", error);
      setError("Error saving consent");
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (isConsentGiven === false) {
    return <SettingsScreen onSave={handleSave} initialConsent={false} />;
  }

  return <>{children}</>;
};

export default ConsentUtils;