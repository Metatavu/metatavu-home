import { Box, Card, CardContent, Divider, Grid, Skeleton, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import strings from "../../localization/strings";
import ProjectRow from "../pipedrive-project/projectrows";
import ProjectcardData from "../pipedrive-project/projectcard-data";

const ProjectsCard = () => {


    //  Used to check if user has laptop/PC sized screen or not.
    const notMobileScreen = useMediaQuery('(min-width: 768px)');


    return (
        <Link to={"/salesview"} style={{ textDecoration: "none" }}>
            <Card
                sx={{
                    // "&:hover": {
                    //     background: "#efefef"
                    // }
                    "marginBottom": "1em",
                }}
            >
                <CardContent>
                    <h3 style={{ marginTop: 6 }}>{/*strings.tableToolbar.myRequests*/}Sales Projects</h3>

                    <Grid container direction="row" spacing={3} justifyContent="space-evenly">


                        <Grid item xs={12} sm={12} md={3.5}>
                            <ProjectcardData title='Leads' rowtype='leads'/>
                        </Grid>
                        {
                            // Creates a divider if screen width > 768px
                            notMobileScreen ?
                                (
                                    <Grid item xs={0.01}>
                                        <Divider orientation="vertical" />
                                    </Grid>
                                )
                                :
                                (null)
                        }

                        <Grid item xs={12} sm={12} md={3.5}>
                        <ProjectcardData title='Deals' rowtype='deals'/>
                        </Grid>



                        {
                            // Creates a divider if screen width > 768px
                            notMobileScreen ?
                                (
                                    <Grid item xs={0.01}>
                                        <Divider orientation="vertical" />
                                    </Grid>
                                )
                                :
                                (null)
                        }


                        <Grid item xs={12} sm={12} md={3.5}>
                        <ProjectcardData title='Projects' rowtype='dealswon'/>
                        </Grid>


                    </Grid>

                </CardContent>
            </Card>
        </Link>
    );
};

export default ProjectsCard;