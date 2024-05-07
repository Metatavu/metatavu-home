import { Card, CardContent, Typography } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { errorAtom } from "src/atoms/error";
import { oncallAtom } from "src/atoms/oncall";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";

const OnCallCard = () => {
  const { onCallApi } = useLambdasApi();
  const [onCallData, setOnCallData] = useAtom(oncallAtom);

  const setError = useSetAtom(errorAtom);

  useEffect(() => {
    getOnCallData(DateTime.now().year);
  }, []);

  const getOnCallData = async (year: number) => {
    try {
      const fetchedData = await onCallApi.listOnCallData({ year: year.toString() });
      setOnCallData(fetchedData);
      getCurrentOnCallPerson();
    } catch (error) {
      setError(`${strings.error.fetchFailedGeneral}, ${error}`);
    }
  };

  const getCurrentOnCallPerson = () => {
    const currentWeek = DateTime.now().weekNumber;
    const currentOnCallPerson = onCallData.find(
      (item) => Number(item.week) === currentWeek
    )?.person;

    if (currentOnCallPerson)
      return (
        <>
          {strings.oncall.onCallPersonExists} <b>{currentOnCallPerson}</b>
        </>
      );
    return strings.oncall.noOnCallPerson;
  };

  return (
    <Link to={"oncall"} style={{ textDecoration: "none" }}>
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
            {strings.oncall.title}
          </Typography>
          <Typography variant="body1">{getCurrentOnCallPerson()}</Typography>
        </CardContent>
      </Card>
    </Link>
  );
};

export default OnCallCard;
