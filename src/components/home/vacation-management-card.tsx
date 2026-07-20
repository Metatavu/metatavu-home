/*TODO: this card is un-used. Should it be removed?

import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import strings from "../../localization/strings";


const VacationManagementCard = () => {
  const theme = useTheme();
  return (
    <Link to="/admin/vacation-management" style={{ textDecoration: "none" }}>
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ marginTop: 1, marginBottom: 1 }}>
            {strings.adminVacationManagement.title}
          </Typography>
          <Typography variant="body2" paragraph>
            {strings.adminVacationManagement.description}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
              color: theme.palette.text.secondary
            }}
          />
        </CardContent>
      </Card>
    </Link>
  );
};

export default VacationManagementCard;
 */
