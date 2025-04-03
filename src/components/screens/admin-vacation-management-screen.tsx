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
  Card,
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
      // Fetch users from the backend API
      const response = await axios.get<User[]>('http://localhost:3000/admin/users');
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
      const yearTotal = getAttributeValue(user, `vacation_${i}`);
      const yearRemaining = getAttributeValue(user, `vacation_${i}_remaining`);
  
      vacationData[i.toString()] = {
        total: yearTotal,
        remaining: yearRemaining
      };
    }
  
    setVacationDays(vacationData);
    setEditDialogOpen(true);
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
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="right">0 days</TableCell>
                  <TableCell align="right">0 days</TableCell>
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
