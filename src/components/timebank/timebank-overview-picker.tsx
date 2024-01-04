import { DatePicker, DateView } from "@mui/x-date-pickers";
import { DateTime } from "luxon";
import { DailyEntry, PersonTotalTime, Timespan } from "../../generated/client";
import strings from "../../localization/strings";
import { Box, MenuItem, Select } from "@mui/material";
import { useAtomValue } from "jotai";
import { timespanAtom } from "../../atoms/person";
import { DateRangeWithTimePeriod } from "../../types";
import { getEndRangeTimeEntries, getStartRangeTimeEntries } from "../../utils/timebank-utils";

/**
 * Component properties
 */
interface Props {
  totalTime: PersonTotalTime[];
  today: DateTime;
  loading: boolean;
  dailyEntries: DailyEntry[];
  dateRange: DateRangeWithTimePeriod;
  weekRange?: { start: string; end: string };
  handleDateRangeChange: (dateRange: DateRangeWithTimePeriod) => void;
  startWeek: DateTime;
  endWeek: DateTime;
}

/**
 * Overview Range Picker component
 */
const OverviewRangePicker = ({
  dailyEntries,
  totalTime,
  today,
  loading,
  startWeek,
  endWeek,
  dateRange,
  handleDateRangeChange
}: Props) => {
  const earliestEntry = DateTime.fromJSDate(dailyEntries[dailyEntries.length - 1].date);
  const timespan = useAtomValue(timespanAtom);

  /**
   * Render start week Select dropdown when week dateRange is active
   */
  const renderStartWeekSelect = () => {
    if (timespan !== Timespan.WEEK) return;

    const startRangeTimeEntries = getStartRangeTimeEntries(totalTime, endWeek, dateRange);

    return (
      <Select
        label="Start week"
        sx={{ width: "8%", ml: "5px" }}
        value={
          dateRange.timePeriod.start.split(",").length !== 3 || !startRangeTimeEntries.length
            ? ""
            : dateRange.timePeriod.start
        }
        onChange={(e) => {
          const weekStart = String(e.target.value);
          handleDateRangeChange({
            ...dateRange,
            timePeriod: { ...dateRange.timePeriod, start: weekStart }
          });
        }}
      >
        {startRangeTimeEntries.map((entry) => (
          <MenuItem key={entry.timePeriod} value={entry.timePeriod}>
            {`${entry.timePeriod?.split(",")[2]}`}
          </MenuItem>
        ))}
      </Select>
    );
  };

  /**
   * Render end week Select dropdown when week dateRange is active
   */
  const renderEndWeekSelect = () => {
    if (timespan !== Timespan.WEEK) return;

    const endRangeTimeEntries = getEndRangeTimeEntries(totalTime, startWeek, dateRange);

    return (
      <Select
        label="End week"
        sx={{ width: "8%", ml: "5px" }}
        value={
          dateRange.timePeriod.end.split(",").length !== 3 || !endRangeTimeEntries.length
            ? ""
            : dateRange.timePeriod.end
        }
        onChange={(e) => {
          handleDateRangeChange({
            ...dateRange,
            timePeriod: { ...dateRange.timePeriod, end: String(e.target.value) }
          });
        }}
      >
        {endRangeTimeEntries.map((entry) => (
          <MenuItem key={entry.timePeriod} value={entry.timePeriod}>
            {`${entry.timePeriod?.split(",")[2]}`}
          </MenuItem>
        ))}
      </Select>
    );
  };

  /**
   * Changes date picker views based on selected time span
   */
  const viewRenderer = (): DateView[] => {
    switch (timespan) {
      case Timespan.WEEK:
        return ["year"];
      case Timespan.MONTH:
        return ["year", "month"];
      case Timespan.YEAR:
        return ["year"];
      default:
        return ["year", "month"];
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", mt: "1%" }}>
      <DatePicker
        disabled={loading}
        label={strings.timeExpressions.startDate}
        views={viewRenderer()}
        onChange={(startDate: DateTime | null) => {
          startDate &&
            handleDateRangeChange({ ...dateRange, date: { ...dateRange.date, start: startDate } });
        }}
        value={dateRange.date.start}
        minDate={earliestEntry}
        maxDate={dateRange.date.end}
      />
      {renderStartWeekSelect()}
      <DatePicker
        disabled={loading}
        sx={{ ml: "2%" }}
        label={strings.timeExpressions.endDate}
        views={viewRenderer()}
        onChange={(endDate: DateTime | null) => {
          endDate &&
            handleDateRangeChange({ ...dateRange, date: { ...dateRange.date, end: endDate } });
        }}
        value={
          dateRange.date.start > dateRange.date.end ? dateRange.date.start : dateRange.date.end
        }
        minDate={dateRange.date.start}
        maxDate={today}
      />
      {renderEndWeekSelect()}
    </Box>
  );
};

export default OverviewRangePicker;
