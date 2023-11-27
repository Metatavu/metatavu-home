import { Button, Card, CardActions, CardContent, Divider, Grid, Paper, Skeleton, Typography, dividerClasses, useMediaQuery } from "@mui/material";
import { useAtomValue } from "jotai";
import axios from 'axios';
import { useEffect, useState } from "react";
import { userProfileAtom } from "../../atoms/auth";
import { personsAtom } from "../../atoms/person";
import { useParams } from "react-router";
import { Person } from "../../generated/client";

interface ItemProps {
    rowtype: string;
}
interface User {
    id: number;
    name: string;
    email: string;
    // Other user-related fields
}


interface LeadStruct {
    id: number;
    title: string;
    '9f6a98bf5664693aa24a0e5473bef88e1fae3cb3': string;
    add_time: string;
    update_time: string;
    // Other deal-related fields
}
interface DealStruct {
    id: number;
    title: string;
    '9f6a98bf5664693aa24a0e5473bef88e1fae3cb3': string;
    add_time: string;
    update_time: string;
    // Other deal-related fields
}


interface ProjectStruct {
    id: number;
    title: string;
    '9f6a98bf5664693aa24a0e5473bef88e1fae3cb3': string;
    add_time: string;
    update_time: string;
    // Other deal-related fields
}


