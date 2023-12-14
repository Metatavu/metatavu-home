import {
  Box,
  List,
  ListItem,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  ListItemText,
  Typography,
  Card,
  CircularProgress,
  Grow,
  Container,
  InputLabel,
  FormControl
} from "@mui/material";
import { formatTimePeriod, getHoursAndMinutes } from "../../utils/time-utils";
import { DailyEntry, Timespan } from "../../generated/client";
import TimebankPieChart from "../charts/timebank-piechart";
import TimebankOverviewChart from "../charts/timebank-overviewchart";
import { DatePicker } from "@mui/x-date-pickers";
import { DateTime } from "luxon";
import strings from "../../localization/strings";
import TimebankMultiBarChart from "../charts/timebank-multibarchart";
import DateRangePicker from "./timebank-daterange-picker";
import { useState } from "react";
import { theme } from "../../theme";
import { useAtom, useAtomValue } from "jotai";
import {
  personTotalTimeAtom,
  personDailyEntryAtom,
  dailyEntriesAtom,
  timespanAtom,
  personsAtom
} from "../../atoms/person";
import UserRoleUtils from "../../utils/user-role-utils";
import { userProfileAtom } from "../../atoms/auth";

/**
 * Component properties
 */
interface Props {
  handleDailyEntryChange: (selectedDate: DateTime) => void;
  loading: boolean;
}

/**
 * Component that contains the entirety of Timebank content, such as charts
 *
 * @param props Component properties
 */
