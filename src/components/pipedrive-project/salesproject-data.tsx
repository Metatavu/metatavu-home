import { Button, Card, CardActions, CardContent, Divider, Grid, Paper, Skeleton, Typography, useMediaQuery } from "@mui/material";
import { useAtomValue } from "jotai";
import axios from 'axios';
import { useEffect, useState } from "react";
import { userProfileAtom } from "../../atoms/auth";
import { personsAtom } from "../../atoms/person";
import { useParams } from "react-router";


interface User {
    id: number;
    name: string;
    email: string;
    // Other user-related fields
}

interface Deal {
    id: number;
    title: string;
    '9f6a98bf5664693aa24a0e5473bef88e1fae3cb3': string;
    creator_user_id: User;
    // Other deal-related fields
}



const SalesProjectData = () => {

    const [extractedData, setExtractedData] = useState<Deal | null>(null);

    //  Used to check if user has laptop/PC sized screen or not.
    const notMobileScreen = useMediaQuery('(min-width: 768px)');

    const [item, setItem] = useState([]);
    const [isEmpty, setIsEmpty] = useState(false);
    const persons = useAtomValue(personsAtom);
    const userProfile = useAtomValue(userProfileAtom);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const userid = userProfile?.id;
    const projectID = params.id?.slice(1);


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

    const getData = async () => {
        setLoading(true);
        //const did = params.id.trimEnd();

        await axios.get(`http://localhost:3000/dev/getDealById/${projectID}`) // Update the URL for the you AWS API
            .then((res) => {
                // Handles the successful response

                if (res.data.length === 0 || res.data == null) {
                    setIsEmpty(true);
                }
                else {
                    // const response = JSON.parse(JSON.stringify(res.data.data.data));
                    // setItems(res.data.data.data);
                    // setProjectData(response);
                    // console.log("setprojectdata res.data.data.data");
                    // console.log(projectData);
                    console.log("setprojectdata res.data.data.data");
                    console.log(res.data.data.data);
                    setItem(res.data.data.data["9f6a98bf5664693aa24a0e5473bef88e1fae3cb3"])
                    console.log(item);
                    const response = JSON.stringify(res.data.data.data);
                    const jsonResponse = response;
                    
                    const parsedResponse: Deal = JSON.parse(jsonResponse);

                    // // Extracting the specific fields
                    // const id = parsedResponse.id;
                    // const title = parsedResponse.title;
                    // const customField = parsedResponse['9f6a98bf5664693aa24a0e5473bef88e1fae3cb3'];
                    // const creatorUserId = parsedResponse.creator_user_id.id;
                    // const creatorUserName = parsedResponse.creator_user_id.name;
                    // const creatorUserEmail = parsedResponse.creator_user_id.email;

                    const extractedInfo: Deal = {
                        id: parsedResponse.id,
                        title: parsedResponse.title,
                        '9f6a98bf5664693aa24a0e5473bef88e1fae3cb3': parsedResponse['9f6a98bf5664693aa24a0e5473bef88e1fae3cb3'],
                        creator_user_id: {
                            id: parsedResponse.creator_user_id.id,
                            name: parsedResponse.creator_user_id.name,
                            email: parsedResponse.creator_user_id.email,
                        },
                    };
                    setExtractedData(extractedInfo);
            

                    // // Using the extracted fields
                    // console.log(`Deal ID: ${id}`);
                    // console.log(`Deal Title: ${title}`);
                    // console.log(`Custom Field: ${customField}`);
                    // console.log(`Creator User ID: ${creatorUserId}`);
                    // console.log(`Creator User Name: ${creatorUserName}`);
                    // console.log(`Creator User Email: ${creatorUserEmail}`);

                }
                setLoading(false);
            })
            .catch((error) => {
                // Handles errors
                console.log(error);
                setItem([]);
            });
    };


    const Item = () => {

        return (
            <>
                
                {extractedData && (
                <div>
                    <Typography variant="h3" sx={{ textAlign: "center" }}>Projekti: {extractedData.title}</Typography>
                    <p>ID: {extractedData.id}</p>
                    <p>Interested: {extractedData['9f6a98bf5664693aa24a0e5473bef88e1fae3cb3']}</p>
                    <p>Creator User ID: {extractedData.creator_user_id.id}</p>
                    <p>Creator User Name: {extractedData.creator_user_id.name}</p>
                    <p>Creator User Email: {extractedData.creator_user_id.email}</p>
                </div>
            )}

            </>
        );
    }

    const Iminterested = async (id: any) => {
        console.log(`User with id ${userProfile?.id} is interested to work on projectwith ${id}.`);
        console.log("ProjectId: " + projectID);
        const requestBody = {
            uid: userid,
            pid: projectID,
            pack: item,
        }
        await axios.put(`http://localhost:3000/dev/addInterested/${projectID}`, requestBody); // Update the URL for the you AWS API
    };

    useEffect(() => {
        getPersons();
        getData();
    }, []);







    return (
        // 
        <Card>

            <CardContent>
                <h3 style={{ marginTop: 6 }}>{/*strings.tableToolbar.myRequests*/}{ }</h3>
                <p>Here you can see more informations about project. You can indicate your interest towards project by clicking the "I'm interested"-button.</p>
                <Divider />

                <Grid container direction="row" spacing={3} justifyContent="space-evenly">
                    {
                        loading ?
                            (<Skeleton />) :
                            (
                                <Grid item sx={{ width: "100%" }}>
                                    <Card>
                                        <CardContent>
                                            <Item />
                                        </CardContent>
                                        <CardActions >
                                            <Button onClick={() => { Iminterested(projectID) }} size="small" variant="outlined" sx={{ margin: "auto", "&:hover": { background: "#000000", color: 'white' } }}>I'm interested</Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            )
                    }
                </Grid>

            </CardContent>
        </Card>
    );

};

export default SalesProjectData;