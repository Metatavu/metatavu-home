import { Box, Card, CardContent, Divider, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import strings from "../../localization/strings";
import ProjectRow from "../pipedrive-project/projectrows";

const ProjectsCard = () => {
    return (
        <Card
            sx={{
                // "&:hover": {
                //     background: "#efefef"
                // }
            }}
        >
            <CardContent>
                <h3 style={{ marginTop: 6 }}>{/*strings.tableToolbar.myRequests*/}Sales Projects</h3>
                <Divider />
                {/* <h4>Settings</h4>
                <Grid container direction="row" spacing={6} textAlign="center">
                    <Grid item xs>Leads</Grid>
                    <Grid item xs>Deals</Grid>
                    <Grid item xs>Projects</Grid>
                </Grid> */}
                <Divider />
                <Grid container direction="row" spacing={6}>

                    <Grid item xs>
                        <ProjectRow title='Leads' rowtype='leads' />
                    </Grid>

                    <Grid item xs>
                        <ProjectRow title='Deals' rowtype='deals' />
                    </Grid>

                    <Grid item xs>
                        <ProjectRow title='Projects' rowtype='dealswon' />
                    </Grid>

                </Grid>
            </CardContent>
        </Card>
    );
};

export default ProjectsCard;