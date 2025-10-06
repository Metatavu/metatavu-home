import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { Container, Typography, Box, Pagination } from "@mui/material";
import UserSearchBar from "./UserSearchBar";
import UserTable from "./UsersTable";
import EditVacationDialog from "./EditVacationDialog";
import { useLambdasApi } from "src/hooks/use-api";
import { useSetAtom, useAtom } from "jotai";
import { usersAtom } from "src/atoms/user";
import { errorAtom } from "src/atoms/error";
import type { User } from "src/generated/homeLambdasClient/models/User";
import type { YearlyVacationDays } from "src/generated/homeLambdasClient/models/YearlyVacationDays";
import {
  parseVacationDays,
  formatVacationDaysPayload,
} from "../../../utils/vacations-utils";
import strings from "src/localization/strings";
import BackButton from "src/components/generics/back-button";

/**
 * Vacation days keyed by year.
 */
type VacationDays = Record<string, YearlyVacationDays>;

/**
 * Admin screen for managing users' vacation days.
 *
 * Provides search, pagination, and edit functionality
 * for updating vacation day allocations.
 *
 * @returns React component for the admin vacation management screen.
 */
const AdminVacationManagementScreen = () => {
  const { usersApi } = useLambdasApi();
  const [users, setUsers] = useAtom(usersAtom);
  const setError = useSetAtom(errorAtom);
  const [searchKeyword, setSearchKeyword] = useState("");

  /**
   * Filters users by search keyword matching their full name or email.
   */
  const filteredUsers = useMemo(() => {
    const keyword = searchKeyword.toLowerCase();
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email?.toLowerCase() ?? "";
      return fullName.includes(keyword) || email.includes(keyword);
    });
  }, [users, searchKeyword]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vacationDays, setVacationDays] = useState<VacationDays>({});
  const [saving, setSaving] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setPage(1);
  }, [searchKeyword, filteredUsers]);

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
  ) => {
    setVacationDays((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [field]: Number(value),
      },
    }));
  };

  /**
   * Validates vacation days whenever they change,
   * updating the validity state.
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
          vacationDays: formattedPayload,
        },
      });

      const updatedUser = await usersApi.findUser({ userId: currentUser.id });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );

      handleCloseDialog();
    } catch (_error) {
      setError("Failed to save vacation days.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handles changing the current page in the pagination control.
   *
   * @param _event The change event (ignored).
   * @param value The new page number selected.
   */
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {strings.adminVacationManagement.heading}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <UserSearchBar value={searchKeyword} onChange={setSearchKeyword} />
      </Box>
      <UserTable
        users={paginatedUsers}
        loading={false}
        onEdit={handleEditUser}
      />
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(filteredUsers.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <BackButton 
        styles={{ mt: 3, marginBottom: 2 }} 
      />
      <EditVacationDialog
        open={editDialogOpen}
        user={currentUser}
        vacationDays={vacationDays}
        loading={saving}
        onClose={handleCloseDialog}
        onChange={handleVacationChange}
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
    if (total === 0 && remaining > 0) return false;
    if (remaining > total) return false;
  }
  return true;
};

export default AdminVacationManagementScreen;
