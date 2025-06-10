import type React from 'react';
import { TableRow, TableCell, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { User } from '../../../types/index';

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onEdit }) => {
  const currentYear = new Date().getFullYear().toString();

  const getDays = (arr: string[] | undefined, year: string) => {
    if (!arr) return '0';
    const found = arr.find(s => s.startsWith(`${year}:`));
    return found ? found.split(':')[1] : '0';
  };

  const totalDays = getDays(user.attributes?.vacationDaysByYear, currentYear);
  const remainingDays = getDays(user.attributes?.unspentVacationDaysByYear, currentYear);

  return (
    <TableRow key={user.id}>
      <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`}</TableCell>
      <TableCell>{user.username}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell align="right">{Number.parseInt(totalDays, 10)} days</TableCell>
      <TableCell align="right">{Number.parseInt(remainingDays, 10)} days</TableCell>
      <TableCell align="center">
        <IconButton color="primary" onClick={() => onEdit(user)} aria-label="Edit vacation days">
          <EditIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default UserRow;
