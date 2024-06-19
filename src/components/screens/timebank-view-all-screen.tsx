import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { personsAtom } from "src/atoms/person";
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  Typography
} from "@mui/material";
import { DateTime } from "luxon";
import { languageAtom } from "src/atoms/language";
import { theme } from "src/theme";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  type TooltipProps,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { type PersonWithTotalTime, WorkTimeCategory, type WorkTimeTotalData } from "src/types";
import { getHoursAndMinutes } from "src/utils/time-utils";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import strings from "src/localization/strings";
import { useApi } from "src/hooks/use-api";
import { errorAtom } from "src/atoms/error";
import { type PersonTotalTime, Timespan } from "src/generated/client";
import { type ChangeEvent, useEffect, useState } from "react";
import { COLORS } from "../constants";
import { renderSearch } from "src/utils/search-utils";

/**
 * Timebank view all screen component
 */
const TimebankViewAllScreen = () => {
  const { personsApi } = useApi();
  const language = useAtomValue(languageAtom);
  const setError = useSetAtom(errorAtom);
  const [personsWithTotalTime, setPersonsWithTotalTime] = useState<PersonWithTotalTime[]>([]);
  const [persons] = useAtom(personsAtom);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [displayedPersonsTotalTime, setDisplayedPersonsTotalTime] = useState<PersonWithTotalTime[]>(
    []
  );

  /**
   * Renders the customized tooltip for charts
   *
   * @param props props of the custom tooltip
   */
  const renderCustomizedTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, payload } = props;

    if (!active || !payload || !payload.length) {
      return null;
    }

    const selectedData = payload[0];

    if (!selectedData.value || !selectedData.name) {
      return null;
    }

    const sectionName = {
      [WorkTimeCategory.BILLABLE_PROJECT]: strings.timebank.billableProjectTime,
      [WorkTimeCategory.NON_BILLABLE_PROJECT]: strings.timebank.nonBillableProjectTime,
      [WorkTimeCategory.INTERNAL]: strings.timebank.internalTime
    }[selectedData.name];

    return (
      <Box style={{ backgroundColor: "rgba(0, 0, 0)", opacity: "70%" }}>
        <Typography
          variant="h6"
          style={{
            color: "#fff",
            padding: theme.spacing(1)
          }}
        >
          {`${sectionName}: ${getHoursAndMinutes(selectedData.value as number)}`}
        </Typography>
      </Box>
    );
  };

  /**
   * Render piechart component
   *
   * @param personWithTotalTime person with total time object
   * @param legend legend boolean
   */
  const renderPieChart = (personWithTotalTime: PersonWithTotalTime, legend: boolean) => {
    const { person, personTotalTime } = personWithTotalTime;

    if (!person || !personTotalTime) return null;

    const workTimeData: WorkTimeTotalData[] = [
      { name: WorkTimeCategory.BILLABLE_PROJECT, balance: personTotalTime.billableProjectTime },
      {
        name: WorkTimeCategory.NON_BILLABLE_PROJECT,
        balance: personTotalTime.nonBillableProjectTime
      },
      { name: WorkTimeCategory.INTERNAL, balance: personTotalTime.internalTime }
    ];

    return (
      <ResponsiveContainer width={"75%"} height={150}>
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            dataKey="balance"
            data={workTimeData}
            label={(props) => getHoursAndMinutes(props.value)}
          >
            {workTimeData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          {legend ? <Legend wrapperStyle={{ position: "relative" }} /> : null}
          <Tooltip content={renderCustomizedTooltip} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  /**
   * Populate one person's total work data
   *
   * @param person person with total time data
   */
  const getPersonTotalTimeData = async (
    person: PersonWithTotalTime
  ): Promise<PersonWithTotalTime> => {
    let totalTime: PersonTotalTime[] = [];

    try {
      totalTime = await personsApi.listPersonTotalTime({
        personId: person.person.id,
        timespan: Timespan.ALL_TIME
      });
    } catch (error) {
      setError(`${error} ${strings.error.totalTimeFetch}`);
    }

    return {
      ...person,
      personTotalTime: totalTime[0]
    };
  };

  /**
   * Fetches the person data & person total time data
   */
  const fetchPersonsAndPersonsTotalTime = async () => {
    setLoading(true);

    try {
      const personsTimeTotals = await Promise.all(
        persons
          .map((person) => ({
            person: person
          }))
          .map(getPersonTotalTimeData)
      );

      setPersonsWithTotalTime(personsTimeTotals);
      setDisplayedPersonsTotalTime(personsTimeTotals);
    } catch (error) {
      setError(`${error} ${strings.error.personsFetch}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPersonsAndPersonsTotalTime();
  }, [persons]);

  /**
   * Handle search input change
   *
   * @param event input change event
   */
  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSearchInput = event.target.value;
    setSearchInput(newSearchInput);

    if (newSearchInput === "") {
      setDisplayedPersonsTotalTime(personsWithTotalTime);
      return;
    }

    const newDisplayedPersonsTotalTime = personsWithTotalTime.filter((personsWithTotalTime) =>
      `${personsWithTotalTime.person.firstName} ${personsWithTotalTime.person.lastName}`
        .toLowerCase()
        .includes(newSearchInput.toLowerCase())
    );

    setDisplayedPersonsTotalTime(newDisplayedPersonsTotalTime);
  };

  /**
   * Get balance color
   *
   * @param personTotalTime person total time object
   * @returns color string
   */
  const getBalanceColor = (personTotalTime: PersonTotalTime) =>
    personTotalTime.balance > 0 ? theme.palette.success.main : theme.palette.error.main;

  return (
    <>
      <Card sx={{ marginBottom: 2 }}>
        {renderSearch({ loading, searchInput, handleSearchInputChange, placeholder: strings.timebank.searchPlaceholder })}
      </Card>
      <Grid container spacing={2} textAlign={"center"} marginBottom={20}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              marginTop: 10
            }}
          >
            <Box>
              <Typography>{strings.placeHolder.pleaseWait}</Typography>
            </Box>
            <Box
              sx={{
                marginTop: 2
              }}
            >
              <CircularProgress sx={{ margin: "auto", mt: "5%", mb: "5%" }} />
            </Box>
          </Box>
        ) : (
          displayedPersonsTotalTime.map((personWithTotalTime) => {
            return (
              <Grid item xs={12} sm={6} md={4} key={personWithTotalTime.person.id}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "400px",
                    "& .recharts-wrapper .recharts-surface": {
                      overflow: "visible"
                    }
                  }}
                >
                  <Box sx={{ padding: "10px", marginBottom: "60px" }}>
                    <Typography variant="h4">{`${personWithTotalTime.person.firstName} ${personWithTotalTime.person.lastName}`}</Typography>
                    <Typography>
                      {strings.viewAll.startDate}
                      {personWithTotalTime.person.startDate &&
                        DateTime.fromFormat(personWithTotalTime.person.startDate, "yyyy-M-d")
                          .setLocale(language)
                          .toLocaleString()}
                    </Typography>
                  </Box>
                  {renderPieChart(personWithTotalTime, false)}
                  <Box sx={{ display: "flex", justifyContent: "center", marginTop: "60px" }}>
                    <Typography fontSize={22} marginRight={1}>
                      {strings.viewAll.balance}
                    </Typography>
                    {personWithTotalTime.personTotalTime && (
                      <Typography
                        fontSize={22}
                        color={getBalanceColor(personWithTotalTime.personTotalTime)}
                      >
                        {getHoursAndMinutes(personWithTotalTime.personTotalTime.balance)}
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </>
  );
};

export default TimebankViewAllScreen;
