<!--docs:
title: Badges-->

# Badges
Badges indicate different statuses in the project. In this file we will go trough following components and their variants:

- [Status Icon badges (IconBadge)](#status-icon-badges)
- [Pill badges (PillBadge)](#pill-badges)

For more information regarding the design of these badges, see [figma.](https://www.figma.com/design/5dWTUXcmd8GjK2kT1Ti4CN/Metatavu-home-2026?node-id=635-2979)

## Status Icon badges
Status icon badges are used to indicate state of an individual item.
There are 3 different variants (from left to right):
1. empty
2. success
3. failed
!['status icons'](/docs/imgs/status_icons.png)

Usage example:
```typescript
const example = "success";
<IconBadge variant={example} />
```
This would result in green icon with check mark. In these 3 variants icon badge does have properties on `icon` and `color` but they are defined in the component, so user does not need to change them.

>NOTE: Icons shown in figma are from Material Symbols. For the time being, MUI does not support those. Failed/Cancel sign from Material Icons is slightly different which is why it might not be 1:1 match to the symbol on figma or the picture above in this document.

## Pill Badges
Pill badges are used to indicate status of:
- Vacation request
- Task/project
- WikiDocumentation article type

`<PillBadge />` component has 3 different properties:

Props      | Type                                            | Description
-----------|-------------------------------------------------|-------------
`variant`  | **approvalBadge**/**statusBadge**/**wikiBadge** | Defines the type of badge used
`status`   | **VacationStatuses**/**string***                | Defines style and possible icon of the badge
`children` | **React.ReactNode**                             | Label of the badge

> ***IMPORTANT:** For statusBadge and wikiBadge `status` is currently typed as `string`  due to incomplete business logic. Types should be changed once the logic is implemented.


Usage example:
```typescript
const exampleStatus = "inProgress";

<PillBadge variant="statusBadge" status={exampleStatus}>{strings.example.inProgress}</PillBadge>
```
This would result in following badge:

![inProgress badge](/docs/imgs/progress_badge.png)

There are multiple styles of each badge, depending on status:
Badge         | Status
--------------|---------
approvalBadge | "PENDING", "APPROVED", "DECLINED"
statusBadge   | "toDo", "inPlanning", "inProgress", "stuck", "deployment", "done", "canceled"
wikiBadge     | "rule", "practice"

`wikiBadge` has 2 sizes defined in figma. Approval and status badges have one size only. The typography style to match the sizing should be defined when component is used.

#### Approval badges:
![approval badges](/docs/imgs/approval_badges.png)

#### Status badges:
![status badges](/docs/imgs/status_badges.png)

#### Wiki badges:
![wiki badges](/docs/imgs/wiki_badges.png)

