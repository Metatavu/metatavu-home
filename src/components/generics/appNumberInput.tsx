import { Add, Remove } from "@mui/icons-material";
import { Box, TextField, Typography } from "@mui/material";
import AppIconButton from "./buttons/app-icon-button";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  helperText?: string;
}

/**
 * A styled numeric input component that allows users to change
 * the value either by typing a number or by using increment/decrement buttons.
 *
 * The value is constrained between the provided `min` and `max` values.
 *
 * @param props.label - Text displayed next to the input field.
 * @param props.value - Current numeric value.
 * @param props.onChange - Callback invoked when the value changes.
 * @param props.min - Minimum allowed value. Defaults to 0.
 * @param props.max - Maximum allowed value. Defaults to Infinity.
 * @param props.helperText - Optional helper text displayed below the label.
 *
 * @returns A numeric input field with increment and decrement controls.
 */
const AppNumberInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = Infinity,
  helperText
}: NumberInputProps) => {
  const decrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increase = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);

    if (!Number.isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 5 }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="body" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {helperText && <Typography variant="caption">{helperText}</Typography>}
      </Box>
      <TextField
        value={value}
        onChange={handleInputChange}
        size="small"
        sx={{
          width: 200,
          "& input": {
            textAlign: "center"
          }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <AppIconButton
                variant="small"
                onClick={decrease}
                disabled={value <= min}
                icon={<Remove />}
              />
            ),
            endAdornment: (
              <AppIconButton
                variant="small"
                onClick={increase}
                disabled={value >= max}
                icon={<Add />}
              />
            )
          }
        }}
      />
    </Box>
  );
};

export default AppNumberInput;
