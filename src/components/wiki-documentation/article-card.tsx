import { Box, Button, Card, Chip, Typography, useTheme } from "@mui/material";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";
import { usersAtom } from "src/atoms/user";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { formatDate } from "src/utils/time-utils";
import { getLastActivityString } from "src/utils/wiki-utils";

interface Props {
  article: ArticleMetadata;
  adminMode: boolean;
  onDeleteClick?: () => void;
}
/**
 * Displays an article summary card with image, title, activity info, tags,
 * and optionally a delete button in admin mode.
 *
 * @param article - Article metadata to display.
 * @param adminMode - Flag to show admin controls like delete button.
 * @param onDeleteClick - Callback function to open the delete confirmation dialog.
 */
const ArticleCard = ({ article, adminMode, onDeleteClick }: Props) => {
  const users = useAtomValue(usersAtom);
  const theme = useTheme();

  if (!article?.createdBy) return null;

  const lastActivityData = getLastActivityString(article, users);
  const tags = article.tags || [];
  const visibleTags = tags.slice(0, 2);
  const hiddenCount = tags.length - visibleTags.length;

  return (
    <Link to={article.path} style={{ textDecoration: "none", color: "inherit" }}>
      <Card
        key={`article-card-${article.id}`}
        sx={{
          padding: "20px",
          position: "relative",
          borderRadius: "20px",
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[4],
          width: { lg: "260px" },
          maxWidth: { md: "360px", sm: "400px" },
          display: "flex",
          flexDirection: "column",
          height: adminMode
            ? { lg: "394px", md: "414px", sm: "420px", xs: "530px" }
            : { lg: "354px", md: "374px", sm: "380px", xs: "485px" },
          ":hover": {
            boxShadow: theme.shadows[6],
            backgroundColor: theme.palette.action.hover
          }
        }}
      >
        <Box
          component="img"
          sx={{
            width: "100%",
            height: { lg: "170px", md: "190px", sm: "200px", xs: "300px" },
            borderRadius: "20px",
            marginRight: "10px",
            objectFit: "cover",
            overflow: "hidden"
          }}
          alt={article.title}
          src={article.coverImage}
        />
        <Typography
          variant="h6"
          sx={{
            paddingLeft: "5px",
            textAlign: "left",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
            wordBreak: "break-word",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 1
          }}
        >
          {article.title}
        </Typography>
        <Typography variant="body1" sx={{ paddingLeft: "5px", textAlign: "left" }}>
          {strings.formatString(
            "{0} {1}",
            lastActivityData.action,
            formatDate(
              DateTime.fromJSDate(article.lastUpdatedAt || article.createdAt || new Date())
            )
          )}
        </Typography>
        <Typography variant="body1" sx={{ paddingLeft: "5px", textAlign: "left" }}>
          {strings.formatString("by {0}", lastActivityData.user || "")}
        </Typography>
        <Box
          sx={{
            textAlign: "left",
            marginTop: 1,
            maxHeight: "38px",
            overflow: "hidden"
          }}
        >
          {visibleTags?.map((tag) => (
            <Chip
              label={tag}
              color="default"
              sx={{
                marginRight: 1,
                marginTop: 0.5,
                maxWidth: 70,
                minWidth: 70,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
              key={`${article.id}-${tag}`}
            />
          ))}
          {hiddenCount > 0 && (
            <Chip
              label={`+${hiddenCount}`}
              sx={{ marginRight: 1, marginTop: 0.5, flex: "0 0 auto" }}
              color="primary"
            />
          )}
        </Box>
        {adminMode && onDeleteClick && (
          <Button
            variant="outlined"
            size="small"
            sx={{ marginTop: "auto", zIndex: 10 }}
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDeleteClick();
            }}
          >
            {strings.questionnaireTable.delete}
          </Button>
        )}
      </Card>
    </Link>
  );
};

export default ArticleCard;
