import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  IconButton,
  Typography,
  useTheme
} from "@mui/material";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

interface RecommendCardProps {
  app: SoftwareRegistry;
  onAddUser: (appId: string) => Promise<void>;
  fetchUserName: (userId: string | undefined) => Promise<void>;
  userNames: { [key: string]: string };
  loadingUsers: { [key: string]: boolean };
  loadingAppId: string | null;
  setLoadingAppId: React.Dispatch<
    React.SetStateAction<{
      appId: string | null;
      users: { [key: string]: boolean };
    }>
  >;
}

const RecommendCard = ({
  app,
  onAddUser,
  fetchUserName,
  userNames,
  loadingUsers,
  loadingAppId,
  setLoadingAppId
}: RecommendCardProps) => {
  const theme = useTheme();
  useEffect(() => {
    if (app.createdBy) {
      fetchUserName(app.createdBy);
    }
  }, [app.createdBy]);

  return (
    <Card
      sx={{
        width: 288,
        height: 213,
        backgroundColor: theme.palette.background.paper,
        borderRadius: "10px",
        boxShadow: theme.shadows[1],
        overflow: "hidden",
        margin: "10px",
        ":hover": {
          boxShadow: theme.shadows[4]
        },
        position: "relative"
      }}
    >
      <CardActionArea component={Link} to={`${app.id}`} sx={{ padding: "16px" }}>
        <Box
          sx={{
            height: 80,
            width: 130,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            overflow: "hidden"
          }}
        >
          <CardMedia
            component="img"
            image={app.image}
            alt={app.name}
            sx={{
              maxHeight: "50px",
              maxWidth: "130px",
              objectFit: "contain",
              marginBottom: "8px",
              borderRadius: "8px"
            }}
          />
        </Box>
        <CardContent sx={{ padding: "0px", flex: "1", justifyContent: "space-between" }}>
          <Typography
            gutterBottom
            variant="h6"
            whiteSpace={"nowrap"}
            overflow={"hidden"}
            textOverflow={"ellipsis"}
            mt={1}
          >
            {app.name}
          </Typography>
          <Box>
            <Typography
              mt={1}
              sx={{
                fontSize: "16px",
                color: theme.palette.secondary.main,
                fontWeight: "600"
              }}
            >
              {loadingUsers[app.createdBy]
                ? strings.softwareRegistry.loading
                : userNames[app.createdBy] || strings.softwareRegistry.errorUnknownUser}
            </Typography>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            flexWrap="nowrap"
            width="100%"
            sx={{
              height: "30px",
              gap: 0.5,
              marginTop: "8px"
            }}
          >
            {app.tags?.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                sx={{
                  height: "25px",
                  borderRadius: "5px",
                  padding: "0 6px",
                  margin: "2px",
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.getContrastText(theme.palette.error.main),
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  maxWidth: "80px",
                  minWidth: "80px"
                }}
              />
            ))}
          </Box>
        </CardContent>
      </CardActionArea>

      <IconButton
        type="button"
        sx={{
          position: "absolute",
          top: "10px",
          right: "10px",
          color: theme.palette.text.primary
        }}
        onClick={() => {
          if (app.id) {
            setLoadingAppId((prev) => ({ ...prev, appId: app.id ?? null }));
            onAddUser(app.id).finally(() => setLoadingAppId((prev) => ({ ...prev, appId: null })));
          }
        }}
      >
        {loadingAppId === app.id ? <CircularProgress size={24} /> : <AddIcon />}
      </IconButton>
    </Card>
  );
};

export default RecommendCard;
