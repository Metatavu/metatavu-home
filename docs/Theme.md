<!---docs
title: theme-->

# Theme

This document is about custom Material UI theme in the project.
We will go trough:
- [Basic structure and usage](#theme-structure-and-usage)
- [Changing the theme](#changing-theme)
- [Modes](#modes)

## Theme structure and usage

For more information about usage of styles and colors can be found from [figma](https://www.figma.com/design/5dWTUXcmd8GjK2kT1Ti4CN/Metatavu-home-2026?node-id=594-2732).

This theme is divided to several sections and extend beyond MUI default format:
- Colors are defined in `palette` and its nested properties:
  - foreground
  - background
  - text
  - icons
  - border
  - hover
  - chart
  - buttons
  - badges
- Spacing used in components is defined in `spaces`
- Radius used in borders etc. is defined in `radius`
- Borders (thickness) is defined in `borders`
- `typography` and it's nested properties define font styles for:
  - h1, h2, h3, h4, h5
  - body and bodySmall
  - caption and captionSmall
- It also has sections for MUI component styleOverides

The following colors can be found from the `palette`:

![list of colors](/docs/imgs/color_list_1.png)
![list of colors](/docs/imgs/color_list_2.png)
![list of colors](/docs/imgs/color_list_3.png)

Usage example:
```typescript
theme = useTheme();

<Box 
sx={{
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.foreground.positive
  }}
/>
```
Using other sections of the theme works very similar. By examingin the code, you can easily get the idea of the structure. If you're unsure what styles to use, please refer to figma linked above to check design details for each component and screen

## Changing theme

Theme values can be changed simply in the file `theme.tsx`. Replacing value of a color font style, etc then replaces the color all across the UI. This should be kept in mind when changing them. Consider wether using an additional variable would be needed, if the color changed affects multiple targets.

To add a new variable for a theme, it needs to be first added to the module augmentation in `themeTypes.tsx` and after that it can be implemented in `theme.tsx`. More on module augmentation in [TypeScript documentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) and [MUI Theming](https://mui.com/material-ui/customization/theming/#custom-variables).

## Modes
The project does support dark and light mode, however dark mode theme is mostly not implemented yet, so using it might cause unexpected behaviour with colors.