import { Avatar, AvatarGroup, Tooltip } from "@mui/material";
import { useAtomValue } from "jotai";
import { avatarsAtom, personsAtom } from "src/atoms/person";
import { usersAtom } from "src/atoms/user";
import type { User, UsersAvatars } from "src/generated/homeLambdasClient";

/**
 * Component properties
 */
interface Props {
  assignedPersons: number[];
}

/**
 * List of avatars component
 * @param props component properties
 */
const UserAvatars = ({ assignedPersons }: Props) => {
  const users: User[] = useAtomValue(usersAtom);
  const avatars: UsersAvatars[] = useAtomValue(avatarsAtom);
  const maxAvatarsInLine = 3;

  return (
    <AvatarGroup
      sx={{
        "& .MuiAvatar-root": { width: 30, height: 30, fontSize: 15 },
      }}
    >
      {renderAvatars(assignedPersons, users, avatars, maxAvatarsInLine)}
    </AvatarGroup>
  );
};

/**
 * Render Slack Avatars
 *
 * @param assignedPersons list of all persons
 * @param avatars list of exsisting avatars
 * @param persons list of persons assigned to the project
 * @param maxAvatarsInLine avatars limitation per table cell
 */
const renderAvatars = (
  assignedPersons: number[],
  users: User[],
  avatars: UsersAvatars[],
  maxAvatarsInLine: number
) => {
  console.log("assignedPersons", assignedPersons);
  return assignedPersons.map((userId: number, index: number) => {
    const avatar = avatars?.find((avatar) => avatar.personId === userId);
    const user = users.find((user) => user.id === userId.toString());
    const numberOfAssignedPersons = assignedPersons.length;
    const hiddenAssignedPersons = numberOfAssignedPersons - maxAvatarsInLine;

    if (index < maxAvatarsInLine) {
      return (
        <Tooltip
          key={userId}
          title={(user && `${user.firstName} ${user.lastName}`) || ""}
        >
          <Avatar src={avatar?.imageOriginal || ""} />
        </Tooltip>
      );
    }

    if (index === maxAvatarsInLine && hiddenAssignedPersons > 0) {
      const groupedPersons = assignedPersons.slice(maxAvatarsInLine);
      let tooltipTitle = "";

      groupedPersons.forEach((groupedPersonId: number) => {
        const personFound = users.find(
          (user: User) => user.id === groupedPersonId.toString()
        );
        if (personFound) {
          tooltipTitle += `${personFound?.firstName} ${personFound?.lastName}, `;
        }
      });
      tooltipTitle = tooltipTitle.slice(0, tooltipTitle.length - 2);
      if (hiddenAssignedPersons === 1) {
        return (
          <Tooltip key={userId} title={tooltipTitle}>
            <Avatar src={avatar?.imageOriginal} />
          </Tooltip>
        );
      }
      return (
        <Tooltip
          key={`hidden-avatars ${groupedPersons.map((personId) => personId)}`}
          title={tooltipTitle}
        >
          <Avatar>+{hiddenAssignedPersons}</Avatar>
        </Tooltip>
      );
    }
  });
};

export default UserAvatars;
