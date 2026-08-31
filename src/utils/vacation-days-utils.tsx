import { Grid, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { User } from "src/generated/homeLambdasClient";
import { getVacationColors, parseVacationDays } from "src/utils/time-utils.ts";
import { getVacationYear } from "src/utils/vacations-utils";
import strings from "../localization/strings";

/**
 * Display persons vacation days in card
 *
 * @param user KeyCloak user
 */
export const renderVacationDaysTextForCard = (user: User, theme: Theme) => {
  const { vacationDaysByYearColor, unspentVacationDaysByYearColor } = getVacationColors(
    user,
    theme
  );
  const currentYear = getVacationYear();

  if (user) {
    return (
      <Grid>
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: "center"
          }}
        >
          <Grid size={6}>{strings.vacationsCard.vacationDays}</Grid>
          <Grid size={6}>
            <Typography color={vacationDaysByYearColor}>
              {user.attributes?.vacationDaysByYear
                ? parseVacationDays(user.attributes?.vacationDaysByYear)[currentYear]
                : strings.vacationsCard.vacationDaysNotFound}
            </Typography>
          </Grid>
        </Grid>
        <Grid
          container
          spacing={2}
          sx={{
            alignItems: "center"
          }}
        >
          <Grid size={6}>{strings.vacationsCard.unspentVacationDays}</Grid>
          <Grid size={6}>
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
export const renderVacationDaysTextForScreen = (user: User, theme: Theme) => {
  const currentYear = getVacationYear();

  if (user) {
    return (
      <Grid
        sx={{
          display: "flex",
          justifyContent: "space-around",
          backgroundColor: theme.palette.background.accentSecondary,
          borderRadius: theme.radius.s,
          height: 48,
          my: theme.spaces.xl,
          py: theme.spaces.s,
          px: theme.spaces.m
        }}
      >
        <Grid
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <Typography variant="body" sx={{ fontWeight: 500 }}>
            {strings.vacationsCard.vacationDays}
          </Typography>
          <Typography variant="body" sx={{ fontWeight: 500 }}>
            {user.attributes?.vacationDaysByYear
              ? parseVacationDays(user.attributes?.vacationDaysByYear)[currentYear]
              : strings.vacationsCard.vacationDaysNotFound}
          </Typography>
        </Grid>
        <Grid
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >
          <Typography variant="body" sx={{ fontWeight: 500 }}>
            {strings.vacationsCard.unspentVacationDays}
          </Typography>
          <Typography variant="body" sx={{ fontWeight: 500 }}>
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
