import { Grid, Typography } from "@mui/material";
import { theme } from "../theme";
import { Person } from "../generated/client";
import strings from "../localization/strings";

/**
 * Display persons vacation days
 *
 * @param Person timebank person
 */
export const renderVacationDaysTextForCard = (person: Person) => {
  const spentVacationsColor =
    person && person.spentVacations > 0
      ? theme.palette.success.main
      : theme.palette.error.main;

  const unspentVacationsColor =
    person && person.unspentVacations > 0
      ? theme.palette.success.main
      : theme.palette.error.main;

  if (person) {
    return (
      <Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            {strings.vacationsCard.spentVacations}
          </Grid>
          <Grid item xs={6}>
            <Typography color={spentVacationsColor}>
              {person.spentVacations}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            {strings.vacationsCard.unspentVacations}
          </Grid>
          <Grid item xs={6}>
            <Typography color={unspentVacationsColor}>
              {person.unspentVacations}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  } else {
    return <Typography>{strings.error.personsFetch}</Typography>;
  }
};

/**
 * Display persons vacation days
 *
 * @param Person timebank person
 */
export const renderVacationDaysTextForScreen = (person: Person) => {
  const spentVacationsColor =
    person && person.spentVacations > 0
      ? theme.palette.success.main
      : theme.palette.error.main;

  const unspentVacationsColor =
    person && person.unspentVacations > 0
      ? theme.palette.success.main
      : theme.palette.error.main;

  if (person) {
    return (
      <Grid container justifyContent="space-around">
        <Grid item style={{ display: "flex", alignItems: "center" }}>
          {strings.vacationsCard.spentVacations}
          <Typography color={spentVacationsColor} style={{ marginLeft: "8px" }}>
            {person.spentVacations}
          </Typography>
        </Grid>
        <Grid item style={{ display: "flex", alignItems: "center" }}>
          {strings.vacationsCard.unspentVacations}
          <Typography color={unspentVacationsColor} style={{ marginLeft: "8px" }}>
            {person.unspentVacations}
          </Typography>
        </Grid>
      </Grid>
    );
  } else {
    return <Typography>{strings.error.personsFetch}</Typography>;
  }
};
