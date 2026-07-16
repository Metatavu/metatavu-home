# AppSidebar

This documentation is about AppSidebar component. For more information regarding the design please see [Figma](https://www.figma.com/design/5dWTUXcmd8GjK2kT1Ti4CN/Metatavu-home-2026?node-id=714-4056)

## Content

- [Purpose](#purpose)
- [Dos and Dont's](#dos-and-donts)
- [SidebarItem](#sidebaritem)
  - [Properties](#properties)
- [SidebarConfig](#sidebarconfig)

### Purpose

The AppSidebar is the main navigation component of the application. it provides access to employee and management navigation items and can be collapsed to save space.

It is part of the main application layout and should not be rendered inside individual pages.

### Dos and Don'ts

### Do

- Always display the varian appropriate for the role
- Hilight the current page to support orientation

### Don't

- Show admin menu options if user does not have permissions
- Add navigation items directly inside AppSidebar

## SidebarItem

SidebarItem renders each item in the sidebar.

### Properties

**Property** | **Type**             | **Description**
-------------|----------------------|-----------------------------------
`title`      | string               | Title of the sidebar item
`route`      | string               | Route to the corresponding screen
`icon`       | React.ElementType    | Icon for the item
`collapsed`  | boolean \| undefined | Defines is the sidebar collapsed or not

## SidebarConfig

The contents of the items are configured in `sidebar-config.ts`. If items are wished to be edited, it should be done in that file. Note that there is configuration for employee and management items separately.

Each item is configured as follows:

```typescript
  export const getEmployeeMenu = () => [
    //...
    {
      title: strings.example.title,
      icon: MuiIconName,
      path: "/example"
    },
    //...
  ]
```
