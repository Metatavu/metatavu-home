import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import { Edit as EditIcon, Search as SearchIcon, KeyboardReturn } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserRoleUtils from "src/utils/user-role-utils";
import { useSetAtom } from 'jotai';
import { errorAtom } from 'src/atoms/error';

/**
 * Interface representing a user from the Keycloak API
 */
interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  attributes?: {
    [key: string]: string[];
  };
}
/**
 * Interface for vacation days in a specific year
 */
interface VacationYear {
  total: string;
  remaining: string;
  hasError?: boolean;
}
/**
 * Interface for vacation days mapping by year
 */
interface VacationDays {
  [year: string]: VacationYear;
}
/**
 * Interface for notification state
 */
interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}
/**
 * Admin screen component for managing user vacation days
 * Provides interface to view and edit vacation allocations for all users
 */
const AdminVacationManagementScreen: React.FC = () => {
  // Get the current year
  const currentYear = new Date().getFullYear();
  
  if (!UserRoleUtils.adminMode()) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">Access Denied</Typography>
        <Typography paragraph>
          You need administrator privileges to access this page.
        </Typography>
        <Button component={Link} to="/" variant="contained" startIcon={<KeyboardReturn />}>
          Return to Home
        </Button>
      </Box>
    );
  }
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vacationDays, setVacationDays] = useState<VacationDays>({});
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const setError = useSetAtom(errorAtom);
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim() === '') {
      setFilteredUsers(users);
    } else {
      const keyword = searchKeyword.toLowerCase();
      setFilteredUsers(
        users.filter(user =>
          (user.firstName?.toLowerCase() || '').includes(keyword) ||
          (user.lastName?.toLowerCase() || '').includes(keyword) ||
          (user.email?.toLowerCase() || '').includes(keyword) ||
          (user.username?.toLowerCase() || '').includes(keyword)
        )
      );
    }
  }, [searchKeyword, users]);
  /**
   * Fetches all users from the backend API
   */
  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<User[]>('http://localhost:3000/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (err) {
      const error = err as any;
      setError('Failed to load users from backend. Please try again.');
      setNotification({ open: true, message: 'Failed to load users.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  /**
   * Gets vacation days value from user attributes
   * Supports two storage formats:
   * 1. Individual attributes: vacation_YEAR and vacation_YEAR_remaining
   * 2. Arrays: vacationDaysByYear and unspentVacationDaysByYear in "YEAR:days" format
   * 
   * @param user - User object containing attributes
   * @param year - Year to get vacation data for
   * @param isRemaining - Whether to get remaining days (true) or total days (false)
   * @returns Vacation days value as string
   */
  const getVacationDaysValue = (user: User, year: number, isRemaining: boolean = false): string => {
    if (!user.attributes) return '0';
    const standardKey = isRemaining ? `vacation_${year}_remaining` : `vacation_${year}`;
    if (user.attributes[standardKey]?.[0]) {
      return user.attributes[standardKey][0];
    }
    const yearAttribute = isRemaining ? 'unspentVacationDaysByYear' : 'vacationDaysByYear';
    const yearPrefix = `${year}:`;
    
    if (user.attributes[yearAttribute]) {
      const yearValue = user.attributes[yearAttribute].find(val => val.startsWith(yearPrefix));
      if (yearValue) {
        return yearValue.split(':')[1].replace(/^0+/, '') || '0'; // Remove leading zeros
      }
    }
    
    return '0';
  };
  /**
   * Prepares vacation data for editing a specific user
   * @param user - User to edit
   */
  const handleEditUser = (user: User): void => {
    setCurrentUser(user);
    const data: VacationDays = {};
    
    // Calculate year range: current year and 3 years in the future
    const startYear = currentYear;
    const endYear = currentYear + 3;
    
    for (let year = startYear; year <= endYear; year++) {
      let total = '0';
      let remaining = '0';

      if (user.attributes?.[`vacation_${year}`]?.[0]) {
        total = user.attributes[`vacation_${year}`][0];
      }
      if (user.attributes?.[`vacation_${year}_remaining`]?.[0]) {
        remaining = user.attributes[`vacation_${year}_remaining`][0];
      }
      if (user.attributes?.vacationDaysByYear) {
        const yearEntry = user.attributes.vacationDaysByYear.find(val => val.startsWith(`${year}:`));
        if (yearEntry) {
          total = yearEntry.split(':')[1];
        }
      }
      
      if (user.attributes?.unspentVacationDaysByYear) {
        const yearEntry = user.attributes.unspentVacationDaysByYear.find(val => val.startsWith(`${year}:`));
        if (yearEntry) {
          remaining = yearEntry.split(':')[1];
        }
      }
      // Remove leading zeros
      total = total.replace(/^0+/, '') || '0';
      remaining = remaining.replace(/^0+/, '') || '0';
      data[year] = { total, remaining };
    }
    setVacationDays(data);
    setEditDialogOpen(true);
  };
  /**
   * Validates that remaining days don't exceed total days
   * 
   * @param vacationData - Vacation days data to validate
   * @returns Object with validation result and error message if invalid
   */
  const validateVacationDays = (vacationData: VacationDays): { isValid: boolean; errorMessage?: string } => {
    for (const year in vacationData) {
      const totalDays = parseInt(vacationData[year].total, 10);
      const remainingDays = parseInt(vacationData[year].remaining, 10);
      
      if (remainingDays > totalDays) {
        return {
          isValid: false,
          errorMessage: `Error for year ${year}: Remaining days (${remainingDays}) cannot exceed total days (${totalDays}).`
        };
      }
    }
    return { isValid: true };
  };
  /**
   * Saves vacation days to the backend API
   * Validates data before saving and converts to both supported formats:
   * 1. Individual attributes format
   * 2. Array format with "YEAR:value" entries
   */
  const handleSaveVacationDays = async (): Promise<void> => {
    if (!currentUser) return;
    const validation = validateVacationDays(vacationDays);
    if (!validation.isValid) {
      setNotification({
        open: true,
        message: validation.errorMessage || 'Validation error with vacation days.',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Convert to format with leading zeros
      const vacationDaysByYear = Object.keys(vacationDays).map(year => 
        `${year}:${vacationDays[year].total.padStart(3, '0')}`
      );
      const unspentVacationDaysByYear = Object.keys(vacationDays).map(year => 
        `${year}:${vacationDays[year].remaining.padStart(3, '0')}`
      );    
      // Create a payload with both formats
      const payload = {
        vacationDays,
        attributes: {
          vacationDaysByYear,
          unspentVacationDaysByYear,
          isActive: ['Active']
        }
      };
      await axios.put(
        `http://localhost:3000/users/${currentUser.id}/vacation`, 
        payload
      );
      await fetchUsers();
      setNotification({
        open: true,
        message: `Vacation days updated for ${currentUser.username || ''}`,
        severity: 'success'
      });
      
      setEditDialogOpen(false);
    } catch (err) {
      const error = err as any;
      
      setNotification({ 
        open: true, 
        message: 'Failed to update vacation days. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  /**
   * Closes the notification snackbar
   */
  const handleCloseNotification = (): void => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  /**
   * Formats user name for display
   * Uses firstName and lastName if available, falls back to username
   * 
   * @param user - User to display name for
   * @returns Formatted user name string
   */
  const displayName = (user: User): string => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username || 'Unknown';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Vacation Management</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name or email"
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{currentYear} Total</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{currentYear} Remaining</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No users found</TableCell></TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{displayName(user)}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {getVacationDaysValue(user, currentYear)} days
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {getVacationDaysValue(user, currentYear, true)} days
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEditUser(user)}><EditIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Vacation Days: {currentUser ? (displayName(currentUser) || currentUser.username) : ''}
        </DialogTitle>
        <DialogContent dividers>
          {Object.entries(vacationDays).map(([year, data]) => (
            <Box key={year} sx={{ mb: 2 }}>
              <Typography variant="h6">{year}</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Total Days"
                  type="number"
                  value={data.total}
                  onChange={(e) => {
                    const newTotal = e.target.value;
                    setVacationDays(prev => {
                      const updatedYear = { 
                        ...prev[year], 
                        total: newTotal 
                      };
                      
                      // Auto-correct remaining days if they exceed the new total
                      const totalNum = parseInt(newTotal, 10);
                      const remainingNum = parseInt(updatedYear.remaining, 10);
                      
                      if (!isNaN(totalNum) && !isNaN(remainingNum) && remainingNum > totalNum) {
                        updatedYear.remaining = newTotal;
                      }
                      
                      return {
                        ...prev,
                        [year]: updatedYear
                      };
                    });
                  }}
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText="Total vacation days for the year"
                />
                <TextField
                  label="Remaining Days"
                  type="number"
                  value={data.remaining}
                  onChange={(e) => {
                    const newRemaining = e.target.value;
                    setVacationDays(prev => {
                      const prevYear = prev[year];
                      const totalNum = parseInt(prevYear.total, 10);
                      const remainingNum = parseInt(newRemaining, 10);
                      
                      // Show error styling if remaining exceeds total
                      const hasError = !isNaN(totalNum) && !isNaN(remainingNum) && remainingNum > totalNum;
                      
                      return { 
                        ...prev, 
                        [year]: { 
                          ...prevYear, 
                          remaining: newRemaining,
                          hasError
                        } 
                      };
                    });
                  }}
                  fullWidth
                  inputProps={{ min: 0 }}
                  error={!!data.hasError}
                  helperText={data.hasError ? "Cannot exceed total days" : "Unused vacation days remaining"}
                />
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveVacationDays} disabled={loading} variant="contained">
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} onClose={handleCloseNotification}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminVacationManagementScreen;