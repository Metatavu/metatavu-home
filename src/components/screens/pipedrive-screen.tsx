import { Box, Card, CardContent, Checkbox, Divider, FormControl, Grid, InputLabel, ListItemText, MenuItem, NativeSelect, OutlinedInput, Select, SelectChangeEvent, Typography, useMediaQuery } from "@mui/material";
import ProjectRow from "../pipedrive-project/projectrows";
import { SortByAlpha } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { MenuProps } from "react-select";

const PipedriveScreen = () => {


    //  Used to check if user has laptop/PC sized screen or not.
    const notMobileScreen = useMediaQuery('(min-width: 768px)');
    const [sort, setSort] = useState('recent');
    const [usedTechList, setUsedTechList] = useState<string[]>([]);

    const techList = [
        'all',
        'java',
        'c#',
        'javascript',
        'typescript',
        'sql',
        'mongodb',
        'erp',
        'crm',
        '.net'
    ]


    const handleSorting = async (event: SelectChangeEvent) => {
        await setSort(event.target.value as string);
    };

    const handleFilter = (event: SelectChangeEvent<typeof usedTechList>) => {
        const {
          target: { value },
        } = event;
        setUsedTechList(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(', ') : value,
        );

        console.log("usedTechList");
        console.log(usedTechList);
      };


    const SalesColumns = () => {
        return (
            <>
                <Grid container direction="row" spacing={3} justifyContent="space-evenly">


                    <Grid item xs={12} sm={12} md={3.5}>
                        <ProjectRow title='Leads' rowtype='leads' sorting={sort} usedTech={usedTechList} />
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
                        <ProjectRow title='Deals' rowtype='deals' sorting={sort} usedTech={usedTechList} />
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
                        <ProjectRow title='Projects' rowtype='dealswon' sorting={sort} usedTech={usedTechList} />
                    </Grid>


                </Grid>
            </>
        )
    }

    useEffect(() => {
        console.log("Sort:")
        console.log(sort);
    }, [sort, usedTechList]);

    return (
        // 
        <Card>

            <CardContent>
                <Typography variant="h3" style={{ marginTop: 6, textAlign: "center" }}>{/*strings.tableToolbar.myRequests*/}Sales Projects</Typography>

                <Divider />

                <Grid container marginY="16px">
                    <Grid item sx={{ display: "flex" }} marginX="auto" >
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="demo-simple-select-label">Sort: </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={sort}
                                    label="Sort"
                                    onChange={handleSorting}
                                    sx={{ width: "100%" }}
                                >
                                    <MenuItem value="recent">Recent</MenuItem>
                                    <MenuItem value="old">Old</MenuItem>

                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                    <Grid item sx={{ display: "flex" }} marginX="auto" >
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl sx={{ m: 1, width: 300 }} size="small">
                                <InputLabel id="demo-multiple-checkbox-label">Tag</InputLabel>
                                <Select
                                    labelId="demo-multiple-checkbox-label"
                                    id="demo-multiple-checkbox"
                                    multiple
                                    value={usedTechList}
                                    onChange={handleFilter}
                                    input={<OutlinedInput label="Tag" />}
                                    renderValue={(selected) => selected.join(', ')}
                                    // MenuProps={MenuProps}
                                >
                                    {techList.map((name) => (
                                        <MenuItem key={name} value={name}>
                                            <Checkbox checked={usedTechList.indexOf(name) > -1} />
                                            <ListItemText primary={name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>


                <Grid container>
                    <SalesColumns />
                </Grid>

            </CardContent>
        </Card>
    );

};

export default PipedriveScreen;