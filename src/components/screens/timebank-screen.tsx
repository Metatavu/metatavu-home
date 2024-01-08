import { useEffect, useState } from "react";
import { Person, Timespan } from "../../generated/client";
import { CircularProgress, Card } from "@mui/material";
import { userProfileAtom } from "../../atoms/auth";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { errorAtom } from "../../atoms/error";
import {
  dailyEntriesAtom,
  personDailyEntryAtom,
  personTotalTimeAtom,
  personsAtom,
  timespanAtom
} from "../../atoms/person";
import { useApi } from "../../hooks/use-api";
import TimebankContent from "../timebank/timebank-content";
import { DateTime } from "luxon";
import strings from "../../localization/strings";
import config from "../../app/config";

/**
 * Time bank screen component.
 */
const TimebankScreen = () => {
  const userProfile = useAtomValue(userProfileAtom);
  const timespan = useAtomValue(timespanAtom);
  const setError = useSetAtom(errorAtom);
  const { personsApi, dailyEntriesApi } = useApi();
  const persons = useAtomValue(personsAtom);
  const [loading, setLoading] = useState(false);
  const [personTotalTime, setPersonTotalTime] = useAtom(personTotalTimeAtom);
  const [personDailyEntry, setPersonDailyEntry] = useAtom(personDailyEntryAtom);
  const [dailyEntries, setDailyEntries] = useAtom(dailyEntriesAtom);

  useEffect(() => {
    getPersonTotalTime();
  }, [persons, timespan]);

  useEffect(() => {
    getPersonDailyEntries();
  }, [persons]);

  /**
   * Gets person's total time data.
   */
  const getPersonTotalTime = async () => {
    if (!persons.length) {
      setLoading(true);
      const loggedInPerson = persons.find(
        (person: Person) => person.keycloakId === userProfile?.id
      );
      if (loggedInPerson || config.person.id) {
        try {
          const fetchedPersonTotalTime = await personsApi.listPersonTotalTime({
            personId: loggedInPerson?.id || config.person.id,
            timespan: timespan || Timespan.ALL_TIME,
            before: new Date()
          });
          setPersonTotalTime(fetchedPersonTotalTime[0]);
        } catch (error) {
          setError(`${strings.error.totalTimeFetch}, ${error}`);
        }
      }
    }
    setLoading(false);
  };

  /**
   * Gets the logged in person's daily entries.
   */
  const getPersonDailyEntries = async () => {
    if (!persons.length) return null;

    const loggedInPerson = persons.find((person: Person) => person.keycloakId === userProfile?.id);
    if (loggedInPerson || config.person.id) {
      try {
        const fetchedDailyEntries = await dailyEntriesApi.listDailyEntries({
          personId: loggedInPerson?.id || config.person.id
        });
        setDailyEntries(fetchedDailyEntries);
        setPersonDailyEntry(
          fetchedDailyEntries.find((item) => item.date <= new Date() && item.logged)
        );
      } catch (error) {
        setError(`${strings.error.dailyEntriesFetch}, ${error}`);
      }
    }
  };

  /**
   * Changes the displayed daily entry in the pie chart via the Date Picker.
   *
   * @param selectedDate selected date from DatePicker
   */
  const handleDailyEntryChange = (selectedDate: DateTime) => {
    if (selectedDate) {
      setPersonDailyEntry(
        dailyEntries.find((item) => DateTime.fromJSDate(item.date).day === selectedDate.day)
      );
    }
  };

  if (!personDailyEntry || !dailyEntries.length || !personTotalTime) {
    return (
      <Card sx={{ p: "25%", display: "flex", justifyContent: "center" }}>
        {loading ? <CircularProgress sx={{ scale: "150%" }} /> : null}
      </Card>
    );
  }

  return <TimebankContent handleDailyEntryChange={handleDailyEntryChange} loading={loading} />;
};

export default TimebankScreen;
