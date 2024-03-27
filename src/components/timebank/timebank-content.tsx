import {
  Box,
  List,
  ListItem,
  MenuItem,
  FormControlLabel,
  Checkbox,
  ListItemText,
  Typography,
  Card,
  CircularProgress,
  Grow,
  Container,
  FormControl,
  styled,
  TextField,
  InputLabel,
  Select
} from "@mui/material";
import { formatTimePeriod, getHoursAndMinutes } from "../../utils/time-utils";
import { Timespan } from "../../generated/client";
import TimebankPieChart from "../charts/timebank-piechart";
import TimebankOverviewChart from "../charts/timebank-overview-chart";
import { DatePicker } from "@mui/x-date-pickers";
import { DateTime } from "luxon";
import strings from "../../localization/strings";
import TimebankMultiBarChart from "../charts/timebank-multibar-chart";
import DateRangePicker from "./timebank-daterange-picker";
import { useEffect, useState } from "react";
import { theme } from "../../theme";
import { useAtom, useAtomValue } from "jotai";
import {
  personDailyEntryAtom,
  dailyEntriesAtom,
  timespanAtom,
  personsAtom,
  timebankScreenPersonTotalTimeAtom
} from "../../atoms/person";
import UserRoleUtils from "../../utils/user-role-utils";
import { DailyEntryWithIndexSignature, DateRange } from "../../types";
import LocalizationUtils from "../../utils/localization-utils";

/**
 * Component properties
 */
interface Props {
  handleDailyEntryChange: (selectedDate: DateTime) => void;
  loading: boolean;
  selectedEmployeeId: number | undefined;
  setSelectedEmployeeId: (selectedEmployeeId?: number) => void;
}

/**
 * Component that contains the entirety of Timebank content, such as charts
 *
 * @param props Component properties
 */
