import type React from 'react';
import { useState, useEffect } from 'react';

import { Container, Typography, Box, Pagination } from '@mui/material';

import UserSearchBar from './UserSearchBar';
import UserTable from './UsersTable';
import EditVacationDialog from './EditVacationDialog';
import NotificationSnackbar from './NotificationSnackbar';

import type { User, VacationDays, NotificationState } from '../../../types/index';
import { parseVacationDays, formatVacationDaysPayload } from '../../../utils/vacations-utils';

import { useUsers } from '../../../hooks/useUser'; // Import your custom hook

const AdminVacationManagementScreen: React.FC = () => {
  // Use custom hook for users data & filtering
  const { filteredUsers, searchKeyword, setSearchKeyword, loading, fetchUsers } = useUsers();

  // Local states
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vacationDays, setVacationDays] = useState<VacationDays>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Validation state for enabling/disabling Save button
  const [isValid, setIsValid] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Reset page when searchKeyword or filteredUsers change
  useEffect(() => {
    setPage(1);
  }, [searchKeyword, filteredUsers]);

  // Open edit dialog and load vacation days for selected user
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setVacationDays(parseVacationDays(user));
    setEditDialogOpen(true);
  };

  // Close dialog and reset state
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setCurrentUser(null);
    setVacationDays({});
  };

  // Handle changes in vacation days input fields
  const handleVacationChange = (year: string, field: 'total' | 'remaining', value: string) => {
    setVacationDays(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [field]: value,
      },
    }));
  };

  // Validate vacation days anytime vacationDays changes
  useEffect(() => {
    setIsValid(isVacationDaysValid(vacationDays));
  }, [vacationDays]);

  // Save updated vacation days to backend
  const handleSaveVacationDays = async () => {
    if (!currentUser) return;

    setSaving(true);

    try {
      const formattedPayload = formatVacationDaysPayload(vacationDays);

      // Wrap payload inside { vacationDays: ... } as backend expects
      const bodyPayload = {
        vacationDays: formattedPayload,
      };

      await fetch(`http://localhost:3000/users/${currentUser.id}/vacationDays`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      // Refresh users from backend to keep data fresh
      fetchUsers();

      setNotification({
        open: true,
        message: 'Vacation days updated successfully!',
        severity: 'success',
      });

      handleCloseDialog();
    } catch (_error) {
      setNotification({
        open: true,
        message: 'Failed to save vacation days.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Close notification snackbar
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Pagination change handler
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Calculate paginated users to show on current page
  const paginatedUsers = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Vacation Management
      </Typography>

      <Box sx={{ mb: 3 }}>
        <UserSearchBar value={searchKeyword} onChange={setSearchKeyword} />
      </Box>

      <UserTable users={paginatedUsers} loading={loading} onEdit={handleEditUser} />

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(filteredUsers.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

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

      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Container>
  );
};

// Validation function to ensure remaining <= total and no remaining > 0 when total == 0
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
