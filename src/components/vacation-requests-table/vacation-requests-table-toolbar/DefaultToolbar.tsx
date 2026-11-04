import { Add, FilterList, KeyboardArrowDown } from "@mui/icons-material";
import { Box, Grid, styled, Typography, useTheme } from "@mui/material";
import type { SetStateAction } from "jotai";
import { type Dispatch, useState } from "react";
import AppCheckbox from "src/components/generics/appCheckbox";
import AppOverlay from "src/components/generics/appOverlay";
import AppButton from "src/components/generics/buttons/app-button";
import AppIconButton from "src/components/generics/buttons/app-icon-button";
import SearchBar from "src/components/generics/search-bar";
import TabBar, { type Tab } from "src/components/generics/tabBar";
import { VacationRequestStatuses, VacationType } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { ToolbarFormModes } from "src/types/index";
import LocalizationUtils from "src/utils/localization-utils";
import {
  ALL_STATUSES,
  ALL_TYPES,
  type StatusFilter,
  type TypeFilter,
  type VacationFilters
} from "src/utils/vacation-filter-type";

const ToolbarGridContainer = styled(Grid)({
  alignContent: "space-around",
  alignItems: "center"
});

interface DefaultToolbarProps {
  adminMode: boolean;
  filters: VacationFilters;
  setFilters: React.Dispatch<React.SetStateAction<VacationFilters>>;
  tabs: Tab[];
  currentTab: string;
  setCurrentTab: Dispatch<SetStateAction<string>>;
  formOpen?: boolean;
  toggleIsUpcoming?: () => void;
  setFormOpen?: (open: boolean) => void;
  setToolbarFormMode?: Dispatch<SetStateAction<ToolbarFormModes>>;
}

const vacationFilters = [
  {
    title: "Status",
    category: "status",
    options: [
      { value: ALL_STATUSES, label: strings.tableToolbar.all },
      {
        value: VacationRequestStatuses.PENDING,
        label: strings.vacationRequest.pending
      },
      {
        value: VacationRequestStatuses.APPROVED,
        label: strings.vacationRequest.approved
      },
      {
        value: VacationRequestStatuses.DECLINED,
        label: strings.vacationRequest.declined
      }
    ]
  },
  {
    title: "Vacation type",
    category: "type",
    options: [
      {
        value: ALL_TYPES,
        label: strings.tableToolbar.all
      },
      {
        value: VacationType.VACATION,
        label: LocalizationUtils.getLocalizedVacationRequestType(VacationType.VACATION)
      },
      {
        value: VacationType.PARENTAL_LEAVE,
        label: LocalizationUtils.getLocalizedVacationRequestType(VacationType.PARENTAL_LEAVE)
      },
      {
        value: VacationType.SICKNESS,
        label: LocalizationUtils.getLocalizedVacationRequestType(VacationType.SICKNESS)
      },
      {
        value: VacationType.PERSONAL_DAYS,
        label: LocalizationUtils.getLocalizedVacationRequestType(VacationType.PERSONAL_DAYS)
      },
      {
        value: VacationType.UNPAID_TIME_OFF,
        label: LocalizationUtils.getLocalizedVacationRequestType(VacationType.UNPAID_TIME_OFF)
      },
      {
        value: VacationType.CHILD_SICKNESS,
        label: LocalizationUtils.getLocalizedVacationRequestType(VacationType.CHILD_SICKNESS)
      }
    ]
  }
];

/**
 * Default toolbar for the vacation requests table.
 *
 * Provides filtering, tab navigation, and creation of new vacation requests.
 * Administrators have access to filtering and tab navigation, while
 * non-administrators can also create new vacation requests.
 *
 * The filter overlay allows users to select multiple filters by category,
 * search for filter options, clear the current selection, or apply changes.
 *
 * @param props.adminMode - Determines whether the toolbar is displayed in administrator mode.
 * @param props.filter - Currently selected filters.
 * @param props.setFilters - Updates the selected filters.
 * @param props.tabs - Available navigation tabs.
 * @param props.currentTab - Currently selected tab.
 * @param props.setCurrentTab - Updates the selected tab.
 * @param props.formOpen - Indicates whether the vacation request form is open.
 * @param props.toggleIsUpcoming - Toggles between upcoming and previous requests.
 * @param props.setFormOpen - Controls the visibility of the vacation request form.
 * @param props.setToolbarFormMode - Updates the vacation request form mode.
 *
 * @returns A toolbar containing filters, navigation tabs, and request actions.
 */