const SalesProjectData = () => {

    const [extractedData, setExtractedData] = useState<DealStruct>();

    //  Used to check if user has laptop/PC sized screen or not.
    const notMobileScreen = useMediaQuery('(min-width: 768px)');

    const [interestedString, setInterestedString] = useState<string>('');
    const [isEmpty, setIsEmpty] = useState(false);
    const persons = useAtomValue(personsAtom);
    const userProfile = useAtomValue(userProfileAtom);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const userid: string | undefined = userProfile?.id;
    const rowtype = params.rowtype?.slice(1); // Removes the : from the :rowtype
    const projectID = params.id?.slice(1); // Removes the : from the :id
    const [personsList, setPersonsList] = useState<Person[]>([]);
    const [renderedNames, setRenderedNames] = useState<string>('');
    const [ids, setIds] = useState<string[]>([]);


    const getPersons = async () => {

        if (persons) {
            // console.log("this");
            // console.log(userProfile?.id)
            // console.log(userProfile?.username)
            // console.log(userProfile?.id)
            // console.log(persons);
            setPersonsList(persons);
            console.log("personsList");
            console.log(personsList);
        }
        else {
            console.log("Person < 0 : " + persons);
        }
    };

    const fetchNameList = async () => {

        if (extractedData != null) {

            console.log("fetchNameList");

            console.log(extractedData['9f6a98bf5664693aa24a0e5473bef88e1fae3cb3']);


            let userIds: string | undefined = extractedData['9f6a98bf5664693aa24a0e5473bef88e1fae3cb3'];


            // Ensure null is handled
            if (userIds === undefined || userIds === 'null' || userIds === null || userIds === '') {
                console.log('UserIds are null');
            }
            else {
                let userIdsArray: string[] = userIds.split(";").map(id => id.trim());

                // Remove any empty strings from the array
                userIdsArray = userIdsArray.filter(id => id !== "");

                let matchingNames: string[] = [];

                userIdsArray.forEach(userId => {
                    console.log("UserId", userId);
                    if (userId === '6e1001f6-6412-4a3f-ae86-ad2207f1e9d3') {
                        matchingNames.push('Iiro Välimaa');
                    } else {
                        let foundPerson = persons.find(person => person.keycloakId === userId);
                        if (foundPerson) {
                            matchingNames.push(`${foundPerson.firstName} ${foundPerson.lastName}`);
                        } else {
                            matchingNames.push("Unknown user");
                        }
                    }
                });

                console.log("Matching Names:");
                console.log(matchingNames);
                const formattedNames = matchingNames.join(', ');
                setIds(userIdsArray);
                setRenderedNames(formattedNames);
            }
        }
        else {
            console.log("No data extracted");
        }

    }


    const getData = async () => {
        setLoading(true);
        //const did = params.id.trimEnd();

        await axios.get(`http://localhost:3000/dev/getDealById/${rowtype}/${projectID}`) // Update the URL for the you AWS API
            .then((res) => {
                if (res.data.length === 0 || res.data == null) {
                    setIsEmpty(true);

                }
                else {
                    if (res.data.data.data["9f6a98bf5664693aa24a0e5473bef88e1fae3cb3"] === null || res.data.data.data["9f6a98bf5664693aa24a0e5473bef88e1fae3cb3"] === "null" || res.data.data.data["9f6a98bf5664693aa24a0e5473bef88e1fae3cb3"] === undefined || res.data.data.data["9f6a98bf5664693aa24a0e5473bef88e1fae3cb3"] === "") {
                        setInterestedString("");
                    }
                    else {
                        setInterestedString(res.data.data.data["9f6a98bf5664693aa24a0e5473bef88e1fae3cb3"]);
                    }

                    console.log("this");
                    console.log(res.data.data.data["9f6a98bf5664693aa24a0e5473bef88e1fae3cb3"]);
                    const response = JSON.stringify(res.data.data.data);
                    const jsonResponse = response;
                    const parsedResponse: DealStruct = JSON.parse(jsonResponse);
                    const extractedInfo: DealStruct = {
                        id: parsedResponse.id,
                        title: parsedResponse.title,
                        '9f6a98bf5664693aa24a0e5473bef88e1fae3cb3': parsedResponse['9f6a98bf5664693aa24a0e5473bef88e1fae3cb3'],
                        add_time: parsedResponse.add_time,
                        update_time: parsedResponse.update_time,
                    };
                    setExtractedData(extractedInfo);
                    fetchNameList();
                }
                setLoading(false);
            })
            .catch((error) => {
                // Handles errors
                console.log(error);
                setInterestedString("");
            });
    };



    const AddInterest = async (id: any) => {
        console.log(`User with id ${userProfile?.id} is interested to work on projectwith ${id}.`);
        console.log("ProjectId: " + projectID);
        const requestBody = {
            rowtype: rowtype,
            uid: userid,
            pid: projectID,
            existingInterest: interestedString,
        };
        console.log(requestBody);
        if (rowtype === ("deals" || "dealswon")) {
            await axios.put(`http://localhost:3000/dev/addDealInterest/${projectID}`, requestBody); // Update the URL to your AWS API
        }
        else if (rowtype === "leads") {
            await axios.patch(`http://localhost:3000/dev/addLeadInterest/${projectID}`, requestBody); // Update the URL to your AWS API
        }
        window.location.reload();
    };


    const RemoveInterest = async (id: any) => {
        console.log(`User with id ${userProfile?.id} wants to remove interest from project with id: ${id}.`);
        console.log("ProjectId: " + projectID);
        const requestBody = {
            rowtype: rowtype,
            uid: userid,
            pid: projectID,
            existingInterest: interestedString,
        };
        console.log(requestBody);
        if (rowtype === ("deals" || "dealswon")) {
            await axios.put(`http://localhost:3000/dev/removeDealInterest/${projectID}`, requestBody); // Update the URL to your AWS API
        }
        else if (rowtype === "leads") {
            await axios.patch(`http://localhost:3000/dev/removeLeadInterest/${projectID}`, requestBody); // Update the URL to your AWS API
        }
        window.location.reload();
    };



    useEffect(() => {
        console.log("Rowtype:")
        console.log(rowtype);
        const fetcData = async () => {
            await getData();
            await getPersons();
        }
        fetcData();
    }, [persons, personsList]);



    const Item = () => {

        return (
            <>
                {
                    loading ?
                        (<div>
                            <Skeleton />
                            <Skeleton />
                            <Skeleton />
                            <Skeleton />
                            <Skeleton />
                        </div>) :
                        <div>

                            {extractedData &&
                                (<>
                                    <Typography variant="h3" sx={{ fontSize: "2em", textAlign: "" }}>Projekti: {extractedData.title}</Typography>
                                    <p><strong>ID:</strong> {extractedData.id}</p>
                                    <p><strong>Interested: </strong>
                                    {renderedNames.length === 0 ? "No one has show interest yet.": renderedNames }</p>
                                    {/* <p><strong>Interested: </strong> {extractedData['9f6a98bf5664693aa24a0e5473bef88e1fae3cb3']}</p> */}
                                    <p><strong>Add time:</strong> {extractedData.add_time}</p>
                                    <p><strong>Update time:</strong> {extractedData.update_time}</p>
                                </>)
                            }
                        </div>
                }
            </>
        );
    }



    return (
        // 
        <Card>

            <CardContent>
                <h3 style={{ marginTop: 6 }}>{/*strings.tableToolbar.myRequests*/}{ }</h3>
                <p>Here you can see more informations about project. You can indicate your interest towards project by clicking the "I'm interested"-button.</p>
                <Divider sx={{ marginBottom: "20px" }} />

                <Grid container direction="row" spacing={3} justifyContent="space-evenly">

                    <Grid item sx={{ width: "100%" }}>
                        <Card>
                            <CardContent sx={{ width: "50%", margin: "auto" }}>
                                <Grid container direction="column" spacing={0}>
                                    <Item />
                                </Grid>
                            </CardContent>
                            <CardActions >
                                {
                                    (loading || userid === undefined) ?
                                        (
                                            <Grid sx={{ width: "100%", display: "flex", flexDirection: "row-reverse" }}>
                                                <Skeleton sx={{ width: "10em" }} />
                                            </Grid>
                                        ) :
                                        (
                                            <Grid sx={{ width: "100%", display: "flex", flexDirection: "row-reverse" }}>
                                                {
                                                    ids.includes(userid) ?
                                                        (
                                                            <Button onClick={() => { RemoveInterest(projectID) }} size="small" variant="outlined" sx={{ "&:hover": { background: "#000000", color: 'white' } }}>
                                                                Remove Interest
                                                            </Button>
                                                        ) :
                                                        (
                                                            <Button onClick={() => { AddInterest(projectID) }} size="small" variant="outlined" sx={{ "&:hover": { background: "#000000", color: 'white' } }}>
                                                                I'm interested
                                                            </Button>
                                                        )
                                                }
                                            </Grid>
                                        )

                                }
                            </CardActions>
                        </Card>
                    </Grid>

                </Grid>

            </CardContent>
        </Card>
    );

};

export default SalesProjectData;