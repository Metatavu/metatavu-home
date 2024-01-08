import { Typography, Grid } from "@mui/material";
import { theme } from "../../theme";
import { Person } from "../../generated/client";
import strings from "../../localization/strings";

/**
 * Display persons vacation days
 * @param Person timebank person
 */
export const renderVacationDays = (person: Person) => {
  const loading = true;

  const spentVacationsColor =
    person && person.spentVacations > 0
      ? theme.palette.success.main
      : theme.palette.error.main;

  const unspentVacationsColor =
    person && person.unspentVacations > 0
      ? theme.palette.success.main
      : theme.palette.error.main;

  if (!loading) {
    return <Typography>{strings.error.personsFetch}</Typography>;
  } else if (person) {
    return (
      <>
        <Grid container>
          <Grid xs={6.5}>{strings.vacationsCard.spentVacations}</Grid>
          <Typography color={spentVacationsColor}>{person.spentVacations}</Typography>
          <Grid xs={6.5}>{strings.vacationsCard.unspentVacations}</Grid>
          <Typography color={unspentVacationsColor}>{person.unspentVacations}</Typography>
        </Grid>
      </>
    );
  }
};
