import { Box, Container, TablePagination, Typography } from "@mui/material";
import { useAtom, useSetAtom } from "jotai";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { errorAtom } from "src/atoms/error";
import { usersAtom } from "src/atoms/user";
import BackButton from "src/components/generics/back-button";
import type { User } from "src/generated/homeLambdasClient/models/User";
import type { YearlyVacationDays } from "src/generated/homeLambdasClient/models/YearlyVacationDays";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { formatVacationDaysPayload, parseVacationDays } from "../../../utils/vacations-utils";
import EditVacationDialog from "./EditVacationDialog";
import UserSearchBar from "./UserSearchBar";
import UserTable from "./UsersTable";

/**
 * Vacation days allocation for each year.
 *
 * Represents a record mapping year strings to their total
 * and remaining vacation days.
 */
type VacationDays = Record<string, YearlyVacationDays>;

const PAGINATION_THRESHOLD = 20;
const DEFAULT_ROWS_PER_PAGE = 20;

/**
 * AdminVacationManagementScreen Component
 *
 * Administrative UI for managing employee vacation day allocations.
 *
 * Features:
 * - Search users by name or email
 * - Paginated user table with dynamic threshold
 * - Edit vacation days (total and remaining)
 * - Conditional pagination visibility
 *
 * @returns React component for admin vacation management
 */
const AdminVacationManagementScreen = () => {
  const { usersApi } = useLambdasApi();
  const [users, setUsers] = useAtom(usersAtom);
  const setError = useSetAtom(errorAtom);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vacationDays, setVacationDays] = useState<VacationDays>({});
  const [saving, setSaving] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [loadingUsers, setLoadingUsers] = useState(false);

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
      } catch (error:any) {
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

  const shouldPaginate = filteredUsers.length > PAGINATION_THRESHOLD;

  /**
   * Computes the subset of users to display on the current page.
   * @returns Array of users for the current page view
   */
  const paginatedUsers = useMemo(() => {
    if (!shouldPaginate) return filteredUsers;
    if (rowsPerPage === -1) return filteredUsers;

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, page, rowsPerPage, shouldPaginate]);

  /**
   * Resets pagination to first page when search results change.
   * Prevents displaying an empty page when search results decrease.
   */
  useEffect(() => {
    setPage(0);
  }, [searchKeyword]);

  /**
   * Opens the edit vacation dialog for a specific user,
   * parsing their vacation days into local state.
   *
   * @param user The user whose vacation days will be edited.
   */
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setVacationDays(parseVacationDays(user));
    setEditDialogOpen(true);
  };

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
    value: string
  ): void => {
    setVacationDays((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [field]: Number(value)
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
    } catch (error:any) {
      const errorMessage = await error?.response?.json();
      setError(`${strings.vacationRequestError.failedToLoad}: ${errorMessage?.message || error}`);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handles pagination page change.
   *
   * @param _event - Mouse event from pagination button
   * @param newPage - The new page index
   */
  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ): void => {
    setPage(newPage);
  };

  /**
   * Handles change in rows per page selection.
   * Resets to first page when rows per page changes.
   *
   * @param event - Change event from the select dropdown
   */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {strings.adminVacationManagement.heading}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <UserSearchBar value={searchKeyword} onChange={setSearchKeyword} />
      </Box>
      <UserTable users={paginatedUsers} loading={loadingUsers} onEdit={handleEditUser} />
      {/* Only shows pagination after loading of users */}
      {shouldPaginate && !loadingUsers && (
        <Box display="flex" justifyContent="center" mt={2}>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[20, 50, { label: "All", value: -1 }]}
            labelRowsPerPage="Rows per page:"
          />
        </Box>
      )}
      <BackButton styles={{ mt: 3, marginBottom: 2 }} />
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
    </Container>
  );
};

/**
 * Validates the vacation days ensuring:
 * - Total is not zero when remaining is positive.
 * - Remaining does not exceed total.
 *
 * @param vacDays Vacation days keyed by year.
 * @returns True if valid; false otherwise.
 */
const isVacationDaysValid = (vacDays: VacationDays): boolean => {
  for (const year in vacDays) {
    const total = Number(vacDays[year].total);
    const remaining = Number(vacDays[year].remaining);
    if (total === 0 && remaining > 0) {
      return false;
    }
    if (remaining > total) {
      return false;
    }
  }
  return true;
};

export default AdminVacationManagementScreen;
