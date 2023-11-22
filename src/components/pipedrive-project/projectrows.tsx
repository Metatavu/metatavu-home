import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Box, Card, CardActions, CardContent, Divider, Grid, Skeleton, Stack, Typography } from "@mui/material";
import Button from '@mui/material/Button';
import { getHoursAndMinutes } from "../../utils/time-utils";
import strings from "../../localization/strings";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { errorAtom } from "../../atoms/error";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useApi } from "../../hooks/use-api";
import { Person, PersonTotalTime, Timespan } from "../../generated/client";
import { personsAtom, personTotalTimeAtom, timespanAtom } from "../../atoms/person";
import { Link } from "react-router-dom";
import { userProfileAtom } from "../../atoms/auth";
import config from "../../app/config";



interface RowProps {
    rowtype: string;
    title: string;
}



const ProjectRow = ({ title, rowtype }: RowProps) => {

    const [items, setItems] = useState([]);
    const [isEmpty, setIsEmpty] = useState(false);
    const persons = useAtomValue(personsAtom);
    const userProfile = useAtomValue(userProfileAtom);
    const [loading, setLoading] = useState(false);

    /**
     * Initialize logged in person's time data.
     */
    const getPersons = async () => {
        if (persons.length) {
            console.log("this");
            console.log(userProfile?.id)
            console.log(userProfile?.username)
            console.log(userProfile?.id)
            console.log(persons);
        }
        else {
            console.log("Person < 0 : " + persons);
        }
    };





    const getItems = async () => {
        setLoading(true);
        await axios.get(`http://localhost:3000/dev/${rowtype}`) // Update the URL for the you AWS API
            .then((res) => {
                // Handles the successful response

                if (res.data.data.data.length === 0) {
                    setIsEmpty(true);
                }
                else {
                    setItems(res.data.data.data);
                }
                setLoading(false);
            })
            .catch((error) => {
                // Handles errors
                console.log(error);
                setItems([]);
            });
    }

    const Iminterested = async (id: number) => {
        console.log(`User with id ${userProfile?.id} is interested to work on projectwith ${id}.`)
    }

    const ItemRow = () => {

        return (
            <>

                {
                    items.map((item: any, index: number) => {
                        const { id, title } = item;
                        return (
                            <Link to={"/salesview/:" + id} key={index} style={{ textDecoration: "none", width: '100%'}}>
                                <Card sx={
                                        {
                                            width: '100%',
                                            minHeight: '100%',
                                            "&:hover": {
                                                background: "#efefef"
                                            }
                                        }}>
                                    <CardContent>
                                        <Typography><strong>Title:</strong> {title}</Typography>
                                        <Typography variant="caption" sx={{ color: "grey" }}><strong>ID:</strong> {id}</Typography>
                                    </CardContent>
                                    <CardActions sx={{ flexFlow: "row-reverse", }}>
                                        <Button onClick={() => { Iminterested(id) }} size="small" variant="outlined" sx={{ "&:hover": { background: "#000000", color: 'white' } }}>I'm interested</Button>
                                    </CardActions>
                                </Card>
                            </Link>
                        )
                    })
                }

            </>
        );
    }


    useEffect(() => {
        getPersons();
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
                        (<>
                            {
                                isEmpty ?
                                    (
                                        <Stack spacing={3} justifyContent="center" alignItems="center">
                                            <Typography variant="subtitle1" textAlign="center">No {title} found!</Typography>
                                        </Stack>
                                    ) : (
                                        <Stack spacing={3} justifyContent="space-evenly" alignItems="flex-start">
                                            <ItemRow />
                                        </Stack>
                                    )
                            }

                        </>
                        )
                }
            </Grid>
        </Grid>
    );
}

export default ProjectRow;