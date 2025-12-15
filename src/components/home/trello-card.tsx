import { Card, CardContent, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";

/**
 * Component for displaying Trello card
 */
const TrelloCard = () => {
  const adminMode = useUserRole();
  const linkTarget = "/cards";

  /**
   * Render card content
   */
  const renderCardContent = () => {
    if (adminMode) {
      return (
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={"bold"}
            style={{ marginTop: 6, marginBottom: 3 }}
          ></Typography>
        </CardContent>
      );
    }

    return (
      <CardContent>
        <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
          {strings.trelloCard.cards}
        </Typography>
        <Grid container>
          <Grid item xs={12}>
            {strings.trelloCard.cardsAreHere}
          </Grid>
        </Grid>
      </CardContent>
    );
  };

  return (
    <Link to={linkTarget} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          "&:hover": {
            background: "#efefef"
          }
        }}
      >
        {renderCardContent()}
      </Card>
    </Link>
  );
};

export default TrelloCard;
