import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from "@mui/material";
import type { User } from "src/generated/homeLambdasClient/models/User";
import type { YearlyVacationDays } from "../../../generated/homeLambdasClient/models/YearlyVacationDays";
import strings from "../../../localization/strings";

type VacationDaysMap = Record<string, YearlyVacationDays>;
interface EditVacationDialogProps {
  open: boolean;
  user: User | null;
  vacationDays: Record<string, any>;
  loading: boolean;
  onClose: () => void;
  onChange: (year: string, field: keyof YearlyVacationDays, value: string) => void;
  onSave: () => void;
  disableSave: boolean;
}

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
  onChange,
  onSave,
  disableSave
}: EditVacationDialogProps) => {
  if (!user) return null;

  const normalizedVacationDays = normalizeVacationDays(vacationDays);
  const years = Object.keys(normalizedVacationDays).filter(
    (year) => Number.parseInt(year) <= new Date().getFullYear()
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {strings.adminVacationManagement.editTitle}: {user.firstName} {user.lastName}
      </DialogTitle>
      <DialogContent dividers>
        {years.map((year) => (
          <Box key={year} sx={{ mb: 3 }}>
            <Typography variant="h6">{year}</Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <TextField
                label={strings.adminVacationManagement.totalDays}
                type="number"
                value={normalizedVacationDays[year]?.total ?? 0}
                onChange={(e) => onChange(year, "total", e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
              />
              <TextField
                label={strings.adminVacationManagement.remainingDays}
                type="number"
                value={normalizedVacationDays[year]?.remaining ?? 0}
                onChange={(e) => onChange(year, "remaining", e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
                fullWidth
              />
            </Box>
          </Box>
        ))}
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
