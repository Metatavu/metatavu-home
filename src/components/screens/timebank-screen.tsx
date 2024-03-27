import { useEffect, useState } from "react";
import { Person, Timespan } from "../../generated/client";
import { CircularProgress, Card } from "@mui/material";
import { userProfileAtom } from "../../atoms/auth";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { errorAtom } from "../../atoms/error";
import {
  dailyEntriesAtom,
  personDailyEntryAtom,
  personsAtom,
  timebankScreenPersonTotalTimeAtom,
  timespanAtom
} from "../../atoms/person";
import { useApi } from "../../hooks/use-api";
import TimebankContent from "../timebank/timebank-content";
import { DateTime } from "luxon";
import strings from "../../localization/strings";
import config from "../../app/config";

/**
 * Timebank screen component.
 */
const TimebankScreen = () => {
  const userProfile = useAtomValue(userProfileAtom);
  const timespan = useAtomValue(timespanAtom);
  const setError = useSetAtom(errorAtom);
  const { personsApi, dailyEntriesApi } = useApi();
  const persons = useAtomValue(personsAtom);
  const [loading, setLoading] = useState(false);
  const [personTotalTime, setPersonTotalTime] = useAtom(timebankScreenPersonTotalTimeAtom);
  const [personDailyEntry, setPersonDailyEntry] = useAtom(personDailyEntryAtom);
  const [dailyEntries, setDailyEntries] = useAtom(dailyEntriesAtom);
  const loggedInPerson = persons.find(
    (person: Person) => person.id === config.person.forecastUserIdOverride || person.keycloakId === userProfile?.id
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(loggedInPerson?.id);
  const selectedPerson = persons.find((person) => person.id === selectedEmployeeId);

  useEffect(() => {
    if (selectedEmployeeId) {
      getPersonTotalTime(selectedEmployeeId);
    }
  }, [persons, selectedEmployeeId, timespan]);

  useEffect(() => {
    if (loggedInPerson) {
      setSelectedEmployeeId(loggedInPerson.id);
    }
  }, [loggedInPerson]);

  useEffect(() => {
    getPersonDailyEntries();
  }, [persons]);

  useEffect(() => {
    if (selectedPerson) {
      getPersonDailyEntriesForPieChart(selectedPerson);
    }
  }, [persons, selectedPerson]);

  /**
   * Gets  selectedPerson's total time data.
   *
   * @param selectedPersonId selected person id
   */

  /**
   * Gets person's total time data.
   */
  const getPersonTotalTime = async (selectedPersonId: number) => {
    setLoading(true);
    if (selectedPersonId) {
      try {
        const fetchedPersonTotalTime = await personsApi.listPersonTotalTime({
          personId: selectedPersonId,
          timespan: timespan || Timespan.ALL_TIME,
          before: DateTime.now().minus({ days: 1 }).toJSDate()
        });
        setPersonTotalTime(fetchedPersonTotalTime[0]);
      } catch (error) {
        setError(`${strings.error.totalTimeFetch}, ${error}`);
      }
    }
    setLoading(false);
  };

  /**
   * Gets the logged in person's daily entries.
   */
  const getPersonDailyEntries = async () => {
    if (loggedInPerson) {
      try {
        const fetchedDailyEntries = await dailyEntriesApi.listDailyEntries({
          personId: loggedInPerson.id
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
   * Gets daily entries for the selected employee for the pie chart.
   *
   * @param selectedPerson daily entries
   */
  const getPersonDailyEntriesForPieChart = async (selectedPerson: Person) => {
    if (selectedPerson) {
      try {
        const fetchedDailyEntries = await dailyEntriesApi.listDailyEntries({
          personId: selectedPerson.id
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
  const handleDailyEntryChange = async (selectedDate: DateTime) => {
    try {
      const fetchedDailyEntries = await dailyEntriesApi.listDailyEntries({
        personId: selectedEmployeeId
      });
      setDailyEntries(fetchedDailyEntries);
      setPersonDailyEntry(
        fetchedDailyEntries.find((item) => item.person === selectedEmployeeId && DateTime.fromJSDate(item.date).toISODate() === selectedDate.toISODate())
      );
    } catch (error) {
      setError(`${strings.error.dailyEntriesFetch}, ${error}`);
    }
  };

  return (
    <div>
      <div style={{ marginTop: "16px" }} />
      {!personDailyEntry || !selectedEmployeeId || !dailyEntries.length || !personTotalTime ? (
        <Card sx={{ p: "25%", display: "flex", justifyContent: "center" }}>
          { loading && <CircularProgress sx={{ scale: "150%" }} /> }
        </Card>
      ) : (
        <TimebankContent
          handleDailyEntryChange={handleDailyEntryChange}
          loading={loading}
          selectedEmployeeId={selectedEmployeeId}
          setSelectedEmployeeId={setSelectedEmployeeId}
        />
      )}
    </div>
  );
};

export default TimebankScreen;
