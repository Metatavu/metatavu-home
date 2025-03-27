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
import strings from 'src/localization/strings';

// Define types for our data structures
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

/**
 * Admin Vacation Management Screen
 * Allows admins to view and update vacation days for all users
 */
const AdminVacationManagementScreen: React.FC = () => {
  // Check for admin mode
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

  // State management
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
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Filter users based on search keyword
  useEffect(() => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }
    
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
  
  /**
 * Fetch users from Keycloak via Lambda API
 */
const fetchUsers = async () => {
  setLoading(true);
  try {
    console.log('Fetching users from API...');
    
    // Use the direct server URL to bypass any proxy issues
    const response = await axios.get('http://localhost:3000/admin/users');
    console.log('Response received:', response.status);
    console.log('Fetched users:', response.data);
    
    setUsers(response.data || []);
    setFilteredUsers(response.data || []);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    setError(`Failed to load users. Please try again. Error: ${error}`);
    setNotification({
      open: true,
      message: 'Failed to load users. Please try again.',
      severity: 'error'
    });
    
    // Fall back to mock data for development
    const mockUsers = [
      {
        id: "user1",
        username: "john.doe",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        enabled: true,
        attributes: {
          "vacation_2024": ["20"],
          "vacation_2024_remaining": ["15"]
        }
      },
      {
        id: "user2",
        username: "jane.smith",
        firstName: "Jane", 
        lastName: "Smith",
        email: "jane.smith@example.com",
        enabled: true,
        attributes: {
          "vacation_2024": ["25"],
          "vacation_2024_remaining": ["10"]
        }
      },
      {
        id: "user3",
        username: "steve",
        firstName: "Steve", 
        lastName: "Smith",
        email: "steve.smith@example.com",
        enabled: true,
        attributes: {
          "vacation_2024": ["20"],
          "vacation_2024_remaining": ["10"]
        }
      }
    ];
    
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  } finally {
    setLoading(false);
  }
};
  /**
   * Helper function to get attribute value from user
   * Handles the case where attributes may be arrays
   */
  const getAttributeValue = (user: User, key: string): string => {
    if (!user || !user.attributes) return '0';
    
    const value = user.attributes[key];
    if (Array.isArray(value) && value.length > 0) {
      return value[0] || '0';
    }
    return '0';
  };
  
  /**
   * Handle opening edit dialog for a user
   */
  const handleEditUser = (user: User) => {
    if (!user) return;
    
    setCurrentUser(user);
    
    // Extract vacation data from user attributes
    const vacationData: VacationDays = {};
    const currentYear = new Date().getFullYear();
    
    // Get vacation data for current year and surrounding years
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
  
  /**
   * Handle saving vacation updates
   */
  const handleSaveVacation = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Convert vacation data to the format expected by the API
      const attributes: Record<string, string> = {};
      Object.entries(vacationDays).forEach(([year, data]) => {
        attributes[`vacation_${year}`] = data.total;
        attributes[`vacation_${year}_remaining`] = data.remaining;
      });
      
      // Call API to update user attributes
      await axios.put(`/admin/users/${currentUser.id}/vacation`, { attributes });
      
      // Update local state to reflect changes
      const updatedUsers = users.map(user => {
        if (user.id === currentUser.id) {
          // Create a new user object with updated attributes
          const updatedAttributes = { ...(user.attributes || {}) };
          Object.entries(attributes).forEach(([key, value]) => {
            updatedAttributes[key] = [value];
          });
          
          return {
            ...user,
            attributes: updatedAttributes
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setFilteredUsers(
        searchKeyword.trim() === '' 
          ? updatedUsers 
          : updatedUsers.filter(user => 
              (user.firstName?.toLowerCase() || '').includes(searchKeyword.toLowerCase()) ||
              (user.lastName?.toLowerCase() || '').includes(searchKeyword.toLowerCase()) ||
              (user.email?.toLowerCase() || '').includes(searchKeyword.toLowerCase())
            )
      );
      
      setNotification({
        open: true,
        message: 'Vacation days updated successfully!',
        severity: 'success'
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update vacation days:', error);
      setError(`Failed to update vacation days. Error: ${error}`);
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
   * Handle input changes for vacation days
   */
  const handleVacationChange = (year: string, field: keyof VacationYear, value: string) => {
    setVacationDays(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [field]: value
      }
    }));
  };
  
  /**
   * Close notification
   */
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Admin Vacation Management
      </Typography>
      
      {/* Search bar */}
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
      
      {/* Users table */}
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
            {loading && (!Array.isArray(filteredUsers) || filteredUsers.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : !Array.isArray(filteredUsers) || filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => {
                if (!user) return null;
                
                const currentYear = new Date().getFullYear().toString();
                const yearTotal = getAttributeValue(user, `vacation_${currentYear}`);
                const yearRemaining = getAttributeValue(user, `vacation_${currentYear}_remaining`);
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`}</TableCell>
                    <TableCell>{user.username || ''}</TableCell>
                    <TableCell>{user.email || ''}</TableCell>
                    <TableCell align="right">{yearTotal} days</TableCell>
                    <TableCell align="right">{yearRemaining} days</TableCell>
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Back button */}
      <Card sx={{ padding: "10px", width: "100%" }}>
        <Link to="/vacation-requests" style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={{ padding: "10px", width: "100%" }}>
            <KeyboardReturn sx={{ marginRight: "10px" }} />
            <Typography>Back to Vacation Requests</Typography>
          </Button>
        </Link>
      </Card>
      
      {/* Edit dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => !loading && setEditDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Edit Vacation Days for {currentUser?.firstName} {currentUser?.lastName}
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell>Total Vacation Days</TableCell>
                  <TableCell>Remaining Days</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentUser && Object.entries(vacationDays).map(([year, data]) => (
                  <TableRow key={year}>
                    <TableCell>{year}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={data.total}
                        onChange={(e) => handleVacationChange(year, 'total', e.target.value)}
                        inputProps={{ min: 0 }}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={data.remaining}
                        onChange={(e) => handleVacationChange(year, 'remaining', e.target.value)}
                        inputProps={{ min: 0 }}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveVacation} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
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