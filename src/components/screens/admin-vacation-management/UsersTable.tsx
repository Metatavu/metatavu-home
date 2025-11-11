import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import type { User } from "src/generated/homeLambdasClient/models/User";
import strings from "../../../localization/strings";
import UserRow from "./UserRow";

/** Props for the UserTable component */
interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
}

/**
 * Extracts a user's first and last name from an email address.Only processes emails in the format: `firstname.lastname@`.And if has ext-firstname.lastname@ returns Ext-firstname and Lastname as username
 * @param email - The user's email address.
 * @returns An object containing `firstName` and `lastName`
 */
const parseNameFromEmail = (email?: string): {
  firstName: string;
  lastName: string
} => {
  if (!email) {
    return {
      firstName: "", lastName: ""
    }
  };

  const [usernamePart] = email.split("@");
  if (!usernamePart) {
    return {
      firstName: "", lastName: ""
    }
  };
  // split "firstname.lastname"
  const nameSegments = usernamePart.split(".").filter(Boolean);
  if (nameSegments.length < 2) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, lastName] = nameSegments;

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

  return {
    firstName: capitalize(firstName),
    lastName: capitalize(lastName)
  };
};
/**
 * Ensures a user object has `firstName` and `lastName` values.If the user's first or last name is missing, it attempts to parse them from the user's email address using {parseNameFromEmail}.
 * @param user - The user object to process.
 * @returns A user object guaranteed to include `firstName` and `lastName` values.
 */
const getDisplayUser = (user: User): User => {
  if (user.firstName && user.lastName) {
    return user;
  }
  const { firstName, lastName } = parseNameFromEmail(user.email);
  return { ...user, firstName, lastName };
};
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
            <TableCell align="center">
              {strings.userTable.currentYearTotal.replace("{year}", String(currentYear))}
            </TableCell>
            <TableCell align="center">{strings.userTable.remainingDays}</TableCell>
            <TableCell align="center">{strings.userTable.actions}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <UserRow key={user.id} user={getDisplayUser(user)} onEdit={onEdit} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
