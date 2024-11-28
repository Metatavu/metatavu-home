import { Grid, Typography } from "@mui/material";
import strings from "../localization/strings";
import type { User } from "src/generated/homeLambdasClient";
import { getVacationColors, parseVacationDays } from "src/utils/time-utils.ts"

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
              {parseVacationDays(user.attributes?.vacationDaysByYear ?? ["2024:30"])[new Date().getFullYear()]}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            {strings.vacationsCard.unspentVacationDays}
          </Grid>
          <Grid item xs={6}>
            <Typography color={unspentVacationsColor}>
              {parseVacationDays(user.attributes?.unspentVacationDaysByYear ?? ["2024:30"])[new Date().getFullYear()]}
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
            {parseVacationDays(user.attributes?.vacationDaysByYear ?? ["2024:30"])[new Date().getFullYear()]}
          </Typography>
        </Grid>
        <Grid item style={{ display: "flex", alignItems: "center" }}>
          {strings.vacationsCard.unspentVacationDays}
          <Typography color={unspentVacationsColor} style={{ marginLeft: "8px" }}>
            {parseVacationDays(user.attributes?.unspentVacationDaysByYear ?? ["2024:30"])[new Date().getFullYear()]}
          </Typography>
        </Grid>
      </Grid>
    );
  }
    return <Typography>{strings.error.personsFetch}</Typography>;
};