import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Chip, IconButton, Stack, TableCell, TableRow, Tooltip, useTheme } from "@mui/material";
import type { UsersSkills } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

interface UsersSkillsRowProps {
  user: UsersSkills;
  onEdit: (user: UsersSkills) => void;
  onDelete: (user: UsersSkills) => void;
}

/**
 * Renders a single user row in the skills table.
 *
 * Displays the user's name, their skills as chips (name + months),
 * an edit button and a delete button.
 *
 * @param user - The UsersSkills object containing name and skills array.
 * @param onEdit - Callback to trigger editing the user's skills.
 * @param onDelete - Callback to trigger deleting the user's skills entry.
 * @returns JSX element representing a table row for the user's skills.
 */
const UsersSkillsRow = ({ user, onEdit, onDelete }: UsersSkillsRowProps) => {
  const theme = useTheme();

  return (
    <TableRow
      hover
      sx={{
        "&:hover": { backgroundColor: theme.palette.action.hover },
        "& td": { py: 2.5 }
      }}
    >
      <TableCell>{user.name}</TableCell>
      <TableCell>
        {user.skills?.length ? (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {user.skills.map((skill, index) => (
              <Chip key={index} label={`${skill.name} (${skill.months})`} />
            ))}
          </Stack>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell align="center">
        <Tooltip title={strings.usersSkills.editTitle}>
          <IconButton color="primary" onClick={() => onEdit(user)} aria-label="Edit user skills">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={strings.usersSkills.deleteEntry}>
          <IconButton color="error" onClick={() => onDelete(user)} aria-label="Delete user skills">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default UsersSkillsRow;
