import { DatePicker } from "@mui/x-date-pickers";
import strings from "../../localization/strings";
import { DateRange } from "../../types";

/**
 * Component properties
 */
interface Props {
  range: DateRange;
  handleDateRangeChange: (range: DateRange) => void;
}

/**
 * Date Range Picker component
 *
 *
 * @param props Component properties
 */
const DateRangePicker = ({ handleDateRangeChange, range }: Props) => {
  return (
    <>
      <DatePicker
        sx={{
          width: "24%",
          mx: "1%"
        }}
        label={strings.timeExpressions.startDate}
        onChange={(dateTime) => dateTime && handleDateRangeChange({ ...range, start: dateTime })}
        value={range.start}
        maxDate={range.end}
      />
      <DatePicker
        sx={{
          width: "24%",
          mx: "1%"
        }}
        label={strings.timeExpressions.endDate}
        onChange={(dateTime) => dateTime && handleDateRangeChange({ ...range, end: dateTime })}
        value={range.end}
        minDate={range.start}
      />
    </>
  );
};

export default DateRangePicker;
