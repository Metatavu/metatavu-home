import { Avatar, AvatarGroup, Box, Tooltip } from "@mui/material";
import strings from "src/localization/strings";
import {  TrelloMember } from "src/generated/homeLambdasClient";

/**
 * Props for AvatarIcon component
 */
interface AvatarProps {
  memberId: string;
  members: TrelloMember[];
}

/**
 * Props for AvatarWrapper component
 */
interface AvatarWrapperProps {
  memberIds: string[];
  members: TrelloMember[];
}

/**
   * Renders an avatar for a specific member
   * 
   * @param memberId member ID
   */
 const AvatarIcon = ({memberId, members}: AvatarProps) => {
  const assignedMember = members.find((member) => member.memberId === memberId);

  if (!assignedMember) {
    return null;
  }
  const { fullName } = assignedMember;
  const initials = fullName?.split(" ").map((word) => word[0]).join("").toUpperCase();

  return (
    <Tooltip title={fullName || `${strings.cardRequestError.unknownMember}`}>
      <Avatar
        sx={{
          bgcolor: "primary.main",
          color: "white",
          width: 35,
          height: 35,
          fontSize: "1rem",
        }}
      >
        {initials}
      </Avatar>
    </Tooltip>
  );
};

/**
 * Renders a grouped avatars for assigned members
 * 
 * @param memberIds The list of member IDs to display
 */
export const AvatarWrapper = ({ memberIds, members }: AvatarWrapperProps) => {
  const maxAvatars = 3;
  const hiddenMembers = memberIds.slice(maxAvatars - 1);

  return (
    <AvatarGroup max={maxAvatars} sx={{ justifyContent: "flex-end" }}>
      {memberIds.slice(0, maxAvatars - 1).map((id) => (
        <AvatarIcon key={id} memberId={id} members={members} />
      ))}
    {hiddenMembers.length > 0 && (
      <Tooltip
        title={
          <Box>
            {hiddenMembers
              .map(
                (id) =>
                  members.find((member) => member.memberId === id)?.fullName || `${strings.cardRequestError.unknownMember}`
              )
              .map((name, index) => (
                <div key={index}>
                  {name}
                </div>
              ))}
        </Box>
        }
      >
        <Avatar
          sx={{
            bgcolor: "secondary.main",
            color: "white",
            width: 35,
            height: 35,
            fontSize: "0.8rem",
          }}
        >
          +{memberIds.length - (maxAvatars - 1)}
        </Avatar>
      </Tooltip>
    )}
    </AvatarGroup>
  );
};