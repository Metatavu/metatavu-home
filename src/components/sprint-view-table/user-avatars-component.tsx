// NOTE: This component is related to timebank functionality and is commented out due to the removal of the timebank client.
// import { Avatar, AvatarGroup, Tooltip } from "@mui/material";
// import { useAtomValue } from "jotai";
// import { avatarsAtom, personsAtom } from "src/atoms/person";
// import type { Person } from "src/generated/client";
// import type { UsersAvatars } from "src/generated/homeLambdasClient";

// /**
//  * Component properties
//  */
// interface Props {
//   assignedPersons: number[];
// }

// /**
//  * List of avatars component
//  */
// const UserAvatars = ({ assignedPersons }: Props) => {
//   const persons: Person[] = useAtomValue(personsAtom);
//   const avatars: UsersAvatars[] = useAtomValue(avatarsAtom);
//   const maxAvatarsInLine = 3;

//   return (
//     <AvatarGroup
//       sx={{
//         "& .MuiAvatar-root": { width: 30, height: 30, fontSize: 15 }
//       }}
//     >
//       {renderAvatars(assignedPersons, persons, avatars, maxAvatarsInLine)}
//     </AvatarGroup>
//   );
// };

// /**
//  * Render Slack Avatars
//  *
//  * @param assignedPersons list of all persons
//  * @param avatars list of exsisting avatars
//  * @param persons list of persons assigned to the project
//  * @param maxAvatarsInLine avatars limitation per table cell
//  */
// const renderAvatars = (
//   assignedPersons: number[],
//   persons: Person[],
//   avatars: UsersAvatars[],
//   maxAvatarsInLine: number
// ) => {
//   return assignedPersons.map((personId: number, index: number) => {
//     const avatar = avatars?.find((avatar) => avatar.personId === personId);
//     const person = persons?.find((person) => person.id === personId);
//     const numberOfAssignedPersons = assignedPersons.length;
//     const hiddenAssignedPersons = numberOfAssignedPersons - maxAvatarsInLine;

//     if (index < maxAvatarsInLine) {
//       return (
//         <Tooltip key={personId} title={(person && `${person.firstName} ${person.lastName}`) || ""}>
//           <Avatar src={avatar?.imageOriginal || ""} />
//         </Tooltip>
//       );
//     }

//     if (index === maxAvatarsInLine && hiddenAssignedPersons > 0) {
//       const groupedPersons = assignedPersons.slice(maxAvatarsInLine);
//       let tooltipTitle = "";

//       groupedPersons.forEach((groupedPersonId: number) => {
//         const personFound = persons.find((person: { id: number }) => person.id === groupedPersonId);
//         if (personFound) {
//           tooltipTitle += `${personFound?.firstName} ${personFound?.lastName}, `;
//         }
//       });
//       tooltipTitle = tooltipTitle.slice(0, tooltipTitle.length - 2);
//       if (hiddenAssignedPersons === 1) {
//         return (
//           <Tooltip key={personId} title={tooltipTitle}>
//             <Avatar src={avatar?.imageOriginal} />
//           </Tooltip>
//         );
//       }
//       return (
//         <Tooltip
//           key={`hidden-avatars ${groupedPersons.map((personId) => personId)}`}
//           title={tooltipTitle}
//         >
//           <Avatar>+{hiddenAssignedPersons}</Avatar>
//         </Tooltip>
//       );
//     }
//   });
// };

// export default UserAvatars;