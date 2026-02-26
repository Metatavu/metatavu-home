import { Add, Cancel, FilterAlt } from "@mui/icons-material";
import { Button, Grid, MenuItem, Select, styled, Typography, useTheme } from "@mui/material";
import { VacationRequestStatuses } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import type { FilterType } from "src/utils/vacation-filter-type";
import FormToggleButton from "./toolbar-form-toggle-button";

const ToolbarGridItem = styled(Grid)({
  padding: "10px"
});

const ToolbarGridContainer = styled(Grid)({
  alignContent: "space-around",
  alignItems: "center"
});

interface DefaultToolbarProps {
  title: string;
  isUpcoming: boolean;
  formOpen: boolean;
  adminMode: boolean;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  toggleIsUpcoming: () => void;
  setFormOpen: (open: boolean) => void;
}

/**
 * Toolbar shown when no rows are selected
 *
 * @param props component properties
 */
const DefaultToolbar = ({
  title,
  isUpcoming,
  formOpen,
  adminMode,
  filter,
  setFilter,
  toggleIsUpcoming,
  setFormOpen
}: DefaultToolbarProps) => {
  const theme = useTheme();
  const buttonLabel = isUpcoming ? strings.tableToolbar.future : strings.tableToolbar.past;

  return (
    <ToolbarGridContainer container spacing={0}>
      <ToolbarGridItem size={{ xs: 3 }}>
        <Typography variant="h6">{title}</Typography>
      </ToolbarGridItem>
      <ToolbarGridItem size={{ xs: 3 }}>
        <Button
          sx={{
            backgroundColor: theme.palette.background.paper,
            p: 1,
            "&:hover": { backgroundColor: theme.palette.action.hover },
            color: theme.palette.text.primary
          }}
          onClick={toggleIsUpcoming}
        >
          <FilterAlt />
          {buttonLabel}
        </Button>
      </ToolbarGridItem>
      <ToolbarGridItem size={{ xs: 3 }}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          sx={{
            maxWidth: 120,
            backgroundColor: theme.palette.background.paper,
            height: 42,
            color: theme.palette.text.primary,
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            "&:hover": { backgroundColor: theme.palette.action.hover },
            fontWeight: 700,
            display: "flex"
          }}
        >
          <MenuItem value="ALL">{strings.tableToolbar.all}</MenuItem>
          {!adminMode && <MenuItem value="DRAFT">{strings.tableToolbar.draft}</MenuItem>}
          <MenuItem value={VacationRequestStatuses.PENDING}>
            {strings.vacationRequest.pending}
          </MenuItem>
          <MenuItem value={VacationRequestStatuses.APPROVED}>
            {strings.vacationRequest.approved}
          </MenuItem>
          <MenuItem value={VacationRequestStatuses.DECLINED}>
            {strings.vacationRequest.declined}
          </MenuItem>
        </Select>
      </ToolbarGridItem>
      <ToolbarGridItem size={{ xs: 3 }}>
        {formOpen ? (
          <FormToggleButton
            title={strings.tableToolbar.cancel}
            ButtonIcon={Cancel}
            value={formOpen}
            setValue={setFormOpen}
            buttonVariant="outlined"
          />
        ) : (
          !adminMode && (
            <FormToggleButton
              value={formOpen}
              setValue={setFormOpen}
              title={strings.tableToolbar.create}
              ButtonIcon={Add}
            />
          )
        )}
      </ToolbarGridItem>
    </ToolbarGridContainer>
  );
};

export default DefaultToolbar;