const TimebankContent = ({
  handleDailyEntryChange,
  loading,
  selectedEmployeeId,
  setSelectedEmployeeId
}: Props) => {
  const [selectedEntries, setSelectedEntries] = useState<DailyEntryWithIndexSignature[]>([]);
  const [byRange, setByRange] = useState({
    dailyEntries: false
  });
  const personTotalTime = useAtomValue(timebankScreenPersonTotalTimeAtom);
  const persons = useAtomValue(personsAtom);
  const [timespan, setTimespan] = useAtom(timespanAtom);
  const personDailyEntry = useAtomValue(personDailyEntryAtom);
  const dailyEntries = useAtomValue(dailyEntriesAtom);
  const isAdmin = UserRoleUtils.isAdmin();
  const todayOrEarlier = dailyEntries.length
    ? DateTime.fromJSDate(
        dailyEntries.filter((item) => item.date <= new Date() && item.logged)[0].date
      )
    : DateTime.now();
  const [dateRangePickerRange, setDateRangePickerRange] = useState<DateRange>({
    start: todayOrEarlier.minus({ days: 7 }),
    end: todayOrEarlier
  });

  useEffect(() => {
    setSelectedEntries(getDateRangeEntries(dateRangePickerRange) || []);
  }, [byRange.dailyEntries]);

  /**
   * Gets daily entries within time range
   *
   * @param dateRangePickerRange date range picker range
   * @returns date range entries
   */
  const getDateRangeEntries = (range: DateRange) => {
    if (range.start && range.end) {
      const selectedDays = range.end.diff(range.start, "days").toObject();
      const result = [];

      for (let i = 0; selectedDays.days && i <= selectedDays.days; i++) {
        result.push(
          dailyEntries.filter(
            (item) =>
              item.logged &&
              item.expected &&
              DateTime.fromJSDate(item.date).toISODate() ===
                range.start?.plus({ days: i }).toISODate()
          )[0]
        );
      }
      return result.filter((item) => item);
    }
  };

  /**
   * Handle date range change
   *
   * @param dateRangePickerRange date range picker range
   */
  const handleDateRangeChange = (dateRangePickerRange: DateRange) => {
    setDateRangePickerRange(dateRangePickerRange);
    setSelectedEntries(getDateRangeEntries(dateRangePickerRange) || []);
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
        <TimebankOverviewChart personTotalTime={personTotalTime} />
        <List style={{ width:"12%", minWidth:"110px" }} dense sx={{ marginLeft: "5%" }}>
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
    if (loading){
      return <CircularProgress sx={{ margin: "auto",mt: "5%",mb: "5%" }} />;
    }
    if (byRange.dailyEntries && selectedEntries) {
      return (
        <>
          <TimebankMultiBarChart selectedEntries={selectedEntries} />
          {renderTimeEntryTypesList()}
        </>
      )
    }
    if (personDailyEntry) {
      return (
        <>
          <TimebankPieChart personDailyEntry={personDailyEntry} />
          {renderTimeEntryTypesList()}
        </>
      )
    }
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
          onChange={(value: DateTime | null) => value && handleDailyEntryChange(value)}
          value={personDailyEntry ? DateTime.fromJSDate(personDailyEntry?.date) : todayOrEarlier}
          minDate={DateTime.fromJSDate(dailyEntries[dailyEntries.length - 1].date)}
          maxDate={DateTime.fromJSDate(dailyEntries[0].date)}
        />
      );
    }

    return (
      <DateRangePicker range={dateRangePickerRange} handleDateRangeChange={handleDateRangeChange} />
    );
  };

  /**
   * Time entries list items
   */
  const timeEntriesListItems = [
    {
      color: theme.palette.success.dark,
      propName: "billableProjectTime"
    },
    {
      color: theme.palette.success.light,
      propName: "nonBillableProjectTime"
    },
    {
      color: theme.palette.warning.main,
      propName: "internalTime"
    },
    {
      color: theme.palette.info.main,
      propName: "expected"
    }
  ];

  /**
   * Render time entries list
   *
   * @returns time entries list component
   */
  const renderTimeEntryTypesList = () => (
    <List style={{ width:"12%", minWidth:"110px" }}dense sx={{ marginLeft: "5%" }}>
      {timeEntriesListItems.map((item, index) => (
        <ListItem key={`timeEntriesListItem-${index}`}>
          <ListItemText
            sx={{ color: item.color }}
            primary={strings.timebank[item.propName]}
            secondary={
              byRange.dailyEntries && selectedEntries
                ? getHoursAndMinutes(
                    selectedEntries.reduce((prev, next) => prev + Number(next[item.propName]), 0)
                  )
                : getHoursAndMinutes(Number(personDailyEntry ? personDailyEntry[item.propName] : 0))
            }
          />
        </ListItem>
      ))}
    </List>
  );

  /**
   * Render timespan select component
   *
   * @returns timespan select component
   */
  const renderTimespanSelect = () => (
    <TextField
      select
      label={strings.timebank.selectTimespan}
      sx={{
        width: "100%"
      }}
      value={timespan}
      onChange={(e) => {
        setTimespan(e.target.value as Timespan);
      }}
    >
      {Object.keys(Timespan).map((item, index) => {
        return (
          <MenuItem key={`timespan-select-menuitem-${index}`} value={item}>
            {LocalizationUtils.getLocalizedTimespan(item as Timespan)}
          </MenuItem>
        );
      })}
    </TextField>
  );

  /**
   * Timebank card styled component
   */
  const TimebankCard = styled(Card)({
    border: "2px solid #bdbdbd;"
  });

  /**
   * Timebank card title component
   *
   * @param title title string
   * @returns timebank card title component
   */
  const renderTimebankCardTitle = (title: string) => (
    <Typography
      gutterBottom
      variant="h6"
      sx={{
        color: "white",
        textAlign: "center",
        backgroundColor: "#bdbdbd",
        width: "100%",
        p: 2,
        fontWeight: "bold"
      }}
    >
      {title}
    </Typography>
  );

  /**
   * Timebank card flex box styled component
   */
  const TimebankCardFlexBox = styled(Box)({
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
  });

  return (
    <>
      {isAdmin && (
        <Grow in>
          <Card sx={{ p: "1%", display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <FormControl fullWidth>
              <InputLabel id="employee-select-label">{strings.employeeSelect.employeeSelectlabel}</InputLabel>
              <Select
                labelId="employee-select-label"
                id="employee-select"
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(Number(event.target.value))}
                label={strings.employeeSelect.employeeSelectlabel}
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
        <TimebankCard>
          {renderTimebankCardTitle(strings.timebank.barChartDescription)}
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
                {renderTimespanSelect()}
              </FormControl>
            </Box>
            <TimebankCardFlexBox>{renderOverViewChart()}</TimebankCardFlexBox>
          </Container>
        </TimebankCard>
      </Grow>
      <br />
      <Grow in>
        <TimebankCard>
          {renderTimebankCardTitle(strings.timebank.pieChartDescription)}
          <Container sx={{ p: 3 }}>
            <ListItemText
              sx={{
                textAlign: "center",
                scale: "150%",
                pb: 3,
                pr: 3,
                pl: 3
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
            <TimebankCardFlexBox>
              {renderDatePickers()}
              <FormControlLabel
                style={{ width:"20%" }}
                label={strings.timebank.byrange}
                control={
                  <Checkbox
                    checked={byRange.dailyEntries}
                    onClick={() =>
                      setByRange({
                        ...byRange,
                        dailyEntries: byRange.dailyEntries ? false : true
                      })
                    }
                  />
                }
              />
            </TimebankCardFlexBox>
            <TimebankCardFlexBox>
                {renderDailyEntryOrRangeChart()}
            </TimebankCardFlexBox>
          </Container>
        </TimebankCard>
      </Grow>
      <br />
    </>
  );
};

export default TimebankContent;
