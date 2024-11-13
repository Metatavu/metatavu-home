import { Grid, Typography } from "@mui/material";
import { theme } from "../theme";
import strings from "../localization/strings";
import type { User } from "src/generated/homeLambdasClient";

/**
 * Display persons vacation days in card
 *
 * @param user KeyCloak user
 */
export const renderVacationDaysTextForCard = (user: User) => {
  const { spentVacationsColor, unspentVacationsColor } = getVacationColors(user);

  if (user) {
    return (
      <Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            {strings.vacationsCard.vacationDays}
          </Grid>
          <Grid item xs={6}>
            <Typography color={spentVacationsColor}>
              {user.vacationDaysByYear}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            {strings.vacationsCard.unspentVacationDays}
          </Grid>
          <Grid item xs={6}>
            <Typography color={unspentVacationsColor}>
              {user.unspentVacationDaysByYear}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );
  }
    return <Typography>{strings.error.personsFetch}</Typography>;
};

/**
 * Display users vacation days in screen
 *
 * @param user Keycloak user
 */
export const renderVacationDaysTextForScreen = (user: User) => {
  const {spentVacationsColor, unspentVacationsColor} = getVacationColors(user);

  if (user) {
    return (
      <Grid container justifyContent="space-around">
        <Grid item style={{ display: "flex", alignItems: "center" }}>
          {strings.vacationsCard.vacationDays}
          <Typography color={spentVacationsColor} style={{ marginLeft: "8px" }}>
            {parseVacationDays(user.vacationDaysByYear)[new Date().getFullYear()]}
          </Typography>
        </Grid>
        <Grid item style={{ display: "flex", alignItems: "center" }}>
          {strings.vacationsCard.unspentVacationDays}
          <Typography color={unspentVacationsColor} style={{ marginLeft: "8px" }}>
            {parseVacationDays(user.unspentVacationDaysByYear)[new Date().getFullYear()]}
          </Typography>
        </Grid>
      </Grid>
    );
  }
    return <Typography>{strings.error.personsFetch}</Typography>;
};

/**
 * Calculate color for vacation days from vacation days
 *
 * @param user Keycloak user
 */
const getVacationColors = (user: User)=> {
  let spentVacationsColor = theme.palette.error.main;
  let unspentVacationsColor = theme.palette.error.main;

  if (user && parseVacationDays(user.vacationDaysByYear)[new Date().getFullYear()] > 0) {
    spentVacationsColor = theme.palette.success.main;
  }
  if (user && parseVacationDays(user.unspentVacationDaysByYear)[new Date().getFullYear()] > 0) {
    unspentVacationsColor = theme.palette.success.main;
  }
  return {
    spentVacationsColor,
    unspentVacationsColor
  };
}

/**
 * Parsing vacationDaysByYear from format ("YYYY:DDD") to object {[year: string]: [days: number]}
 *
 * @param vacationDaysByYear A list of strings with years and corresponding number of vacation days
 */
const parseVacationDays = (vacationDaysByYear: string[]): { [year: string]: number } => {
  return vacationDaysByYear.reduce((acc, entry) => {
    const [year, days] = entry.split(":");
    acc[year] = parseInt(days, 10);
    return acc;
  }, {} as { [year: string]: number });
}
