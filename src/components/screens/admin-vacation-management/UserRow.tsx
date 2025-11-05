import EditIcon from "@mui/icons-material/Edit";
import { IconButton, TableCell, TableRow } from "@mui/material";
import type { User } from "src/generated/homeLambdasClient/models/User";
import strings from "src/localization/strings";

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
}

/**
 * Gets the vacation days string for a given year from an array of "year:value" strings.
 * @param arr - Array of strings in the format "year:value".
 * @param year - Year to look up.
 * @returns Number of days as string or "0" if not found.
 */
export const getDays = (arr: string[] | undefined, year: string): string => {
  if (!arr) return "0";
  const found = arr.find((s) => s.startsWith(`${year}:`));
  return found ? found.split(":")[1] : "0";
};

/**
 * Renders a single user row in a table with editable vacation days.
 * @param user - The user object containing user details and vacation data.
 * @param onEdit - Callback to trigger editing the user's vacation days.
 * @returns JSX element representing a table row for the user.
 */
const UserRow = ({ user, onEdit }: UserRowProps) => {
  const currentYear = new Date().getFullYear().toString();
  const totalDays = getDays(user.attributes?.vacationDaysByYear, currentYear);
  const remainingDays = getDays(user.attributes?.unspentVacationDaysByYear, currentYear);
  return (
    <TableRow
    hover 
      sx={{ 
        '&:hover': { backgroundColor: '#fafafa' },
        '& td': { py: 2.5 }
      }}
    key={user.id}>
      <TableCell>{`${user.firstName || ""} ${user.lastName || ""}`.trim() || "-" }</TableCell>
      <TableCell>{user.email ?? "-"}</TableCell>
      <TableCell align="center">
        {Number.parseInt(totalDays, 10)} {strings.userRow.day}
      </TableCell>
      <TableCell align="center">
        {Number.parseInt(remainingDays, 10)} {strings.userRow.day}
      </TableCell>
      <TableCell align="center">
        <IconButton color="primary" onClick={() => onEdit(user)} aria-label="Edit vacation days">
          <EditIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default UserRow;
