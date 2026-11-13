import { Box, Button, Card, Chip, Typography, useTheme } from "@mui/material";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";
import bestPracticeIcon from "../../../resources/img/wiki/best-practice.svg";
import coverPlaceholder from "../../../resources/img/wiki/cover-placeholder.png";
import mandatoryRuleIcon from "../../../resources/img/wiki/mandatory-rule.svg";
import { usersAtom } from "src/atoms/user";
import type { ArticleMetadata } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";
import { formatDate } from "src/utils/time-utils";
import { getLastActivityString } from "src/utils/wiki-utils";

interface Props {
  article: ArticleMetadata;
  adminMode: boolean;
  featured?: boolean;
  onDeleteClick?: () => void;
}
const ArticleCard = ({ article, adminMode, featured = false, onDeleteClick }: Props) => {
  const users = useAtomValue(usersAtom);
  const theme = useTheme();

  if (!article?.createdBy) return null;

  const lastActivityData = getLastActivityString(article, users);
  const tags = article.tags || [];
  const visibleTags = tags.slice(0, 2);
  const hiddenCount = tags.length - visibleTags.length;

  if (!adminMode) {
    const activityDate =
      (lastActivityData.action === strings.wikiDocumentation.lastRead && article.lastReadAt) ||
      article.lastUpdatedAt ||
      article.createdAt;
    const dateLabel = activityDate ? formatDate(DateTime.fromJSDate(activityDate)) : "";
    const activityLabel = lastActivityData.user
      ? strings.formatString(strings.wikiDocumentation.createdBy, dateLabel, lastActivityData.user)
      : dateLabel;

    return (
      <Card
        component={Link}
        to={article.path}
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: featured ? { xs: "column", sm: "row" } : "column",
          alignItems: featured ? { xs: "stretch", sm: "center" } : "stretch",
          boxSizing: "border-box",
          minHeight: featured ? 228 : 268,
          height: "100%",
          gap: theme.spaces.m,
          p: theme.spaces.m,
          borderColor: theme.palette.border.primary,
          borderRadius: theme.radius.s,
          textDecoration: "none",
          textAlign: "left",
          color: "text.primary",
          "&:hover": { bgcolor: theme.palette.hover.secondary }
        }}
      >
        <Box
          sx={{
            position: "relative",
            flexShrink: 0,
            width: featured ? { xs: "100%", sm: "min(34%, 170px)" } : "100%",
            height: featured ? { xs: 161, sm: 196 } : 161,
            overflow: "hidden",
            borderRadius: theme.radius.s
          }}
        >
          <Box
            component="img"
            src={article.coverImage || coverPlaceholder}
            alt=""
            onError={(event) => {
              if (event.currentTarget.getAttribute("src") !== coverPlaceholder) {
                event.currentTarget.src = coverPlaceholder;
              }
            }}
            sx={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
          <Box
            sx={{
              position: "absolute",
              insetInline: theme.spaces.s,
              bottom: theme.spaces.s,
              display: "flex",
              gap: theme.spaces.xs
            }}
          >
            {visibleTags.map((tag) => {
              const name = tag.toLowerCase().trim();
              const badgeIcon =
                name === "mandatory rule"
                  ? mandatoryRuleIcon
                  : name === "best practice"
                    ? bestPracticeIcon
                    : undefined;
              return (
                <Chip
                  key={tag}
                  title={tag}
                  label={tag}
                  icon={badgeIcon ? <img src={badgeIcon} alt="" /> : undefined}
                  size="small"
                  sx={{
                    minWidth: 0,
                    height: 20,
                    fontSize: 12,
                    bgcolor: "background.paper",
                    "& .MuiChip-icon": { flexShrink: 0, ml: 0.5, mr: -0.5 }
                  }}
                />
              );
            })}
            {hiddenCount > 0 && (
              <Chip
                size="small"
                label={`+${hiddenCount}`}
                sx={{ height: 20, bgcolor: "background.paper" }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ minWidth: 0, flex: featured ? 1 : undefined }}>
          <Typography variant="body2" noWrap sx={{ mb: 1, fontSize: 14, lineHeight: 1.6 }} title={String(activityLabel)}>
            {activityLabel}
          </Typography>
          <Typography
            component="h3"
            variant="h4"
            noWrap
            title={article.title}
            sx={{ fontWeight: 500 }}
          >
            {article.title}
          </Typography>
          {featured && (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                fontSize: 14,
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                overflow: "hidden"
              }}
            >
              {article.description}
            </Typography>
          )}
        </Box>
      </Card>
    );
  }

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
          height: { lg: "394px", md: "414px", sm: "420px", xs: "530px" },
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
