import { Button, type ButtonOwnProps, Typography, type TypographyProps } from "@mui/material";
import type { ComponentType, ReactNode } from "react";
import type { ButtonIconProps } from "src/types";

/**
 * Component properties
 */
interface Props {
  children?: ReactNode;
  buttonVariant?: ButtonOwnProps["variant"];
  titleVariant?: TypographyProps["variant"];
  value: boolean;
  setValue: (value: boolean) => void;
  ButtonIcon?: ComponentType<ButtonIconProps>;
  title?: string;
  disabled?: boolean;
}

/**
 * Generic Toggle Button component
 *
 * @param props component properties
 */
const FormToggleButton = ({
  children,
  value,
  setValue,
  ButtonIcon,
  title,
  titleVariant,
  buttonVariant,
  disabled
}: Props) => (
  <Button
    variant={buttonVariant ? buttonVariant : "contained"}
    onClick={() => {
      setValue(!value);
    }}
    sx={{
      width: "100%"
    }}
    disabled={disabled}
  >
    {ButtonIcon && <ButtonIcon />}
    {title && (
      <Typography variant={titleVariant ? titleVariant : "body1"} marginLeft={1}>
        {title}
      </Typography>
    )}
    {children}
  </Button>
);

export default FormToggleButton;
