import { useEffect, useState } from "react";
import { Card, CardActions, CardContent, Chip, Divider, Grid, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { personsAtom } from "../../atoms/person";
import { Link } from "react-router-dom";
import { userProfileAtom } from "../../atoms/auth";
import { useLambdaApi } from "../../hooks/use-api";

interface ColumnProps {
    columntype: string;
    title: string;
    sorting: string;
    usedTech: string[];
}

/**
 * 
 * @param param0 
 * @returns 
 */
const ProjectColumn = ({ title, columntype, sorting, usedTech }: ColumnProps) => {

    const { leadsApi, dealsApi } = useLambdaApi();
    const [items, setItems] = useState<any[]>([]);
    const [isEmpty, setIsEmpty] = useState<boolean>(false);
    const [atleastOne, setAtleastOne] = useState<boolean>(false);
    const [columnIsEmpty, setColumnIsEmpty] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const getItems = async () => {
        setLoading(true);
        if (columntype === "leads") {
            await leadsApi.listSalesLeads().then((res) => {
                if (res.length === 0) {
                    setIsEmpty(true);
                }
                else {
                    setItems(res);
                    console.log("LEADS RES: ", res);
                }
                setLoading(false);
            })
                .catch(() => {
                    console.log("Error while fetching leads!")
                });
        }
        else if (columntype === "deals") {
            await dealsApi.listSalesDeals({ status: "open" }).then((res) => {
                setItems(res);
                console.log("DEALS RES: ", res);
                setLoading(false);
            })
                .catch(() => {
                    console.log("Error while fetching deals!")
                })
        }
        else if (columntype === "dealswon") {
            await dealsApi.listSalesDeals({ status: "won" }).then((res) => {
                setItems(res);
                console.log("DEALS RES: ", res);
                setLoading(false);
            })
                .catch(() => {
                    console.log("Error while fetching deals!")
                })
        }
    };

    const ItemColumn = () => {

        //  Handles sorting
        let sortedItems: any[] = items;
        if (sorting === 'recent' && sortedItems != undefined) {
            sortedItems = sortedItems.slice().reverse();
        }
        else if (sorting === 'old' && sortedItems != undefined) {
            sortedItems = items;
        }
        else {
            sortedItems = items;
        }


        const RenderedItems = () => {

            const oneColumn = sortedItems.map((item: { '9f6a98bf5664693aa24a0e5473bef88e1fae3cb3': string, '97561cf8673be155bc0939f90efb1679ae8795be': string, id: any, title: string }, index: number) => {

                // Handles interested users
                let interestCount: number = 0;
                if (item['9f6a98bf5664693aa24a0e5473bef88e1fae3cb3']) {
                    const interestedUsers = item['9f6a98bf5664693aa24a0e5473bef88e1fae3cb3'].split(";");
                    const filteredUsers = interestedUsers.filter((user: string) => user.trim() !== '');
                    interestCount = filteredUsers.length;
                } else {
                    interestCount = 0;
                }

                // Handles programming laguages
                let usedProgLang: string[] = [];
                if (item['97561cf8673be155bc0939f90efb1679ae8795be']) {
                    usedProgLang = item['97561cf8673be155bc0939f90efb1679ae8795be'].split(";").map((id: string) => id.trim());
                    usedProgLang = usedProgLang.filter(lang => lang !== '');
                } else {
                    console.log("this project doesn't have any tech assigned to it")
                    usedProgLang = [];
                }

                const renderedChips = usedProgLang.slice(0, 2).map((lang: string, index: number) => (
                    <Chip key={index} label={lang} sx={{ height: 'auto', maxWidth: 'auto' }} />
                ));

                const remainingLanguages = usedProgLang.slice(2);
                const remainingLanguagesChip = (
                    <Chip
                        key="remaining-languages"
                        label={`+${remainingLanguages.length} more`}
                        sx={{ height: 'auto', maxWidth: 'auto', marginRight: 1, cursor: 'pointer' }}
                    />
                );

                const lowercaseProgLang = usedProgLang.map(str => str.toLowerCase());

                // Checks if any of the used techs match with item techs
                if (usedTech.length > 0) {
                    const matchingItem = usedTech.map((tech) => {
                        if (lowercaseProgLang.includes(tech)) {
                            console.log("Item found with one tech selected as filter");
                            setAtleastOne(true);
                            return (
                                <Link to={`/salesview/:${columntype}/:${item.id}`} key={index} style={{ textDecoration: "none", minWidth: "100%", maxWidth: "10em" }}>
                                    <Card sx={
                                        {
                                            width: '100%',
                                            minHeight: '100%',
                                            backgroundColor: "#ffffff",
                                            "&:hover": {
                                                background: "#efefef"
                                            }
                                        }}>
                                        <CardContent sx={{ marginBottom: "-14px" }}>
                                            <Typography><strong>{item.title}</strong></Typography>
                                            <Typography variant="caption" sx={{ color: "grey" }}>{interestCount} people are interested on this project</Typography>
                                        </CardContent>
                                        <CardActions sx={{ height: "auto", maxWidth: "100%", paddingInline: "16px" }}>

                                            <>
                                                {renderedChips}
                                                {remainingLanguages.length > 0 && (
                                                    <Tooltip title={remainingLanguages.join(', ')} placement="top">
                                                        {remainingLanguagesChip}
                                                    </Tooltip>
                                                )}
                                            </>


                                        </CardActions>
                                    </Card>
                                </Link>
                            );


                        }
                        else {
                            setAtleastOne(false);
                            console.log("This language dont match ");
                            return null;
                        }

                    });
                    if (false) {
                        console.log("atLeastOne == " + atleastOne + columntype + " ", matchingItem);
                        setColumnIsEmpty(true);
                        return (null);
                    }
                    else {
                        console.log("atLeastOne == " + atleastOne + columntype + " ", matchingItem);
                        return (<>{matchingItem}</>);
                    }

                }
                // HANDLES IF NO FILTER
                else {
                    return (
                        (columntype == "leads") ? (
                            <Link to={`/salesview/:leads/:${item.id}`} key={index} style={{ textDecoration: "none", minWidth: "100%", maxWidth: "10em" }}>
                                <Card sx={
                                    {
                                        width: '100%',
                                        minHeight: '100%',
                                        backgroundColor: "#ffffff",
                                        "&:hover": {
                                            background: "#efefef"
                                        }
                                    }}>
                                    <CardContent sx={{ marginBottom: "-14px" }}>
                                        <Typography><strong>{item.title}</strong></Typography>
                                        <Typography variant="caption" sx={{ color: "grey" }}>{interestCount} people are interested on this project</Typography>
                                    </CardContent>
                                    <CardActions sx={{ height: "auto", maxWidth: "100%", paddingInline: "16px" }}>

                                        <>
                                            {renderedChips}
                                            {remainingLanguages.length > 0 && (
                                                <Tooltip title={remainingLanguages.join(', ')} placement="top">
                                                    {remainingLanguagesChip}
                                                </Tooltip>
                                            )}
                                        </>


                                    </CardActions>
                                </Card>
                            </Link>) : (
                            <Link to={`/salesview/:deals/:${item.id}`} key={index} style={{ textDecoration: "none", minWidth: "100%", maxWidth: "10em" }}>
                                <Card sx={
                                    {
                                        width: '100%',
                                        minHeight: '100%',
                                        backgroundColor: "#ffffff",
                                        "&:hover": {
                                            background: "#efefef"
                                        }
                                    }}>
                                    <CardContent sx={{ marginBottom: "-14px" }}>
                                        <Typography><strong>{item.title}</strong></Typography>
                                        <Typography variant="caption" sx={{ color: "grey" }}>{interestCount} people are interested on this project</Typography>
                                    </CardContent>
                                    <CardActions sx={{ height: "auto", maxWidth: "100%", paddingInline: "16px" }}>

                                        <>
                                            {renderedChips}
                                            {remainingLanguages.length > 0 && (
                                                <Tooltip title={remainingLanguages.join(', ')} placement="top">
                                                    {remainingLanguagesChip}
                                                </Tooltip>
                                            )}
                                        </>


                                    </CardActions>
                                </Card>
                            </Link>)

                    );
                }

            });

            if (oneColumn) {
                console.log("mätsää oneColumn", oneColumn);
                return (<>{oneColumn}</>);
            }
            else {
                setColumnIsEmpty(true);
                return (null);
            }
        }




        if (RenderedItems === null || RenderedItems === undefined) {
            return (<>No items found on this class</>);
        }
        else {
            console.log("RenderedItems on : ", RenderedItems)
            return (

                <>
                    <RenderedItems />
                </>
            );
        }



    };


    useEffect(() => {
        getItems();
    }, [usedTech]);

    return (
        <Grid container direction="column" width="100%">
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
                                    )
                                    :
                                    (
                                        <Stack spacing={3} justifyContent="space-evenly" alignItems="flex-start" maxWidth="100%" className="notEmptyStack">
                                            <ItemColumn />
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

export default ProjectColumn;