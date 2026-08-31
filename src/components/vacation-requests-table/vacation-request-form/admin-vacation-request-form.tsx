import { KeyboardArrowDown, ReplayOutlined } from "@mui/icons-material";
import { Box, Typography, useTheme } from "@mui/material";
import { type Dispatch, type SetStateAction, useState } from "react";
import AppNumberInput from "src/components/generics/appNumberInput";
import AppButton from "src/components/generics/buttons/app-button";
import { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { ToolbarFormModes } from "src/types/index";

interface FormFieldProps {
  handleUpdateVacationRequestStatus: (status: VacationRequestStatuses) => void;
  toolbarFormMode: ToolbarFormModes;
  setToolbarFormMode: Dispatch<SetStateAction<ToolbarFormModes>>;
  defaultDays: number;
  handleDaysChange: (value: number) => void;
  handleRestoreDefaultDays: () => void;
  handleEdit: () => void;
}

/**
 * Admin-specific fields and actions for a vacation request.
 *
 * Provides controls for adjusting the number of consumed vacation days
 * and restoring the default value. Administrators can also approve or
 * decline the vacation request.
 *
 * Advanced options are available when the form is in edit mode.
 *
 * @param props.handleUpdateVacationRequestStatus - Updates the request status.
 * @param props.toolbarFormMode - Current mode of the vacation request form.
 * @param props.setToolbarFormMode - Updates the current form mode.
 * @param props.defaultDays - Current number of vacation days.
 * @param props.handleDaysChange - Updates the number of vacation days.
 * @param props.handleRestoreDefaultDays - Restores the default number of vacation days.
 *
 * @returns Administrator controls for editing and updating a vacation request.
 */
const AdminVacationFormFields = ({
  handleUpdateVacationRequestStatus,
  toolbarFormMode,
  setToolbarFormMode,
  defaultDays,
  handleDaysChange,
  handleRestoreDefaultDays,
  handleEdit
}: FormFieldProps) => {
  const [options, setOptions] = useState(false);
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%" }}>
      {toolbarFormMode === ToolbarFormModes.EDIT && (
        <>
          <Box sx={{ display: "flex", flexDirection: "row", mb: theme.spaces.m }}>
            <KeyboardArrowDown
              onClick={() => setOptions(!options)}
              sx={{ rotate: options ? "180deg" : "none" }}
            />
            <Typography variant="body" sx={{ fontWeight: 500 }}>
              {strings.form.advancedOptions}
            </Typography>
          </Box>
          {options && (
            <>
              <AppNumberInput
                label={strings.form.daysConsumed}
                value={defaultDays}
                min={0}
                max={30}
                onChange={(e) => handleDaysChange(e)}
                helperText={strings.form.daysConsumedDescription}
              />
              <AppButton
                variant="borderless"
                startIcon={<ReplayOutlined />}
                text={strings.form.restoreDefault}
                onClick={handleRestoreDefaultDays}
                sx={{ pl: 0, fontWeight: 400 }}
              />
            </>
          )}
        </>
      )}

      <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
        {toolbarFormMode === ToolbarFormModes.EDIT && (
          <AppButton
            variant="tertiary"
            onClick={() => setToolbarFormMode(ToolbarFormModes.APPROVE)}
            text={strings.tableToolbar.cancel}
            sx={{
              mt: theme.spaces.xxl,
              height: "min-content"
            }}
          />
        )}

        <Box sx={{ display: "flex", ml: "auto", gap: 2 }}>
          <AppButton
            variant="secondary"
            text={strings.toolbarUpdateStatusButton.decline}
            onClick={() => {
              handleUpdateVacationRequestStatus(VacationRequestStatuses.DECLINED);
            }}
            sx={{
              height: "min-content",
              mt: theme.spaces.xxl
            }}
          />

          <AppButton
            variant="primary"
            text={strings.toolbarUpdateStatusButton.approve}
            onClick={() => {
              handleEdit();
              handleUpdateVacationRequestStatus(VacationRequestStatuses.APPROVED);
            }}
            sx={{
              height: "min-content",
              mt: theme.spaces.xxl
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminVacationFormFields;
