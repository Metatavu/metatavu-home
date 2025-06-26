import type { User } from "src/generated/homeLambdasClient/models/User";
import UserRow from "./UserRow";
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
} from "@mui/material";
import strings from "../../../localization/strings";

/** Props for the UserTable component */
interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
}

/**
 * Displays a table of users with vacation information.
 * @param users - Array of users to display.
 * @param loading - Whether data is loading.
 * @param onEdit - Callback to edit a user.
 * @returns User table or loading/empty state UI.
 */
const UserTable = ({ users, loading, onEdit }: UserTableProps) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (users.length === 0) {
    return (
      <Typography align="center" sx={{ p: 3 }}>
        {strings.userTable.noUsersFound}
      </Typography>
    );
  }
  const currentYear = new Date().getFullYear();
  return (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{strings.userTable.name}</TableCell>
            <TableCell>{strings.userTable.email}</TableCell>
            <TableCell align="right">
              {strings.userTable.currentYearTotal.replace(
                "{year}",
                String(currentYear)
              )}
            </TableCell>
            <TableCell align="right">
              {strings.userTable.remainingDays}
            </TableCell>
            <TableCell align="center">{strings.userTable.actions}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} onEdit={onEdit} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
