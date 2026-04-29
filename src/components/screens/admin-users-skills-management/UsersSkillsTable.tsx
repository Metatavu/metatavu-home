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
import type { UsersSkills } from "src/generated/homeLambdasClient";
import UsersSkillsRow from "./UsersSkillsRow";

/** Props for the UsersSkillsTable component */
interface UsersSkillsTableProps {
  usersSkills: UsersSkills[];
  loading: boolean;
}

/**
 * Displays a table of users with their associated skills.
 *
 * Handles loading and empty states before rendering the table.
 * Each row is rendered by the UsersSkillsRow component.
 *
 * @param usersSkills - Array of user skill records to display.
 * @param loading - Whether data is currently loading.
 * @returns User skills table, or a loading/empty state UI.
 */
const UsersSkillsTable = ({ usersSkills, loading }: UsersSkillsTableProps) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (usersSkills.length === 0) {
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
            <TableCell>Skills</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usersSkills.map((user) => (
            <UsersSkillsRow key={user.id} user={user} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersSkillsTable;