const TimebankContent = (props: Props) => {
  const userProfile = useAtomValue(userProfileAtom);
  const { handleDailyEntryChange, loading } = props;

  const [selectedEntries, setSelectedEntries] = useState<DailyEntry[]>([]);
  const [byRange, setByRange] = useState({
    dailyEntries: false
  });
  const personTotalTime = useAtomValue(personTotalTimeAtom);
  const persons = useAtomValue(personsAtom);
  const [timespan, setTimespan] = useAtom(timespanAtom);
  const personDailyEntry = useAtomValue(personDailyEntryAtom);
  const dailyEntries = useAtomValue(dailyEntriesAtom);
  const adminMode = UserRoleUtils.adminMode();
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(
    userProfile?.id ? Number(localStorage.getItem("selectedEmployee") || userProfile.id) : null
  );
  const todayOrEarlier = DateTime.fromJSDate(
    dailyEntries.filter((item) => item.date <= new Date() && item.logged)[0].date
  );

  /**
   * Allows only logged dates or with expected hours to be selected in the date time picker.
   *
   * @param date DateTime object passed from the date picker
   */
  const disableNullEntries = (date: DateTime) => {
    const loggedDates = dailyEntries.find(
      (item) =>
        item.logged &&
        item.expected &&
        DateTime.fromJSDate(item.date).toISODate() === date.toISODate()
    );

    return loggedDates
      ? !(DateTime.fromJSDate(loggedDates.date).toISODate() === date.toISODate())
      : true;
  };

  /**
   * Renders overview chart and list item elements containing total time summaries
   */
  const renderOverViewChart = () => {
    if (loading) {
      return (
        <CircularProgress
          sx={{
            margin: "auto",
            mt: "5%",
            mb: "5%"
          }}
        />
      );
    }
    if (!personTotalTime) return null;

    return (
      <>
        <TimebankOverviewChart />
        <List dense sx={{ marginLeft: "5%" }}>
          <ListItem>
            <ListItemText
              sx={{
                color: getHoursAndMinutes(personTotalTime.balance).startsWith("-")
                  ? theme.palette.error.main
                  : theme.palette.success.main
              }}
              primary={strings.timebank.balance}
              secondary={getHoursAndMinutes(personTotalTime.balance)}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={strings.timebank.logged}
              secondary={getHoursAndMinutes(personTotalTime.logged)}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={strings.timebank.expected}
              secondary={getHoursAndMinutes(personTotalTime.expected)}
            />
          </ListItem>
        </List>
      </>
    );
  };

  /**
   * Renders a daily entry pie chart or a bar chart of daily entries from a selected range.
   *
   * @returns JSX.Element consisting of either chart component
   */
  const renderDailyEntryOrRangeChart = () => {
    if (byRange.dailyEntries && selectedEntries) {
      return <TimebankMultiBarChart selectedEntries={selectedEntries} />;
    }
    return <TimebankPieChart />;
  };

  /**
   * Renders date picker or range date picker associated with above charts.
   *
   * @returns JSX.Element consisting of either date picker component.
   */
  const renderDatePickers = () => {
    if (dailyEntries && !byRange.dailyEntries) {
      return (
        <DatePicker
          sx={{
            width: "40%",
            marginRight: "1%"
          }}
          label={strings.timebank.selectEntry}
          onChange={(value) => (value ? handleDailyEntryChange(value) : null)}
          value={todayOrEarlier}
          minDate={DateTime.fromJSDate(dailyEntries[dailyEntries.length - 1].date)}
          maxDate={DateTime.fromJSDate(dailyEntries[0].date)}
          shouldDisableDate={disableNullEntries}
        />
      );
    }

    return (
      <DateRangePicker
        dailyEntries={dailyEntries}
        setSelectedEntries={setSelectedEntries}
        today={todayOrEarlier}
      />
    );
  };

  return (
    <>
      {adminMode && (
      <Grow in>
        <Card sx={{ p: "1%", display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <FormControl fullWidth>
            <InputLabel id="employee-select-label">Select Employee</InputLabel>
            <Select
              labelId="employee-select-label"
              id="employee-select"
              value={selectedEmployee}
              onChange={(event) => setSelectedEmployee(Number(event.target.value))}
              label="Select Employee"
            >
              {persons.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {`${person.firstName} ${person.lastName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Card>
      </Grow>
    )}
      <Grow in>
        <Card sx={{ border: "2px solid #bdbdbd;" }}>
          <Typography
            gutterBottom
            fontWeight="bold"
            variant="h6"
            sx={{
              color: "white",
              textAlign: "center",
              backgroundColor: "#bdbdbd",
              width: "100%",
              p: 2
            }}
          >
            {strings.timebank.barChartDescription}
          </Typography>
          <Container sx={{ p: 3 }}>
            <Box
              sx={{
                textAlign: "center",
                scale: "150%",
                mb: 3
              }}
            >
              <Typography>{strings.timebank.timeperiod}</Typography>
              <Typography sx={{ color: "grey" }}>
                {formatTimePeriod(personTotalTime?.timePeriod?.split(","))}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <FormControl
                sx={{
                  width: "50%",
                  marginRight: "1%",
                  textAlign: "center"
                }}
              >
                <InputLabel id="select">{strings.timebank.selectTimespan}</InputLabel>
                <Select
                  label="Select a time span"
                  labelId="select"
                  sx={{
                    width: "100%"
                  }}
                  value={timespan}
                  onChange={(e) => {
                    setTimespan(e.target.value as Timespan);
                  }}
                >
                  <MenuItem value={Timespan.WEEK}>{strings.timeExpressions.week}</MenuItem>
                  <MenuItem value={Timespan.MONTH}>{strings.timeExpressions.month}</MenuItem>
                  <MenuItem value={Timespan.ALL_TIME}>{strings.timeExpressions.allTime}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyItems: "center"
              }}
            >
              {renderOverViewChart()}
            </Box>
          </Container>
        </Card>
      </Grow>
      <br />
      <Grow in>
        <Card sx={{ border: "2px solid #bdbdbd;", mb: 3 }}>
          <Typography
            gutterBottom
            fontWeight="bold"
            variant="h6"
            sx={{
              color: "white",
              textAlign: "center",
              backgroundColor: "#bdbdbd",
              width: "100%",
              p: 2
            }}
          >
            {strings.timebank.pieChartDescription}
          </Typography>
          <Container sx={{ p: 3 }}>
            <ListItemText
              sx={{
                textAlign: "center",
                scale: "150%",
                p: 3
              }}
              primary={strings.timebank.logged}
              secondary={
                byRange.dailyEntries
                  ? getHoursAndMinutes(
                      Number(selectedEntries?.reduce((prev, next) => prev + next.logged, 0))
                    )
                  : getHoursAndMinutes(Number(personDailyEntry?.logged))
              }
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center"
              }}
            >
              {renderDatePickers()}
              <FormControlLabel
                sx={{ display: "inline" }}
                label={strings.timebank.byrange}
                control={
                  <Checkbox
                    checked={byRange.dailyEntries}
                    onClick={() =>
                      setByRange({ ...byRange, dailyEntries: byRange.dailyEntries ? false : true })
                    }
                  />
                }
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyItems: "center"
              }}
            >
              {renderDailyEntryOrRangeChart()}
              <List dense sx={{ marginLeft: "5%" }}>
                <ListItem>
                  <ListItemText
                    sx={{ color: theme.palette.success.dark }}
                    primary={strings.timebank.billableProject}
                    secondary={
                      byRange.dailyEntries && selectedEntries
                        ? getHoursAndMinutes(
                            Number(
                              selectedEntries.reduce(
                                (prev, next) => prev + next.billableProjectTime,
                                0
                              )
                            )
                          )
                        : getHoursAndMinutes(Number(personDailyEntry?.billableProjectTime))
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    sx={{ color: theme.palette.success.light }}
                    primary={strings.timebank.nonBillableProject}
                    secondary={
                      byRange.dailyEntries && selectedEntries
                        ? getHoursAndMinutes(
                            Number(
                              selectedEntries.reduce(
                                (prev, next) => prev + next.nonBillableProjectTime,
                                0
                              )
                            )
                          )
                        : getHoursAndMinutes(Number(personDailyEntry?.nonBillableProjectTime))
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    sx={{ color: theme.palette.warning.main }}
                    primary={strings.timebank.internal}
                    secondary={
                      byRange.dailyEntries && selectedEntries
                        ? getHoursAndMinutes(
                            Number(
                              selectedEntries.reduce((prev, next) => prev + next.internalTime, 0)
                            )
                          )
                        : getHoursAndMinutes(Number(personDailyEntry?.internalTime))
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    sx={{ color: theme.palette.info.main }}
                    primary={strings.timebank.expected}
                    secondary={
                      byRange.dailyEntries && selectedEntries
                        ? getHoursAndMinutes(
                            Number(selectedEntries.reduce((prev, next) => prev + next.expected, 0))
                          )
                        : getHoursAndMinutes(Number(personDailyEntry?.expected))
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </Container>
        </Card>
      </Grow>
    </>
  );
};

export default TimebankContent;
