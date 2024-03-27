import { Grow, Container, CircularProgress, List, ListItem, ListItemText, FormControlLabel, Checkbox } from "@mui/material"
import {TimebankCard, TimebankCardFlexBox, renderTimebankCardTitle} from "./common-card-elements"
import strings from "../../localization/strings"
import { getHoursAndMinutes } from "../../utils/time-utils"
import TimebankMultiBarChart from "../charts/timebank-multibar-chart"
import TimebankPieChart from "../charts/timebank-piechart"
import { useEffect, useState } from "react"
import { DateTime } from "luxon"
import { useAtom, useSetAtom } from "jotai"
import { dailyEntriesAtom, personDailyEntryAtom } from "../../atoms/person"
import { DailyEntryWithIndexSignature, DateRange } from "../../types"
import { DatePicker } from "@mui/x-date-pickers"
import DateRangePicker from "./timebank-daterange-picker"
import { useApi } from "../../hooks/use-api"
import { theme } from "../../theme"
import { errorAtom } from "../../atoms/error"

interface Props {
  selectedEmployeeId?: number
}

const SpecificTimeEntriesCard = ({selectedEmployeeId}:Props) => {
  const [loading, setLoading] = useState(false);
  const setError = useSetAtom(errorAtom);
  const [selectedEntries, setSelectedEntries] = useState<DailyEntryWithIndexSignature[]>([]);
  const {dailyEntriesApi} = useApi();
  const [byRange, setByRange] = useState({
    dailyEntries: false
  });
  const [personDailyEntry, setPersonDailyEntry] = useAtom(personDailyEntryAtom);
  const [dailyEntries, setDailyEntries] = useAtom(dailyEntriesAtom);
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
    const fetchData = async () => {
      setLoading(true);
      await getPersonDailyEntries(selectedEmployeeId);
      setSelectedEntries(getDateRangeEntries(dateRangePickerRange) || []);
      setLoading(false);
    }
    fetchData();
    
  }, [selectedEmployeeId,byRange.dailyEntries]);

  /**
   * Gets the logged in person's daily entries.
   */
  const getPersonDailyEntries = async (selectedEmployeeId?: number) => {
    if (selectedEmployeeId) {
      try {
        const fetchedDailyEntries = await dailyEntriesApi.listDailyEntries({
          personId: selectedEmployeeId
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
          <TimebankPieChart personDailyEntry={personDailyEntry } />
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
          minDate={dailyEntries.length ? DateTime.fromJSDate( dailyEntries[dailyEntries.length - 1].date): DateTime.now()}
          maxDate={dailyEntries.length ? DateTime.fromJSDate( dailyEntries[0].date): DateTime.now()}
        />
      );
    }

    return (
      <DateRangePicker range={dateRangePickerRange} handleDateRangeChange={handleDateRangeChange} />
    );
  };

  return (
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
                : getHoursAndMinutes(Number(personDailyEntry?.logged)||0)
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
  )
}

export default SpecificTimeEntriesCard;