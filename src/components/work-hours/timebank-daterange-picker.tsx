import { Box, type SxProps, Typography, useTheme } from "@mui/material";
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
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "49%" }}>
      <Typography variant="body" sx={{ mb: 0.5, fontWeight: 500 }}>
        {label}*
      </Typography>

      <DatePicker
        sx={sx}
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          textField: {
            size: "small",
            onMouseDown: (e) => {
              e.preventDefault();
              setOpen(true);
            },
            sx: {
              "& .MuiPickersOutlinedInput-root": {
                borderRadius: theme.radius.s,

                "& fieldset": {
                  borderWidth: theme.borders.s,
                  borderColor: theme.palette.border.primary
                },

                "&:hover fieldset": {
                  borderColor: theme.palette.border.accent
                }
              }
            }
          },
          openPickerButton: {
            onClick: () => setOpen(true)
          }
        }}
        onChange={(value: DateTime | null) => value && onChange(value)}
        value={value}
        minDate={minDate}
        maxDate={maxDate}
      />
    </Box>
  );
};
