import { Card, CardContent, Divider, Grid, useMediaQuery } from "@mui/material";
import ProjectRow from "../pipedrive-project/projectrows";

const PipedriveScreen = () => {


    //  Used to check if user has laptop/PC sized screen or not.
    const notMobileScreen = useMediaQuery('(min-width: 768px)');

    return (
        // 
        <Card>

            <CardContent>
                <h3 style={{ marginTop: 6 }}>{/*strings.tableToolbar.myRequests*/}Sales Projects</h3>
                <p>Here you can see the upcoming projects. You can indicate your interest towards project by clicking the "I'm interested"-button.</p>
                <Divider />

                <Grid container direction="row" spacing={3} justifyContent="space-evenly">


                    <Grid item xs={12} sm={12} md={3.5}>
                        <ProjectRow title='Leads' rowtype='leads' />
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
                        <ProjectRow title='Deals' rowtype='deals' />
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
                        <ProjectRow title='Projects' rowtype='dealswon' />
                    </Grid>


                </Grid>

            </CardContent>
        </Card>
    );

};

export default PipedriveScreen;