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
 * Interface representing a Keycloak user
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

interface VacationYear {
  total: string;
  remaining: string;
}

interface VacationDays {
  [year: string]: VacationYear;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const AdminVacationManagementScreen: React.FC = () => {
  if (!UserRoleUtils.adminMode()) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">Access Denied</Typography>
        <Typography paragraph>
          You need administrator privileges to access this page.
        </Typography>
        <Button 
          component={Link} 
          to="/" 
          variant="contained"
          startIcon={<KeyboardReturn />}
        >
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
      const filtered = users.filter(user =>
        (user.firstName?.toLowerCase() || '').includes(searchKeyword.toLowerCase()) ||
        (user.lastName?.toLowerCase() || '').includes(searchKeyword.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchKeyword.toLowerCase()) ||
        (user.username?.toLowerCase() || '').includes(searchKeyword.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchKeyword, users]);

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      // Fetch users from the backend API - fixed endpoint to match backend
      const response = await axios.get<User[]>('http://localhost:3000/users');
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users from backend:', error);
      setError(`Failed to load users from backend. Please try again.`);
      setNotification({
        open: true,
        message: 'Failed to load users from backend. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User): void => {
    if (!user) return;
  
    setCurrentUser(user);
  
    const vacationData: VacationDays = {};
    const currentYear = new Date().getFullYear();
  
    // Iterate over a range of years (from two years ago to next year)
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      const yearTotal = user.attributes?.[`vacation_${i}`]?.[0] || '0';
      const yearRemaining = user.attributes?.[`vacation_${i}_remaining`]?.[0] || '0';
  
      vacationData[i.toString()] = {
        total: yearTotal,
        remaining: yearRemaining
      };
    }
  
    setVacationDays(vacationData);
    setEditDialogOpen(true);
  };
  
  const handleSaveVacationDays = (): void => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      // Prepare updated attributes
      const updatedAttributes: Record<string, string[]> = {
        ...(currentUser.attributes || {})
      };
      
      Object.keys(vacationDays).forEach(year => {
        updatedAttributes[`vacation_${year}`] = [vacationDays[year].total];
        updatedAttributes[`vacation_${year}_remaining`] = [vacationDays[year].remaining];
      });
      
      // Update the local state without making API calls
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === currentUser.id 
            ? { ...user, attributes: updatedAttributes } 
            : user
        )
      );
      
      console.log('Locally updated user vacation days:', updatedAttributes);
      
      setNotification({
        open: true,
        message: `Vacation days updated for ${currentUser.firstName} ${currentUser.lastName} (Local only)`,
        severity: 'success'
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update vacation days:', error);
      setNotification({
        open: true,
        message: 'Failed to update vacation days. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = (): void => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Admin Vacation Management
      </Typography>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search users by name or email"
          variant="outlined"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Current Year Total</TableCell>
              <TableCell align="right">Remaining Days</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="right">
                    {user.attributes?.[`vacation_${new Date().getFullYear()}`]?.[0] || '0'} days
                  </TableCell>
                  <TableCell align="right">
                    {user.attributes?.[`vacation_${new Date().getFullYear()}_remaining`]?.[0] || '0'} days
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditUser(user)}
                      aria-label="Edit vacation days"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Vacation Days: {currentUser?.firstName} {currentUser?.lastName}
        </DialogTitle>
        <DialogContent dividers>
          {Object.keys(vacationDays).map(year => (
            <Box key={year} sx={{ mb: 3 }}>
              <Typography variant="h6">{year}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <TextField
                  label="Total Days"
                  type="number"
                  value={vacationDays[year].total}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setVacationDays(prev => ({
                      ...prev,
                      [year]: {
                        ...prev[year],
                        total: newValue
                      }
                    }));
                  }}
                  InputProps={{ inputProps: { min: 0 } }}
                  fullWidth
                />
                <TextField
                  label="Remaining Days"
                  type="number"
                  value={vacationDays[year].remaining}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setVacationDays(prev => ({
                      ...prev,
                      [year]: {
                        ...prev[year],
                        remaining: newValue
                      }
                    }));
                  }}
                  InputProps={{ inputProps: { min: 0 } }}
                  fullWidth
                />
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveVacationDays} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminVacationManagementScreen;