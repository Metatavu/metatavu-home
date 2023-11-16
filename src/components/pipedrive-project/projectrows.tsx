import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Box, Card, CardActions, CardContent, Divider, Grid, Stack, Typography } from "@mui/material";
import Button  from '@mui/material/Button';


interface RowProps {
    rowtype: string;
    title: string;
}



const ProjectRow = ({ title, rowtype }: RowProps) => {

    const [items, setItems] = useState([]);

    const getItems = async() => {
        await axios.get(`http://localhost:3000/dev/${rowtype}`) // Update the URL for the you AWS API
            .then((res) => {
                // Handles the successful response
                setItems(res.data.data.data);
            })
            .catch((error) => {
                // Handles errors
                setItems([]);
            });
    }

    const Iminterested = async () =>{
        console.log(`Me is interested`)
    }

    const ItemRow = () => {

        return (
            <Stack 
                spacing={3} 
                justifyContent="space-evenly" 
                alignItems="flex-start" 
            >
                
                {items.map((item: any, index: number) => {
                    const { id, title } = item;
                    return (
                        <Card 
                            key={index} 
                            sx={
                                {
                                    width: '100%',
                                    "&:hover": {
                                        background: "#efefef"
                                    }
                            }}
                        >
                            <CardContent>
                                <Typography><strong>ID:</strong> {id}</Typography>
                                <Typography><strong>Title:</strong> {title}</Typography>
                            </CardContent>
                            <CardActions sx={{flexFlow: "row-reverse"}}>
                                <Button onClick={() => {Iminterested()}} size="small" >I'm interested</Button>
                            </CardActions>
                        </Card>
                    )
                })}
                
            </Stack>
        );
    }


    useEffect(() => {
        getItems();
    }, []);

    return (
        <Grid container direction="column">
            <h3 style={{"textTransform": "capitalize"}}>{title}</h3>
            <ItemRow />
        </Grid>
    );
}

export default ProjectRow;