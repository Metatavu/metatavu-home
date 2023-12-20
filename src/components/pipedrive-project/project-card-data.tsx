import { useEffect, useState } from "react";
import { useLambdaApi } from "../../hooks/use-api";
import { Card, CardContent, Divider, Grid, Skeleton, Stack, Typography } from "@mui/material";



interface ColumnProps {
    columntype: string;
    title: string;
}


/**
 * 
 * @param param0 object containing title of the column, and the type of column
 * @returns One Project Card containing Project title, count of people interested in the project and tech used in the project
 */
const ProjectcardData = ({ title, columntype }: ColumnProps) => {
    const { leadsApi, dealsApi} = useLambdaApi();
    const [itemCount, setItemCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const getItems = async () => {
        setLoading(true);
        if (columntype === "leads") {
            await leadsApi.listSalesLeads().then((res) => {
                setItemCount(res.length)
                console.log(res)
                setLoading(false);
            })
            .catch(() => {
                setItemCount(0);
            });
        } 
        else if (columntype === "deals") {
            await dealsApi.listSalesDeals({status: "open"}).then((res) => {
                setItemCount(res.length);
                console.log("DEALS RES: ", res);
                setLoading(false);
            })
            .catch(() => {
                setItemCount(0);
            })
        }
        else if(columntype === "dealswon"){
            await dealsApi.listSalesDeals({status: "won"}).then((res) => {
                setItemCount(res.length);
                console.log("DEALS RES: ", res);
                setLoading(false);
            })
            .catch(() => {
                setItemCount(0);
            })
        }
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
                    <CardContent sx={{ paddingBottom: '16px !important' }}>
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