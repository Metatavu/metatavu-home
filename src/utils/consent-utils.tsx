import SettingsScreen from "src/components/screens/settings-screen";

const ConstentUtils = ({userId}: {userId: string}) => {
//const keycloakService = ();

const handleSave = async (isAccepted: boolean) => {
    try {
        await keycloakService.updateUserAttribute(userId, "consentGiven", isAccepted.toString());
        console.log("Tiedot tallennettu onnistuneesti Keycloakiin!");
    } catch (error) {
        console.error("Virhe tallennuksessa:", error);
    }
};

return <SettingsScreen onSave={handleSave} />;
};

export default ConstentUtils