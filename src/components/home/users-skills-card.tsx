import { Card, CardContent, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { userProfileAtom } from "src/atoms/auth";
import { usersAtom } from "src/atoms/user";
import type { User } from "src/generated/homeLambdasClient";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";

/**
 * Card component that navigates to the users skills management page.
 * Only visible to admin users.
 *
 * @component
 * @returns React functional component that renders a users skills card, or null for non-admins.
 */
const UsersSkillsCard = () => {
  const users = useAtomValue(usersAtom);
  const userProfile = useAtomValue(userProfileAtom);
  const { adminMode } = useUserRole();
  const navigate = useNavigate();

  if (!adminMode) return null;

  const handleCardClick = () => {
    navigate("/admin/users-skills-management");
  };

  return (
    <Card
      sx={{
        minHeight: 150,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out"
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold" style={{ marginTop: 6, marginBottom: 3 }}>
          {strings.usersSkills.heading}
        </Typography>
        <Typography variant="body1">{strings.usersSkills.cardDescription}</Typography>
      </CardContent>
    </Card>
  );
};

export default UsersSkillsCard;
