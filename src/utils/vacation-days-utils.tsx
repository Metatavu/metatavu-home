import { Grid, Typography, useTheme } from "@mui/material";
import type { User } from "src/generated/homeLambdasClient";
import { getVacationColors, parseVacationDays } from "src/utils/time-utils.ts";
import strings from "../localization/strings";

/**
 * Display persons vacation days in card
 *
 * @param user KeyCloak user
 */
export const renderVacationDaysTextForCard = (user: User) => {
  const theme = useTheme();
  const { vacationDaysByYearColor, unspentVacationDaysByYearColor } = getVacationColors(
    user,
    theme
  );
  const currentYear = new Date().getFullYear();

  if (user) {
    return (
      <Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            {strings.vacationsCard.vacationDays}
          </Grid>
          <Grid item xs={6}>
            <Typography color={vacationDaysByYearColor}>
              {user.attributes?.vacationDaysByYear
                ? parseVacationDays(user.attributes?.vacationDaysByYear)[currentYear]
                : strings.vacationsCard.vacationDaysNotFound}
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            {strings.vacationsCard.unspentVacationDays}
          </Grid>
          <Grid item xs={6}>
            <Typography color={unspentVacationDaysByYearColor}>
              {user.attributes?.unspentVacationDaysByYear
                ? parseVacationDays(user.attributes?.unspentVacationDaysByYear)[currentYear]
                : strings.vacationsCard.unspentVacationDaysNotFound}
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
  const theme = useTheme();
  const { vacationDaysByYearColor, unspentVacationDaysByYearColor } = getVacationColors(
    user,
    theme
  );
  const currentYear = new Date().getFullYear();

  if (user) {
    return (
      <Grid container justifyContent="space-around">
        <Grid item style={{ display: "flex", alignItems: "center" }}>
          {strings.vacationsCard.vacationDays}
          <Typography color={vacationDaysByYearColor} style={{ marginLeft: "8px" }}>
            {user.attributes?.vacationDaysByYear
              ? parseVacationDays(user.attributes?.vacationDaysByYear)[currentYear]
              : strings.vacationsCard.vacationDaysNotFound}
          </Typography>
        </Grid>
        <Grid item style={{ display: "flex", alignItems: "center" }}>
          {strings.vacationsCard.unspentVacationDays}
          <Typography color={unspentVacationDaysByYearColor} style={{ marginLeft: "8px" }}>
            {user.attributes?.unspentVacationDaysByYear
              ? parseVacationDays(user.attributes?.unspentVacationDaysByYear)[currentYear]
              : strings.vacationsCard.unspentVacationDaysNotFound}
          </Typography>
        </Grid>
      </Grid>
    );
  }
  return <Typography>{strings.error.personsFetch}</Typography>;
};
