import type { SxProps } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import type { DateTime } from "luxon";
import { useState } from "react";
import strings from "src/localization/strings";
import type { DateRange } from "src/types";

/**
 * Date range picker component properties
 */
interface DateRangeProps {
  range: DateRange;
  handleDateRangeChange: (range: DateRange) => void;
}

/**
 * Date Range Picker component
 *
 * @param props Component properties
 */
export const DateRangePicker = ({ handleDateRangeChange, range }: DateRangeProps) => {
  const DatePickerStyle: SxProps = {
    width: "24%",
    mx: "1%"
  };
  return (
    <>
      <CustomDatePicker
        sx={DatePickerStyle}
        label={strings.timeExpressions.startDate}
        onChange={(dateTime) => dateTime && handleDateRangeChange({ ...range, start: dateTime })}
        value={range.start}
        maxDate={range.end}
      />
      <CustomDatePicker
        sx={DatePickerStyle}
        label={strings.timeExpressions.endDate}
        onChange={(dateTime) => dateTime && handleDateRangeChange({ ...range, end: dateTime })}
        value={range.end}
        minDate={range.start}
      />
    </>
  );
};

/**
 * Date Picker component properties
 */
interface DatePickerProps {
  label: string;
  maxDate?: DateTime;
  minDate?: DateTime;
  value: DateTime;
  onChange: (params: any) => void;
  sx?: SxProps;
}

/**
 * Date Picker component
 *
 * @param props Component properties
 */
export const CustomDatePicker = ({
  label,
  maxDate,
  minDate,
  value,
  onChange,
  sx
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DatePicker
      sx={sx}
      open={open}
      onClose={() => setOpen(false)}
      slotProps={{
        textField: {
          onClick: () => setOpen(true)
        }
      }}
      label={label}
      onChange={(value: DateTime | null) => value && onChange(value)}
      value={value}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
};
