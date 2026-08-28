import "@mui/material/styles";
import type React from "react";

/**
 * Module augmentation for Material UI theme.
 *
 * Extends the default Theme with custom design tokens:
 * - Palette extensions
 * - Layout tokens
 * - Typography variants
 *
 * NOTE:
 * These extensions are application-specific and not part of the
 * standard MUI theme.
 * IMPORTANT:
 * Any design system changes must update both this file and the theme
 * implementation (`theme.tsx`) to stay consistent.
 */
declare module "@mui/material/styles" {
  interface Palette {
    foreground: {
      inversed: string;
      positive: string;
      negative: string;
    };
    icons: {
      primary: string;
      empty: string;
      disabled: string;
    };
    border: {
      primary: string;
      accent: string;
      subtle: string;
      strong: string;
      disabled: string;
      badgePrimary: string;
    };
    hover: {
      primary: string;
      secondary: string;
      tag: string;
      navigation: string;
    };
    chart: {
      primary: string;
      secondary: string;
      accent: string;
      disabledPrimary: string;
      disabledAccent: string;
      disabledSecondary: string;
    };
    buttons: {
      primary: string;
      hover: string;
      secondaryBg: string;
      secondaryHover: string;
      accent: string;
      toggleThumb: string;
      disabledBg: string;
    };
    badges: {
      statusPending: string;
      stuckBg: string;
      reviewBg: string;
      reviewAccent: string;
      deploymentBg: string;
      deploymentAccent: string;
      progressBg: string;
      progressBgStrong: string;
      progressAccent: string;
      completedBg: string;
    };
  }
  interface TypeText {
    accent: string;
    accentSecondary: string;
  }
  interface TypeBackground {
    secondary: string;
    disabled: string;
    accent: string;
    accentSecondary: string;
    selected: string;
    event: string;
    tooltip: string;
  }
  interface PaletteOptions {
    foreground?: {
      inversed?: string;
      positive?: string;
      negative?: string;
    };
    icons?: {
      primary?: string;
      empty?: string;
      disabled?: string;
    };
    border?: {
      primary?: string;
      accent?: string;
      subtle?: string;
      strong?: string;
      disabled?: string;
      badgePrimary?: string;
    };
    hover?: {
      primary?: string;
      secondary?: string;
      tag?: string;
      navigation?: string;
    };
    chart?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      disabledPrimary?: string;
      disabledAccent?: string;
      disabledSecondary?: string;
    };
    buttons?: {
      primary?: string;
      hover?: string;
      secondaryBg?: string;
      secondaryHover?: string;
      accent?: string;
      toggleThumb?: string;
      disabledBg?: string;
    };
    badges?: {
      statusPending?: string;
      stuckBg?: string;
      reviewBg?: string;
      reviewAccent?: string;
      deploymentBg?: string;
      deploymentAccent?: string;
      progressBg?: string;
      progressBgStrong?: string;
      progressAccent?: string;
      completedBg: string;
    };
  }
  interface Theme {
    spaces: {
      none: string;
      xxs: string;
      xs: string;
      s: string;
      m: string;
      l: string;
      xl: string;
      xxl: string;
      xxxl: string;
      negative: string;
    };
    radius: {
      xs: string;
      s: string;
      m: string;
      full: string;
    };
    borders: {
      xs: string;
      s: string;
      m: string;
    };
    toggle: {
      on: string;
      off: string;
    };
  }
  interface ThemeOptions {
    spaces?: {
      none?: string;
      xxs?: string;
      xs?: string;
      s?: string;
      m?: string;
      l?: string;
      xl?: string;
      xxl?: string;
      xxxl?: string;
      negative?: string;
    };
    radius?: {
      xs?: string;
      s?: string;
      m?: string;
      full?: string;
    };
    borders?: {
      xs?: string;
      s?: string;
      m?: string;
    };
    toggle: {
      on: string;
      off: string;
    };
  }
  interface TypographyVariants {
    captionSmall: React.CSSProperties;
    body: React.CSSProperties;
    bodySmall: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    captionSmall?: React.CSSProperties;
    body?: React.CSSProperties;
    bodySmall?: React.CSSProperties;
  }
}
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    captionSmall: true;
    body: true;
    bodySmall: true;
  }
}
