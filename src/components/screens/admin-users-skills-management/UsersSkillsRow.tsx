import { Chip, Stack, TableCell, TableRow } from "@mui/material";
import type { UsersSkills } from "src/generated/homeLambdasClient";

interface UsersSkillsRowProps {
  user: UsersSkills;
}

/**
 * Renders a single user row in the skills table.
 *
 * Displays the user's name and their skills as chips,
 * each showing the skill name and months of experience.
 *
 * @param user - The UsersSkills object containing name and skills array.
 * @returns JSX element representing a table row for the user's skills.
 */
const UsersSkillsRow = ({ user }: UsersSkillsRowProps) => {
  return (
    <TableRow hover key={user.id}>
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
    </TableRow>
  );
};

export default UsersSkillsRow;
