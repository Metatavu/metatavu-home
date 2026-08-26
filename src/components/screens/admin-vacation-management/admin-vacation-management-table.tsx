import { Box } from "@mui/material";
import type { GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import { useAtom, useSetAtom } from "jotai";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import type { Tab } from "src/components/generics/tabBar";
import AppTable from "src/components/generics/table/appTable";
import DefaultToolbar from "src/components/vacation-requests-table/vacation-requests-table-toolbar/DefaultToolbar";
import type { User } from "src/generated/homeLambdasClient/models/User";
import type { YearlyVacationDays } from "src/generated/homeLambdasClient/models/YearlyVacationDays";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import type { UserDataGridRow } from "src/types/index";
import { getFullUserName } from "src/utils/user-name-utils";
import type { FilterType } from "src/utils/vacation-filter-type";
import {
  formatVacationDaysPayload,
  getDays,
  getVacationYear,
  isVacationDaysValid,
  parseVacationDays
} from "../../../utils/vacations-utils";
import EditVacationDialog from "./EditVacationDialog";
import UserSearchBar from "./UserSearchBar";
import getUserTableColumns from "./userColumns";

/**
 * Vacation days allocation for each year.
 *
 * Represents a record mapping year strings to their total
 * and remaining vacation days.
 */
type VacationDays = Record<string, YearlyVacationDays>;

interface ManagementProps {
  adminMode: boolean;
  filter: FilterType[];
  setFilter: Dispatch<SetStateAction<FilterType[]>>;
  tabs: Tab[];
  currentTab: string;
  setCurrentTab: Dispatch<SetStateAction<string>>;
}

/**
 * Management table for viewing and editing users' vacation days for each year.
 *
 * Fetches users from the API when they are not already available in the
 * global users atom. Users can be searched by name or email address,
 * selected from the table, and their vacation day allocations can be
 * edited and saved through the vacation edit dialog.
 *
 * @param props.adminMode - Determines whether the table is displayed in administrator mode.
 * @param props.filter - Currently selected vacation request filters.
 * @param props.setFilter - Updates the selected vacation request filters.
 * @param props.tabs - Available tabs displayed in the toolbar.
 * @param props.currentTab - Identifier of the currently selected tab.
 * @param props.setCurrentTab - Updates the currently selected tab.
 *
 * @returns A vacation management table with search, filtering, selection,
 * and vacation day editing functionality.
 */
const AdminVacationManagementTable = ({
  adminMode,
  filter,
  setFilter,
  tabs,
  currentTab,
  setCurrentTab
}: ManagementProps) => {
  const { usersApi } = useLambdasApi();
  const [users, setUsers] = useAtom(usersAtom);
  const setError = useSetAtom(errorAtom);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set<GridRowId>([])
  });
  const [vacationDays, setVacationDays] = useState<VacationDays>({});
  const [saving, setSaving] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Pagination state
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [rows, setRows] = useState<UserDataGridRow[]>([]);
  const currentYear = getVacationYear().toString();

  /**
   * Fetches users on component mount if not already available in the atom.
   */
  useEffect(() => {
    const fetchUsers = async () => {
      if (users.length > 0) {
        return;
      }

      try {
        setLoadingUsers(true);
        const fetchedUsers = await usersApi.listUsers();
        setUsers(fetchedUsers);
      } catch (error: any) {
        const errorMessage = await error?.response?.json();
        setError(`${strings.vacationRequestError.failedToLoad}: ${errorMessage?.message || error}`);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * Filters users based on search keyword.
   * Matches against user's full name (first + last) or email address.
   * Case-insensitive search and trims unnecessary whitespace.
   *
   * @returns Array of users matching the search criteria
   */
  const filteredUsers = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    if (!keyword) return users;

    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email?.toLowerCase() ?? "";
      return fullName.includes(keyword) || email.includes(keyword);
    });
  }, [users, searchKeyword]);

  useMemo(() => {
    const newRows: UserDataGridRow[] = filteredUsers.map((user) => ({
      id: user.id,
      name: getFullUserName(user),
      email: user.email,
      total: Number.parseInt(getDays(user.attributes?.vacationDaysByYear, currentYear), 10),
      remaining: Number.parseInt(
        getDays(user.attributes?.unspentVacationDaysByYear, currentYear),
        10
      )
    }));

    setRows(newRows);
  }, [filteredUsers, currentYear]);

  /**
   * Opens the edit vacation dialog for a specific user,
   * parsing their vacation days into local state.
   *
   * @param user The user whose vacation days will be edited.
   */
  const handleEditUser = () => {
    const user = getVacationsDataFromRow();
    if (user) {
      setCurrentUser(user);
      setVacationDays(parseVacationDays(user));
      setEditDialogOpen(true);
    }
  };

  const columns = getUserTableColumns(handleEditUser);
  /**
   * Closes the edit vacation dialog and resets local state.
   */
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setCurrentUser(null);
    setVacationDays({});
    setSaving(false);
    setIsValid(true);
  };

  /**
   * Updates the vacation days state when user edits input fields.
   *
   * @param year The year of the vacation days being edited.
   * @param field Either "total" or "remaining" vacation days.
   * @param value The new value as string input, converted to number.
   */
  const handleVacationChange = (
    year: string,
    field: "total" | "remaining",
    value: number
  ): void => {
    setVacationDays((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [field]: value
      }
    }));
  };

  /**
   * Validates vacation days whenever they change
   */
  useEffect(() => {
    setIsValid(isVacationDaysValid(vacationDays));
  }, [vacationDays]);

  /**
   * Saves the edited vacation days for the current user
   * via the users API and updates the global users list.
   */
  const handleSaveVacationDays = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const formattedPayload = formatVacationDaysPayload(vacationDays);
      await usersApi.updateUserVacation({
        userId: currentUser.id,
        updateUserVacationRequest: {
          vacationDays: formattedPayload
        }
      });

      const updatedUser = await usersApi.findUser({ userId: currentUser.id });
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );

      handleCloseDialog();
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(`${strings.vacationRequestError.failedToLoad}: ${errorMessage?.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  const onRowClick = (rowId: string) => {
    setSelectedRowIds({ type: "include", ids: new Set([rowId]) });
  };

  const getVacationsDataFromRow = () => {
    const [selectedId] = selectedRowIds.ids;
    const selectedRow = rows.find((row) => row.id === selectedId);
    if (selectedRow) {
      const selectedUser = users.find((user) => user.id === selectedRow.id);
      return selectedUser;
    }
  };

  return (
    <Box>
      <DefaultToolbar
        adminMode={adminMode}
        filter={filter}
        setFilter={setFilter}
        tabs={tabs}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />
      <UserSearchBar value={searchKeyword} onChange={setSearchKeyword} />
      <AppTable
        columns={columns}
        rows={rows}
        loading={loadingUsers}
        selectedRowIds={selectedRowIds}
        setSelectedRowIds={setSelectedRowIds}
        onRowClick={onRowClick}
      />
      <EditVacationDialog
        open={editDialogOpen}
        user={currentUser}
        vacationDays={vacationDays}
        loading={saving}
        onClose={handleCloseDialog}
        onVacationDaysChange={handleVacationChange}
        onSave={handleSaveVacationDays}
        disableSave={!isValid || saving}
      />
    </Box>
  );
};

export default AdminVacationManagementTable;
