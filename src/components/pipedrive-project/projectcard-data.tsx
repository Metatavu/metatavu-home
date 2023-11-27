import { useEffect, useState } from "react";
import axios from 'axios';
import { Card, CardContent, Divider, Grid, Skeleton, Stack, Typography } from "@mui/material";



interface RowProps {
    rowtype: string;
    title: string;
}



const ProjectcardData = ({ title, rowtype }: RowProps) => {

    const [itemCount, setItemCount] = useState(0);
    const [loading, setLoading] = useState(false);





    const getItems = async () => {
        setLoading(true);
        await axios.get(`http://localhost:3000/dev/${rowtype}`) // Update the URL for the you AWS API
            .then((res) => {
                setItemCount(res.data.data.data.length);    // Could this be done in serverless?
                setLoading(false);
            })
            .catch((error) => {
                console.log(error)
                setItemCount(0);
            });
    }



    const ItemSummary = () => {

        return (
            <>
                <Card
                    sx={
                        {
                            width: '100%',
                            textAlign: 'center',
                        }
                    }
                >
                    <CardContent sx={{paddingBottom: '16px !important'}}>
                        <Typography>Currently <strong>{`${itemCount}`} ongoing </strong> {`${title}.`}</Typography>
                    </CardContent>
                </Card>
            </>
        );
    }


    useEffect(() => {
        getItems();
    }, []);

    return (
        <Grid container direction="column" width="100%" className="thisandthat">
            <Grid item >
                <Divider component="h4" style={{ "marginBlock": "20px" }}>
                    {title}
                </Divider>
            </Grid>
            <Grid item >
                {
                    loading ?
                        (<Skeleton />) :
                        (
                            <Stack spacing={3} justifyContent="space-evenly" alignItems="center">
                                <ItemSummary />
                            </Stack>
                        )
                }
            </Grid>
        </Grid>
    );
}

export default ProjectcardData;