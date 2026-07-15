import { Grid, Typography, useTheme } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect } from "react";
import { errorAtom } from "src/atoms/error";
import { onCallAtom } from "src/atoms/oncall";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { parseNameFromEmail } from "src/utils/user-name-utils";
import HomepageCard, { type CardProps } from "../generics/homepageCard";

/**
 * On call card component.
 *
 * Shows name of the person currently on call with email adress.
 *
 * @param props.hidden - Boolean indicating if card is hidden
 * @param props.onToggleHidden - Functionality for changing card visibility
 * @param props.editmode - Boolean indicating if editmode is on
 *
 * @returns Styled card showing on call information for user
 */
const OnCallCard = ({ hidden, onToggleHidden, editmode }: CardProps) => {
  const { onCallApi } = useLambdasApi();
  const theme = useTheme();
  const [onCallData, setOnCallData] = useAtom(onCallAtom);
  const path = "oncall";

  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    getOnCallData(DateTime.now().year);
  }, []);

  /**
   * Fetches on-call data for a specific year
   *
   * @param year Number
   */
  const getOnCallData = async (year: number) => {
    try {
      const fetchedData = await onCallApi.listOnCallData({ year: year.toString() });
      setOnCallData(fetchedData);
    } catch (error: any) {
      const errorMessage = await error.response.json();
      setError(`${strings.oncall.fetchFailed}: ${errorMessage.message}`);
    }
  };

  const renderOnCallCard = () => {
    const currentWeek = DateTime.now().weekNumber;
    const currentOnCallPerson = onCallData.find((item) => Number(item.week) === currentWeek)?.email;
    const onCallName = currentOnCallPerson && parseNameFromEmail(currentOnCallPerson);
    const nameString = onCallName
      ? `${onCallName.firstName} ${onCallName.lastName}`
      : strings.oncall.noOnCallPerson;

    return (
      <Grid container direction="column" pt={theme.spaces.s}>
        <Typography variant="body" sx={{ fontWeight: 500 }}>
          {nameString}
        </Typography>
        <Typography variant="body">{currentOnCallPerson}</Typography>
      </Grid>
    );
  };

  return (
    <HomepageCard
      title={strings.oncall.title}
      content={renderOnCallCard()}
      path={path}
      hidden={hidden}
      onToggleHidden={onToggleHidden}
      editmode={editmode}
    />
  );
};

export default OnCallCard;
