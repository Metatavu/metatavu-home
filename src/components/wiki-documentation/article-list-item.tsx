import { Box, Button, Card, Chip, Grid, Typography } from "@mui/material";
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
  adminMode?: boolean;
  onDeleteClick?: () => void;
}
/**
 * Renders a responsive article list item with image, title, description, tags, and activity info.
 * Shows a delete button if `adminMode` is enabled and `handleDelete` is provided.
 *
 * @param article - Article metadata to display.
 * @param adminMode - Optional flag to enable admin features like delete button (default: false).
 * @param onDeleteClick - Optional callback to open the delete confirmation dialog.
 */
const ArticleListItem = ({ article, adminMode = false, onDeleteClick }: Props) => {
  const users = useAtomValue(usersAtom);

  if (!article?.createdBy) return null;

  const lastActivityData = getLastActivityString(article, users);
  return (
    <Link to={article.path} style={{ textDecoration: "none" }}>
      <Card
        key={`article-card-${article.id}`}
        sx={{
          padding: "20px",
          position: "relative",
          borderRadius: "20px",
          backgroundColor: "#fff",
          width: "100%",
          ":hover": {
            boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.3)",
            backgroundColor: "rgba(0, 0, 0, 0.04)"
          }
        }}
      >
        <Grid container spacing={3}>
          <Grid item lg={2.7} md={3.5} sm={5} xs={12}>
            <Box
              component="img"
              sx={{
                width: "100%",
                height: { lg: "185px", md: "190px", sm: "215px", xs: "300px" },
                borderRadius: "20px",
                marginRight: "10px",
                objectFit: "cover",
                overflow: "hidden"
              }}
              alt={article.title}
              src={article.coverImage}
            />
          </Grid>
          <Grid item lg={8.6} md={8} sm={6} xs={12}>
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
                WebkitLineClamp: 1,
                marginBottom: adminMode ? 1.5 : 3
              }}
            >
              {article.title}
            </Typography>
            <Typography
              sx={{
                paddingLeft: "5px",
                textAlign: "left",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: { xs: 2, sm: adminMode ? 2 : 3 }
              }}
            >
              {article.description}
            </Typography>
            <Grid
              container
              justifyContent={"space-between"}
              sx={{ marginTop: { lg: 1.5, md: 2, sm: 1.5 } }}
              direction={{ xs: "column", md: "row" }}
            >
              <Grid item sx={{ order: { xs: 2, md: 1 } }}>
                <Box
                  sx={{
                    textAlign: "left",
                    maxHeight: "38px",
                    overflow: "hidden"
                  }}
                >
                  {article.tags?.map((tag) => (
                    <Chip
                      label={tag}
                      sx={{ marginRight: 1, marginTop: 0.5 }}
                      key={`${article.id}-${tag}`}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item sx={{ order: { xs: 1, md: 2 } }}>
                <Typography
                  variant="body1"
                  sx={{ paddingLeft: "5px", textAlign: "left", paddingTop: 0.5 }}
                >
                  {strings.formatString(
                    "{0} {1} by {2}",
                    lastActivityData.action,
                    formatDate(
                      DateTime.fromJSDate(article.lastUpdatedAt || article.createdAt || new Date())
                    ),
                    lastActivityData.user || ""
                  )}
                </Typography>
              </Grid>
            </Grid>
            {adminMode && onDeleteClick && (
              <Button
                variant="outlined"
                size="small"
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
          </Grid>
        </Grid>
      </Card>
    </Link>
  );
};

export default ArticleListItem;
