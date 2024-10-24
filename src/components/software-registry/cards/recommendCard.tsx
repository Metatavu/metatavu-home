import React, { useEffect } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { SoftwareRegistry } from "src/generated/homeLambdasClient";

interface RecommendCardProps {
  app: SoftwareRegistry;
  onAddUser: (appId: string) => Promise<void>;
  fetchUserName: (userId: string | undefined) => Promise<void>;
  userNames: { [key: string]: string };
  loadingUsers: { [key: string]: boolean };
  loadingAppId: string | null;
  setLoadingAppId: React.Dispatch<React.SetStateAction<{
    appId: string | null;
    users: { [key: string]: boolean };
  }>>;
}

const RecommendCard: React.FC<RecommendCardProps> = ({
  app,
  onAddUser,
  fetchUserName,
  userNames,
  loadingUsers,
  loadingAppId,
  setLoadingAppId,
}) => {
  useEffect(() => {
    if (app.createdBy) {
      fetchUserName(app.createdBy);
    }
  }, [app.createdBy]);

  return (
    <Card
      sx={{
        width: 247,
        height: 250,
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        margin: "10px",
        ":hover": {
          boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.3)",
        },
        position: "relative",
      }}
    >
      <CardActionArea component={Link} to={`${app.id}`} sx={{ padding: "16px" }}>
        <CardMedia
          component="img"
          height="80"
          image={app.image}
          alt={app.name}
          sx={{
            objectFit: "contain",
            marginBottom: "16px",
            borderRadius: "8px",
          }}
        />
        <CardContent sx={{ padding: "0px", flex: "1" }}>
          <Typography
            gutterBottom
            variant="h6"
            mt={1}
            sx={{ fontSize: "16px", fontWeight: "bold" }}
          >
            {app.name}
          </Typography>
          <Box>
            <Typography
              mt={1}
              sx={{
                fontSize: "14px",
                color: "#f9473b",
                fontWeight: "bold",
              }}
            >
              {loadingUsers[app.createdBy]
                ? "Loading..."
                : userNames[app.createdBy] || "Unknown User"}
            </Typography>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            flexWrap="wrap"
            sx={{
              height: "60px",
              gap: 0.5,
              marginTop: "8px",
            }}
          >
            {app.tags &&
              app.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    height: "25px",
                    borderRadius: "5px",
                    padding: "0px",
                    margin: "2px",
                    backgroundColor: "#ff4d4f",
                    color: "#fff",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
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
          color: "#000",
        }}
        onClick={() => {
          if (app.id) {
            setLoadingAppId((prev) => ({ ...prev, appId: app.id ?? null }));
            onAddUser(app.id).finally(() =>
              setLoadingAppId((prev) => ({ ...prev, appId: null }))
            );
          }
        }}
      >
        {loadingAppId === app.id ? <CircularProgress size={24} /> : <AddIcon />}
      </IconButton>
    </Card>
  );
};

export default RecommendCard;
