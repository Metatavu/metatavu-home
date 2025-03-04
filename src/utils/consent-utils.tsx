import { useEffect, useState } from "react";
import SettingsScreen from "src/components/screens/settings-screen";
import { UsersApi } from "src/generated/homeLambdasClient";

const ConsentUtils = ({ userId }: { userId: string }) => {
  const [isConsentGiven, setIsConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const consent = await UsersApi.getUserAttribute(userId, "consentGiven");
        setIsConsentGiven(consent === "true");
      } catch (error) {
        console.error("Error fetching consent:", error);
      }
    };
    fetchConsent();
  }, [userId]);

  const handleSave = async (isAccepted: boolean) => {
    try {
      await UsersApi.updateUserAttribute(userId, "consentGiven", isAccepted.toString());
      setIsConsentGiven(isAccepted);
    } catch (error) {
      console.error("Error saving consent:", error);
    }
  };

  return isConsentGiven !== null ? (
    <SettingsScreen onSave={handleSave} initialConsent={isConsentGiven} />
  ) : (
    <p>Loading...</p>
  );
};

export default ConsentUtils;