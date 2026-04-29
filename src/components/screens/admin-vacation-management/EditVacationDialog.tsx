import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from "@mui/material";
import { useId, useState } from "react";
import type { User } from "src/generated/homeLambdasClient/models/User";
import { getVacationYear } from "src/utils/vacations-utils";
import type { YearlyVacationDays } from "../../../generated/homeLambdasClient/models/YearlyVacationDays";
import strings from "../../../localization/strings";

type VacationDaysMap = Record<string, YearlyVacationDays>;
interface EditVacationDialogProps {
  open: boolean;
  user: User | null;
  vacationDays: Record<string, any>;
  loading: boolean;
  onClose: () => void;
  onVacationDaysChange: (year: string, field: keyof YearlyVacationDays, value: string) => void;
  onSave: () => void;
  disableSave: boolean;
}

/**
 * Generates a list of years: last year, current year and next year.
 */
const generateYearOptions = (): string[] => {
  const currentYear = getVacationYear();
  return [(currentYear - 1).toString(), currentYear.toString(), (currentYear + 1).toString()];
};

/**
 * Normalizes the input vacation days object by converting values to numbers.
 *
 * @param input - Vacation days input object with year keys.
 * @returns A normalized VacationDaysMap with numbers for total and remaining days.
 */
const normalizeVacationDays = (input: Record<string, any>): VacationDaysMap => {
  const result: VacationDaysMap = {};
  for (const [year, data] of Object.entries(input)) {
    result[year] = {
      total: Number(data.total) || 0,
      remaining: Number(data.remaining) || 0
    };
  }
  return result;
};

/**
 * Dialog component for editing vacation days for a user.
 *
 * Displays inputs for total and remaining vacation days per year.
 *
 * @param open - Controls whether the dialog is open.
 * @param user - The user whose vacation days are being edited.
 * @param vacationDays - The current vacation days data.
 * @param loading - Loading state while saving.
 * @param onClose - Callback to close the dialog.
 * @param onChange - Callback when vacation days change.
 * @param onSave - Callback to save vacation days.
 * @param disableSave - Whether the save button should be disabled.
 * @returns A MUI Dialog element or null if no user is provided.
 */
const EditVacationDialog = ({
  open,
  user,
  vacationDays,
  loading,
  onClose,
  onVacationDaysChange,
  onSave,
  disableSave
}: EditVacationDialogProps) => {
  const currentYear = getVacationYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const availableYears = generateYearOptions();
  const yearSelectedYear = useId();
  const yearSelectedLabel = useId();

  if (!user) return null;

  const normalizedVacationDays = normalizeVacationDays(vacationDays);

  const selectedYearData = normalizedVacationDays[selectedYear] || { total: 0, remaining: 0 };

  /**
   * Updates the selected year in state when the user changes the selection.@param year - The year value selected from the dropdown.
   */

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {strings.adminVacationManagement.editTitle}: {user.firstName} {user.lastName}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id={yearSelectedLabel}>
              {strings.adminVacationManagement.selectYear}
            </InputLabel>
            <Select
              labelId="year-select-label"
              id={yearSelectedYear}
              value={selectedYear}
              label={strings.adminVacationManagement.selectYear}
              onChange={(e) => handleYearChange(e.target.value)}
            >
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                  {year === currentYear && ` (${strings.adminVacationManagement.currentYear})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6" sx={{ mb: 2 }}>
            {strings.adminVacationManagement.vacationFor} {selectedYear}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label={strings.adminVacationManagement.totalDays}
              type="number"
              value={selectedYearData.total === 0 ? "" : selectedYearData.total}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || Number(value) >= 0) {
                  onVacationDaysChange(selectedYear, "total", value);
                }
              }}
            />
            <TextField
              label={strings.adminVacationManagement.remainingDays}
              type="number"
              value={selectedYearData.remaining === 0 ? "" : selectedYearData.remaining}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || Number(value) >= 0) {
                  onVacationDaysChange(selectedYear, "remaining", value);
                }
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {strings.label.cancel}
        </Button>
        <Button variant="contained" onClick={onSave} disabled={loading || disableSave}>
          {loading ? <CircularProgress size={24} /> : strings.label.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditVacationDialog;
