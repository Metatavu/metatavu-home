import { Box, Card, Grid, Skeleton, type Theme, Typography, useTheme } from "@mui/material";
import { DateTime } from "luxon";
import type { ArticleMetadata, User } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { formatDate } from "src/utils/time-utils";
import { getLastActivityString } from "src/utils/wiki-utils";
import { PillBadge } from "../generics/badges";
import type { CardVisibilityProps } from "../generics/homepageCard";

const getWikiCardColors = (hidden: boolean, theme: Theme) => {
  return hidden
    ? {
        color: theme.palette.text.disabled,
        borderColor: theme.palette.border.disabled,
        filter: "grayscale(100%)"
      }
    : {
        color: theme.palette.text.primary,
        borderColor: theme.palette.border.primary,
        filter: "none"
      };
};

interface WikiCardContentProps extends CardVisibilityProps {
  lastUpdatedArticles: ArticleMetadata[];
  users: User[];
  loading: boolean;
}

/**
 * Render content for wikidocumentation card
 *
 * @param lastUpdatedArticles - Array of at least 2 last updated articles
 * @param users - Array of userdata
 * @param loading - Boolean indicating if the card content is still loading
 * @param hidden - Boolean indicating if the card is hidden
 *
 * @returns Styled content of wikidocumentationcard
 */
const RenderCardContent = ({
  lastUpdatedArticles,
  users,
  loading,
  hidden
}: WikiCardContentProps) => {
  const theme = useTheme();
  const articlesActivity = lastUpdatedArticles.map((article) => {
    return getLastActivityString(article, users);
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        rowGap: theme.spaces.s,
        mt: theme.spaces.m
      }}
    >
      {loading ? (
        <Skeleton />
      ) : (
        lastUpdatedArticles.map((article: ArticleMetadata, index) => (
          <Card
            key={article.id}
            variant="outlined"
            elevation={0}
            sx={{
              borderWidth: theme.borders.s,
              borderColor: theme.palette.border.primary,
              borderRadius: theme.radius.s,
              position: "relative",
              color: getWikiCardColors(hidden, theme).color
            }}
          >
            <Grid container direction="row">
              <Box
                component="img"
                sx={{
                  display: "block",
                  borderRadius: theme.radius.s,
                  width: 144,
                  height: 93,
                  margin: theme.spaces.xs,
                  filter: getWikiCardColors(hidden, theme).filter
                }}
                alt="alternative text"
                src={article.coverImage}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: theme.spaces.xs,
                  left: theme.spaces.xs,
                  transform: "scale(0.8)",
                  transformOrigin: "bottom left"
                }}
              >
                <PillBadge variant="wikiBadge" status="mandatory">
                  Example
                </PillBadge>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: theme.spaces.xs,
                  p: theme.spaces.s
                }}
              >
                <Typography variant="captionSmall">
                  {strings.formatString(
                    strings.wikiDocumentation.createdBy,
                    formatDate(DateTime.fromJSDate(article.lastUpdatedAt || new Date())),
                    articlesActivity[index].user
                  )}
                </Typography>
                <Typography variant="body" sx={{ fontWeight: 500 }}>
                  {article.title}
                </Typography>
                <Typography variant="caption">{article.description}</Typography>
              </Box>
            </Grid>
          </Card>
        ))
      )}
    </Box>
  );
};

export default RenderCardContent;
