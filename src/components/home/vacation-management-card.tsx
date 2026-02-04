import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import strings from "../../localization/strings";

/**
 * Clickable card linking to the admin vacation management page.
 * Used on the admin dashboard to navigate to vacation day management.
 * @returns React element for the vacation management card.
 */
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
