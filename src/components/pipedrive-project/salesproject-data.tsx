import { Card, CardActions, CardContent, Divider, Grid, Skeleton, Typography, useMediaQuery } from "@mui/material";
import Button from "@mui/material/Button";
import { useAtomValue } from "jotai";
import axios from 'axios';
import { useEffect, useState } from "react";
import { userProfileAtom } from "../../atoms/auth";
import { personsAtom } from "../../atoms/person";
import { useParams } from "react-router";
import { Person } from "../../generated/client";
import { useLambdaApi } from "../../hooks/use-api";

interface DealStruct {
    id: string;
    title: string;
    '9f6a98bf5664693aa24a0e5473bef88e1fae3cb3': string;
    add_time: string;
    update_time: string;
    // Other deal-related fields
}

interface UpdatedDealStruct {
    dealId: number;
    title: string;
    interested: string;
    addTime: Date;
    updateTime: Date;
    // Other deal-related fields
}

/**
 * Function builds the detailed data and button to add or remove interest into element.
 * 
 * @returns Card element with detailed data and button to add or remove interest
 */
const SalesProjectData = () => {

    const [extractedData, setExtractedData] = useState<UpdatedDealStruct>();
    const { leadByIdApi, dealByIdApi, interestApi } = useLambdaApi();
    const [interestedString, setInterestedString] = useState<string>('');
    const [isEmpty, setIsEmpty] = useState(false);
    const persons = useAtomValue(personsAtom);
    const userProfile = useAtomValue(userProfileAtom);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const userid: string | undefined = userProfile?.id;
    const rowtype = params.rowtype?.slice(1); // Removes the : from the :rowtype
    const projectID: any = params.id?.slice(1); // Removes the : from the :id
    const [personsList, setPersonsList] = useState<Person[]>([]);
    const [renderedNames, setRenderedNames] = useState<string>('');
    const [ids, setIds] = useState<string[]>([]);

    /**
     * Fetches eployee list
     */
    const getPersons = async () => {
        if (persons) {
            setPersonsList(persons);
        }
        else {
            console.log("NO persons found!");
        }
    };

    /**
     * Fetches the list of interested from API. Goes through it and creates new array containing the employee names based on the fetched list of interest.
     *  
     */
    const fetchNameList = async () => {

        if (extractedData != null) {
            let userIds: string | undefined = extractedData.interested;

            // Handles null answer
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
                        matchingNames.push('Iiro Välimaa'); //This been used as debuging as my profile is not on the list
                    } else {
                        // Actuall nameList checking
                        let foundPerson = persons.find(person => person.keycloakId === userId);
                        if (foundPerson) {
                            matchingNames.push(`${foundPerson.firstName} ${foundPerson.lastName}`);
                        } else {
                            matchingNames.push("Unknown user");//This been used on debuging for IDs that I've written myself to the Pipedrive
                        }
                    }
                });
                const formattedNames = matchingNames.join(', ');
                setIds(userIdsArray);
                setRenderedNames(formattedNames);
            }
        }
        else {
            console.log("No data extracted");
        }
    }

    /**
     * Fetches lead or deal by ID
     */
    const getData = async () => {
        setLoading(true);
        //const did = params.id.trimEnd();

        if (rowtype === "leads" && projectID != undefined) {

            await leadByIdApi.getLeadById({ leadId: projectID }).then((res) => {
                console.log("GET LEAD BY ID RES: ", res);
                if (res.length === 0 || res === null) {
                    setIsEmpty(true);
                }
            })
                .catch(() => {
                });
        }
        else if (rowtype === "deals" && projectID != undefined) {
            console.log("projectID", projectID)
            await dealByIdApi.getDealById(projectID).then((res) => {
                console.log("GET DEAL BY ID RES: ", res);
                if (res.length === 0 || res === null) {
                    setIsEmpty(true);
                } else {
                    const parsedResponse: UpdatedDealStruct = res[0];
                    const extractedInfo: UpdatedDealStruct = {
                        dealId: parsedResponse.dealId,
                        title: parsedResponse.title,
                        interested: parsedResponse.interested,
                        addTime: parsedResponse.addTime,
                        updateTime: parsedResponse.updateTime,
                    };
                    setExtractedData(extractedInfo);
                    fetchNameList();
                }
                setLoading(false);
            })
                .catch(() => {
                });
        }


    };


    /**
     * Used to add interest to project
     * @param id The id of the project
     */
    const AddInterest = async (id: any) => {
        console.log(`User with id ${userProfile?.id} is interested to work on project with id: ${id}.`);
        const requestBody = {
            rowtype: rowtype,
            uid: userid,
            pid: projectID,
            existingInterest: interestedString,
        };
        console.log(requestBody);
        if (rowtype === ("deals" || "dealswon")) {
            await interestApi.addDealInterestDealIdPut(projectID);
            // Following function has been used previously
            // await axios.put(`http://localhost:3000/dev/removeDealInterest/${projectID}`, requestBody); // Update the URL to your AWS API
        }
        else if (rowtype === "leads") {
            await interestApi.addDealInterestDealIdPut(projectID);
            // Following function has been used previously
            // await axios.patch(`http://localhost:3000/dev/removeLeadInterest/${projectID}`, requestBody); // Update the URL to your AWS API
        }
        window.location.reload();
    };

    /**
     * Used to remove interest from project
     * @param id The id of the project
     */
    const RemoveInterest = async (id: any) => {
        console.log(`User with id ${userProfile?.id} wants to remove interest from project with id: ${id}.`);
        console.log("ProjectId: " + projectID);
        const requestBody = {
            rowtype: rowtype,
            uid: userid,
            pid: projectID,
            existingInterest: interestedString,
        };

        //  DOESNT WORK ATM AS THE requestBody CANNOT BE ATTACHED
        if (rowtype === ("deals" || "dealswon")) {
            await interestApi.removeDealInterestDealIdPut(projectID);
            // Following function has been used previously
            // await axios.put(`http://localhost:3000/dev/removeDealInterest/${projectID}`, requestBody); // Update the URL to your AWS API
        }
        else if (rowtype === "leads") {
            await interestApi.removeLeadInterestLeadIdPatch(projectID);
            // Following function has been used previously
            // await axios.patch(`http://localhost:3000/dev/removeLeadInterest/${projectID}`, requestBody); // Update the URL to your AWS API
        }
        window.location.reload();
    };
    useEffect(() => {
        const fetcData = async () => {
            await getData();
            await getPersons();
        }
        fetcData();
    }, [persons, personsList]);

    /**
     * Information area of the project
     * 
     * @returns Detailed information of specific salesproject
     */
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
                                    <Typography variant="h3" sx={{ fontSize: "2em", textAlign: "" }}>{extractedData.title}</Typography>
                                    <Divider/>
                                    <Typography variant="caption" color="grey">ID: {extractedData.dealId}</Typography>
                                    <p>
                                        <strong>Interested: </strong>
                                        {renderedNames.length === 0 ? "No one has show interest yet." : renderedNames}
                                    </p>
                                    <p><strong>Add time:</strong> {extractedData.addTime.toDateString()}</p>
                                    <p><strong>Update time:</strong> {extractedData.updateTime.toDateString()}</p>
                                </>)
                            }
                        </div>
                }
            </>
        );
    }

    return (

        <Grid item sx={{ width: "100%" }}>
            <Card>
                <CardContent sx={{ width: "50%", margin: "auto" }}>
                    <Grid container direction="column" spacing={0}>
                        <Item />
                    </Grid>
                </CardContent>
                <CardActions sx={{ padding: "16px", width: "50%", margin: "auto" }}>
                    {
                        (loading || userid === undefined) ?
                            (
                                <Grid container direction="column" spacing={0}>
                                    <Skeleton sx={{ width: "10em" }} />
                                </Grid>
                            ) :
                            (
                                <Grid container direction="column" spacing={0}>
                                    {
                                        ids.includes(userid) ?
                                            (
                                                <div>
                                                    <Button onClick={() => { RemoveInterest(projectID) }} color="error" size="small" variant="outlined" sx={{ "&:hover::after": { color: 'error' } }}>
                                                        Remove Interest
                                                    </Button>
                                                </div>
                                            ) :
                                            (
                                                <div>
                                                    <Button onClick={() => { AddInterest(projectID) }} color="success" size="small" variant="contained" sx={{ "&:hover": { background: "#000000", color: 'white' } }}>
                                                        I'm interested
                                                    </Button>
                                                </div>
                                            )
                                    }
                                </Grid>
                            )

                    }
                </CardActions>
            </Card>
        </Grid>

    );

};

export default SalesProjectData;