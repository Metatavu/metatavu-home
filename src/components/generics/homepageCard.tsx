import { CheckCircleRounded } from "@mui/icons-material";
import { Card, CardContent, Link, Switch, useTheme } from "@mui/material";

export interface CardProps {
  title?: string;
  content?: JSX.Element;
  path?: string;
  hidden: boolean;
  onToggleHidden: (arg0: boolean) => void;
  editmode: boolean;
}

/**
 * Card component to show content of the homepage cards.
 * Changes depending on visibility and homepage editmode.
 * @param props.title - String title of the card, used as a link.
 * @param props.content - Content of the card.
 * @param props.path - Link to the screen corresponding to card.
 * @param props.hidden - Boolean that defines is card hidden or visible.
 * @param props.onToggleHidden - Toggle functionality to change visibility.
 * @param props.editmode - Boolean that defines is editmode on or off.
 *
 * @returns Themed re-usable MUI Card component for homepage cards.
 */

const HomepageCard = ({ title, content, path, hidden, onToggleHidden, editmode }: CardProps) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: theme.radius.s,
        borderWidth: theme.borders.s,
        borderColor: hidden ? theme.palette.border.disabled : theme.palette.border.primary,
        color: hidden ? theme.palette.text.disabled : theme.palette.text.primary,
        marginBottom: theme.spaces.m
      }}
      variant="outlined"
      elevation={0}
    >
      <CardContent>
        <Link
          href={editmode ? undefined : path}
          variant="h4"
          sx={{
            textDecoration: "none",
            color: hidden ? theme.palette.text.disabled : theme.palette.text.primary
          }}
        >
          {title}
        </Link>
        {editmode && (
          <Switch
            sx={{ float: "right" }}
            checkedIcon={
              <CheckCircleRounded
                sx={{
                  width: 22,
                  height: 22,
                  gap: 0,
                  padding: "none",
                  transform: "scale(1.2)"
                }}
              />
            }
            checked={!hidden}
            onChange={(e) => onToggleHidden(e.target.checked)}
          />
        )}
        {content}
      </CardContent>
    </Card>
  );
};

export default HomepageCard;
