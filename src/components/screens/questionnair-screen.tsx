import { Card, Grid, Box, CardContent, CardActions } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import UserRoleUtils from "src/utils/user-role-utils";
import { KeyboardReturn } from "@mui/icons-material";

/**
 * Some mock Data.
 * TODO: This will be replaced with the actual data from the backend.
 */

const mockQuestionnaires = [
  {
    id: 1,
    title: "This is listing of Mock data for visual presentation",
    description: "TODO: Build this with actual data, maybe table ?",
    status: <CheckCircleIcon sx={{ color: "green" }} />
  },
  {
    id: 2,
    title: "Questionnaire 2",
    description: "Description for Questionnaire 2",
    status: <CloseIcon sx={{ color: "red" }} />
  },
  {
    id: 3,
    title: "Questionnaire 3",
    description: "Description for Questionnaire 3",
    status: <CloseIcon sx={{ color: "red" }} />
  }
];

/**
 * Questionnaire screen component.
 */

const QuestionnaireScreen = () => {
  const adminMode = UserRoleUtils.adminMode();

  return (
    <Card
      sx={{
        p: 2,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100"
      }}
    >
      <Grid container sx={{ flexGrow: 1 }}>
        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "center", sm: "space-between" },
            alignItems: "center",
            mb: 2,
            mt: 2
          }}
        >
          <Grid item xs={12} sm={6} sx={{ alignItems: "center" }}>
            <Typography variant="h4" justifyContent={"center"}>
              Current Questionnaires
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" }
            }}
          >
            {adminMode ? (
              <Link to="/admin/newQuestionnaire" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="primary" size="large">
                  Build New Questionnaire
                </Button>
              </Link>
            ) : null}
          </Grid>
        </Grid>
        {mockQuestionnaires.map((questionnaire) => (
          <Grid item xs={12} key={questionnaire.id} sx={{ mt: 2 }}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">{questionnaire.title}</Typography>

                <Typography variant="body2">{questionnaire.description}</Typography>

                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Status:
                  </Typography>
                  {questionnaire.status}
                </Box>
              </CardContent>

              {adminMode ? (
                <CardActions>
                  <Button variant="outlined" color="success">
                    <EditIcon sx={{ color: "success", mr: 2 }} />
                    Edit
                  </Button>
                  <Button variant="contained" color="secondary">
                    <DeleteForeverIcon sx={{ color: "red", mr: 2 }} />
                    Delete
                  </Button>
                </CardActions>
              ) : null}
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card sx={{ mt: 2, width: "100%" }}>
        <Link to={adminMode ? "/admin" : "/"} style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={{ p: 2, width: "100%" }}>
            <KeyboardReturn sx={{ marginRight: "10px" }} />
            <Typography>Back</Typography>
          </Button>
        </Link>
      </Card>
    </Card>
  );
};

export default QuestionnaireScreen;