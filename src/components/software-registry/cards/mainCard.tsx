import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CardActionArea,
  Divider,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link } from "react-router-dom";
import { SoftwareRegistry, SoftwareStatus } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

const statusInfo: { [key in SoftwareStatus]: { color: string; displayText: string } } = {
  PENDING: { color: "#f7cb73", displayText: "Pending" },
  UNDER_REVIEW: { color: "#077e8c", displayText: "Under review" },
  ACCEPTED: { color: "#47b758", displayText: "Accepted" },
  DEPRECATED: { color: "#9f9080", displayText: "Deprecated" },
  DECLINED: { color: "#c82922", displayText: "Declined" },
};

interface CardProps extends SoftwareRegistry {
  isGridView: boolean;
  isInMyApplications: boolean;
  isAdmin: boolean;
  onSave: () => void;
  onRemove?: () => void;
  onStatusChange?: (status: SoftwareStatus) => void;
}

const MainCard: React.FC<CardProps> = ({
  id,
  image,
  name,
  description,
  tags = [],
  status,
  isGridView,
  isInMyApplications,
  isAdmin,
  onSave,
  onRemove,
  onStatusChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (newStatus?: SoftwareStatus) => {
    setAnchorEl(null);
    if (newStatus && onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  /**
   * Renders the status box or menu based on whether the user is an admin.
   */
  const renderStatusBox = () => (
    <Box sx={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center" }}>
      {isAdmin ? (
        <>
          <IconButton onClick={handleMenuClick} sx={{ padding: 0 }}>
            <Box
              sx={{
                width: 30,
                height: 20,
                borderRadius: "5px",
                backgroundColor: statusInfo[status || "PENDING"].color,
              }}
            />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={() => handleMenuClose()}>
            {Object.keys(SoftwareStatus).map((statusOption) => (
              <MenuItem key={statusOption} onClick={() => handleMenuClose(statusOption as SoftwareStatus)}>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 20,
                      height: 15,
                      borderRadius: "5px",
                      backgroundColor: statusInfo[statusOption as SoftwareStatus].color,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color: statusInfo[statusOption as SoftwareStatus].color,
                    textTransform: "none",
                  }}
                >
                  {statusInfo[statusOption as SoftwareStatus].displayText}
                </ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <Box
          sx={{
            width: 30,
            height: 20,
            borderRadius: "5px",
            backgroundColor: statusInfo[status || "PENDING"].color,
          }}
        />
      )}
    </Box>
  );

  /**
   * Renders the action buttons (save and delete) depending on whether the user is an admin.
   */
  const renderActionButtons = () => (
    <Box sx={{ display: "flex", justifyContent: "left", padding: "8px 16px" }}>
      <Button
        variant="contained"
        size="small"
        disabled={isInMyApplications}
        onClick={(e) => {
          e.stopPropagation();
          onSave();
        }}
        sx={{
          textTransform: "none",
          color: "#fff",
          marginRight: "6px",
          background: "#f9473b",
          borderRadius: "25px",
          "&:hover": { background: "#000" },
        }}
      >
        {
          isInMyApplications ? 
          strings.softwareRegistry.added : 
          strings.softwareRegistry.addApplication
        }
      </Button>
      {isAdmin && (
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemove && onRemove();
          }}
          sx={{
            textTransform: "none",
            borderRadius: "25px",
            fontWeight: "bold",
            color: "#000",
            borderColor: "#000",
            "&:hover": {
              borderColor: "#000",
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          {strings.softwareRegistry.delete}
        </Button>
      )}
    </Box>
  );

  /**
   * Renders the tags as chips.
   */
  const renderTags = () => (
    <Box>
      {tags.map((tag) => (
        <Chip
          key={tag}
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
  );

  return (
    <>
      {isGridView ? (
        <Card
          sx={{
            height: 330,
            width: 260,
            position: "relative",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            ":hover": {
              boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.3)",
            },
          }}
        >
          <CardActionArea sx={{ padding: "14px" }} component={Link} to={`${id}`}>
            <CardMedia
              component="img"
              height="80"
              image={image}
              alt={name}
              sx={{
                objectFit: "contain",
                marginBottom: "10px",
                borderRadius: "8px",
              }}
            />
            <CardContent sx={{ padding: 0 }}>
              <Typography gutterBottom variant="h6" sx={{ fontSize: "16px", fontWeight: "bold" }}>
                {name}
              </Typography>
              <Box sx={{ minHeight: "70px" }}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {description}
                </Typography>
              </Box>
              <Box alignItems="center" flexWrap="wrap" sx={{ gap: 0.5, height: "60px" }}>
                {renderTags()}
              </Box>
            </CardContent>
          </CardActionArea>
          <Divider />
          {renderActionButtons()}
          {renderStatusBox()}
        </Card>
      ) : (
        <Card
          sx={{
            height: "auto",
            width: "100%",
            display: "flex",
            position: "relative",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            ":hover": {
              boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.3)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flex: 1,
              alignItems: "center",
            }}
          >
            <CardActionArea
              component={Link}
              to={`${id}`}
              sx={{
                padding: "8px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                height: "140px",
                flexGrow: 1,
              }}
            >
              <Box>
                <CardMedia
                  component="img"
                  height="80"
                  image={image}
                  alt={name}
                  sx={{
                    width: "80px",
                    objectFit: "contain",
                    margin: "10px",
                    borderRadius: "8px",
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1, paddingLeft: "16px" }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  sx={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  {name}
                </Typography>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {description}
                  </Typography>
                </Box>
                <Box alignItems="center" flexWrap="wrap" sx={{ gap: 0.5, height: "30px", marginTop: "10px" }}>
                  {renderTags()}
                </Box>
              </CardContent>
            </CardActionArea>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "8px",
            }}
          >
            <Button
              variant="contained"
              size="small"
              disabled={isInMyApplications}
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              sx={{
                textTransform: "none",
                color: "#fff",
                background: "#f9473b",
                borderRadius: "25px",
                fontSize: "12px",
                marginBottom: "8px",
                "&:hover": { background: "#000" },
              }}
            >
              {
                isInMyApplications ? 
                strings.softwareRegistry.added : 
                strings.softwareRegistry.addApplication
              }
            </Button>
            {isAdmin && (
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove && onRemove();
                }}
                sx={{
                  textTransform: "none",
                  borderRadius: "25px",
                  fontWeight: "bold",
                  color: "#000",
                  borderColor: "#000",
                  fontSize: "12px",
                  "&:hover": {
                    borderColor: "#000",
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                {strings.softwareRegistry.delete}
              </Button>
            )}
          </Box>
          {renderStatusBox()}
        </Card>
      )}
    </>
  );
};

export default MainCard;
