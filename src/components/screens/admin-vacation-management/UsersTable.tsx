import type React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import UserRow from './UserRow';
import type { User } from '../../../types/index';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, onEdit }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Typography align="center" sx={{ p: 3 }}>
        No users found
      </Typography>
    );
  }

  return (
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
          {users.map(user => (
            <UserRow key={user.id} user={user} onEdit={onEdit} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