const DefaultToolbar = ({
  formOpen,
  adminMode,
  filters,
  setFilters,
  toggleIsUpcoming,
  setFormOpen,
  tabs,
  currentTab,
  setCurrentTab,
  setToolbarFormMode
}: DefaultToolbarProps) => {
  const theme = useTheme();
  const [openFilter, setOpenFilter] = useState(false);
  const [chosenFilters, setChosenFilters] = useState<VacationFilters>({
    status: [...filters.status],
    type: [...filters.type]
  });
  const tags = vacationFilters.flatMap((item) =>
    item.options.map((option) => ({
      label: option.label,
      value: option.value,
      category: item.category
    }))
  );
  const [dropdown, setDropdown] = useState<string[]>(vacationFilters.map((item) => item.title));

  const handleSearchTag = (label: string) => {
    const option = tags.find((option) => option.label === label);

    if (option) {
      handleTag(option.value, option.category);
    }
  };

  /**
   * Toggles a vacation request filter.
   *
   * The `ALL` filter is mutually exclusive with other filters.
   * Selecting `ALL` clears all other filters, while selecting another
   * filter removes the `ALL` selection if it is currently active.
   *
   * @param value - Filter value to toggle.
   */

  const handleTag = <T extends StatusFilter | TypeFilter>(
    value: T,
    category: "status" | "type"
  ) => {
    setChosenFilters((current) => {
      if (category === "status") {
        const selected = current.status;

        if (value === ALL_STATUSES) {
          return {
            ...current,
            status: selected.includes(ALL_STATUSES) ? [] : [ALL_STATUSES]
          };
        }

        return {
          ...current,
          status: selected.includes(ALL_STATUSES)
            ? [value as StatusFilter]
            : selected.includes(value as StatusFilter)
              ? selected.filter((item) => item !== value)
              : [...selected, value as StatusFilter]
        };
      }

      const selected = current.type;

      if (value === ALL_TYPES) {
        return {
          ...current,
          type: selected.includes(ALL_TYPES) ? [] : [ALL_TYPES]
        };
      }

      return {
        ...current,
        type: selected.includes(ALL_TYPES)
          ? [value as TypeFilter]
          : selected.includes(value as TypeFilter)
            ? selected.filter((item) => item !== value)
            : [...selected, value as TypeFilter]
      };
    });
  };

  const handleDropdown = (value: string) => {
    setDropdown((current) => {
      return current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
    });
  };

  const handleApply = () => {
    setFilters({
      status: [...chosenFilters.status],
      type: [...chosenFilters.type]
    });
    setOpenFilter(false);
  };

  const handleCancel = () => {
    setOpenFilter(false);
    setChosenFilters(filters);
  };

  /**
   * Changes the active toolbar tab.
   *
   * For non-administrators, changing tabs also toggles the displayed
   * vacation request period.
   *
   * @param tabId - ID of the tab to activate.
   */
  const handleTab = (tabId: string) => {
    if (!adminMode && currentTab !== tabId) {
      toggleIsUpcoming?.();
    }
    setCurrentTab(tabId);
  };

  return (
    <ToolbarGridContainer container spacing={0}>
      <AppOverlay open={openFilter} onClose={handleCancel} title="Filters">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: 470
          }}
        >
          <SearchBar
            handleSelectedTagChange={handleSearchTag}
            tags={tags.map((tag) => tag.label)}
            selectedTags={tags
              .filter((tag) => chosenFilters[tag.category].includes(tag.value))
              .map((tag) => tag.label)}
          />
          {vacationFilters.map((category) => (
            <Box
              key={category.title}
              sx={{
                display: "flex",
                flexDirection: "column"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row"
                }}
              >
                <KeyboardArrowDown
                  onClick={() => handleDropdown(category.title)}
                  sx={{ rotate: dropdown.includes(category.title) ? "180deg" : "none" }}
                />
                <Typography
                  variant="body"
                  sx={{
                    fontWeight: 500
                  }}
                >
                  {category.title}
                </Typography>
              </Box>
              {dropdown.includes(category.title) &&
                category.options.map((option) => {
                  const isStatus = category.title === "Status";

                  const selectedFilters = isStatus ? chosenFilters.status : chosenFilters.type;

                  const allValue = isStatus ? ALL_STATUSES : ALL_TYPES;
                  const isChecked =
                    selectedFilters.includes(option.value) || selectedFilters.includes(allValue);

                  return (
                    <AppCheckbox
                      key={option.value}
                      checked={isChecked}
                      label={option.label}
                      disabled={false}
                      onChange={() => handleTag(option.value, isStatus ? "status" : "type")}
                      ariaLabel={option.label}
                    />
                  );
                })}
            </Box>
          ))}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2
            }}
          >
            <AppButton
              variant="secondary"
              text="Clear all"
              onClick={() => setChosenFilters({ status: [ALL_STATUSES], type: [ALL_TYPES] })}
              disabled={!chosenFilters}
              sx={{
                px: theme.spaces.m,
                py: theme.spaces.s,
                height: "min-content",
                width: "max-content"
              }}
            />
            <AppButton
              variant="primary"
              text="Apply"
              onClick={handleApply}
              sx={{
                px: theme.spaces.m,
                py: theme.spaces.s,
                height: "min-content",
                width: "max-content"
              }}
            />
          </Box>
        </Box>
      </AppOverlay>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          ml: "auto",
          mb: theme.spaces.m
        }}
      >
        <AppIconButton
          icon={<FilterList />}
          onClick={() => setOpenFilter(!openFilter)}
          variant="default"
          disabled={openFilter || formOpen}
        />
        {!adminMode && (
          <AppButton
            variant="primary"
            onClick={() => {
              setFormOpen?.(!formOpen);
              setToolbarFormMode?.(ToolbarFormModes.CREATE);
            }}
            sx={{
              px: theme.spaces.m,
              py: theme.spaces.s,
              height: 48,
              float: "inline-end"
            }}
            disabled={formOpen}
            text={strings.tableToolbar.create}
            startIcon={<Add />}
          />
        )}
      </Box>
      <Box sx={{ width: "100%" }}>
        <TabBar switchTab={handleTab} chosenTab={currentTab} tabNames={tabs} />
      </Box>
    </ToolbarGridContainer>
  );
};

export default DefaultToolbar;
