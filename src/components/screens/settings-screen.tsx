import React, { useState } from "react";
import {Typography,Box, Switch , Button, } from "@mui/material";

const SettingsScreen = ({ onSave }: { onSave: (isAccepted: boolean) => void }) => {
    const [isAccepted, setIsAccepted] = useState(false);

    const handleToggleChange = () => {
        setIsAccepted((prevState) => !prevState); 
    };
    
    const handleButtonClick = () => {
        console.log("Asetukset tallennettu (ei lähetetty eteenpäin):", { isAccepted });
        onSave(isAccepted); 
    };

    
    return (
    <Box p={2} bgcolor="grey.100" borderRadius={2}>
        <Typography variant="h5" gutterBottom>
            Suostumus tietojen käsittelyyn
        </Typography>
        <Box display="flex" alignItems="center" mt={2}>
        <Typography variant="body1" sx={{ marginRight: 2 }}>
            En hyväksy
        </Typography>
        <Switch
            checked={isAccepted}
            onChange={handleToggleChange}
            inputProps={{ "aria-label": "Tietojen käsittelyn hyväksyntä" }}
        />
        <Typography variant="body1" sx={{ marginLeft: 2 }}>
            Hyväksyn
        </Typography>
        </Box> 
        <Box mt={2}>
            <Button variant="contained" onClick={handleButtonClick}>
            Tallenna asetukset
        </Button>
        </Box>
    </Box>
    );
};
export default SettingsScreen;