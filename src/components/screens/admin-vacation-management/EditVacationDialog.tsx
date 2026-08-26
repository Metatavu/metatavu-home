import { Box, Typography } from "@mui/material";
import { useState } from "react";
import AppNumberInput from "src/components/generics/appNumberInput";
import AppOverlay from "src/components/generics/appOverlay";
import AppButton from "src/components/generics/buttons/app-button";
import Dropdown from "src/components/generics/dropdown";
import type { User } from "src/generated/homeLambdasClient/models/User";
import { getFullUserName } from "src/utils/user-name-utils";
import { getVacationYear } from "src/utils/vacations-utils";
import type { YearlyVacationDays } from "../../../generated/homeLambdasClient/models/YearlyVacationDays";
import strings from "../../../localization/strings";

type VacationDaysMap = Record<string, YearlyVacationDays>;
interface EditVacationDialogProps {
  open: boolean;
  user: User | null;
  vacationDays: VacationDaysMap;
  loading: boolean;
  onClose: () => void;
  onVacationDaysChange: (year: string, field: keyof YearlyVacationDays, value: number) => void;
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
const normalizeVacationDays = (input: VacationDaysMap): VacationDaysMap => {
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
 *
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

  if (!user) return null;

  const normalizedVacationDays = normalizeVacationDays(vacationDays);
  const userFullname = getFullUserName(user);
  const title = `${strings.adminVacationManagement.editTitle}: ${userFullname}`;
  const selectedYearData = normalizedVacationDays[selectedYear] || { total: 0, remaining: 0 };
  const years = availableYears.map((year) => ({
    value: String(year),
    label: String(year)
  }));
  /**
   * Updates the selected year in state when the user changes the selection.@param year - The year value selected from the dropdown.
   */
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };

  return (
    <AppOverlay open={open} onClose={onClose} title={title}>
      <Box sx={{ width: 729 }}>
        <Box display="flex" flexDirection="column" sx={{ my: 3 }}>
          <Typography variant="body" fontWeight={500}>
            {strings.adminVacationManagement.selectYear}
          </Typography>
          <Dropdown
            displayOption={selectedYear}
            handleDisplayOptionChange={(e) => handleYearChange(e.target.value)}
            displayOptions={years}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <AppNumberInput
            label={strings.adminVacationManagement.totalDays}
            value={selectedYearData.total}
            onChange={(e) => onVacationDaysChange(selectedYear, "total", e)}
            min={0}
            max={100}
            helperText={strings.adminVacationManagement.totalDescription}
          />
          <AppNumberInput
            label={strings.adminVacationManagement.remainingDays}
            value={selectedYearData.remaining}
            onChange={(e) => onVacationDaysChange(selectedYear, "remaining", e)}
            min={0}
            max={normalizedVacationDays[currentYear]?.total ?? 0}
            helperText={strings.adminVacationManagement.remainingDescription}
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", mt: 5 }}>
        <AppButton
          variant="secondary"
          onClick={onClose}
          text={strings.label.cancel}
          sx={{ height: "min-content" }}
        />
        <AppButton
          variant="primary"
          onClick={onSave}
          disabled={loading || disableSave}
          text={strings.label.save}
          sx={{ height: "min-content" }}
        />
      </Box>
    </AppOverlay>
  );
};

export default EditVacationDialog;
