import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";
import { SoftwareStatus } from "src/generated/homeLambdasClient";
import strings from "src/localization/strings";

interface CardProps extends SoftwareRegistry {
  isGridView: boolean;
  isInMyApplications: boolean;
  isAdmin: boolean;
  onSave: () => void;
  onRemove?: () => void;
  onStatusChange?: (status: SoftwareStatus) => void;
}

const MainCard = ({
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
  onStatusChange
}: CardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Move statusInfo here so it updates with language changes
  const statusInfo: { [key in SoftwareStatus]: { color: string; displayText: string } } = {
    [SoftwareStatus.PENDING]: { color: "#f7cb73", displayText: strings.softwareStatus.pending },
    [SoftwareStatus.UNDER_REVIEW]: {
      color: "#077e8c",
      displayText: strings.softwareStatus.under_review
    },
    [SoftwareStatus.ACCEPTED]: { color: "#47b758", displayText: strings.softwareStatus.accepted },
    [SoftwareStatus.DEPRECATED]: {
      color: "#9f9080",
      displayText: strings.softwareStatus.deprecated
    },
    [SoftwareStatus.DECLINED]: { color: "#c82922", displayText: strings.softwareStatus.declined }
  };

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
                backgroundColor: statusInfo[status || "PENDING"].color
              }}
            />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={() => handleMenuClose()}>
            {Object.keys(SoftwareStatus).map((statusOption) => (
              <MenuItem
                key={statusOption}
                onClick={() => handleMenuClose(statusOption as SoftwareStatus)}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 20,
                      height: 15,
                      borderRadius: "5px",
                      backgroundColor: statusInfo[statusOption as SoftwareStatus].color
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color: statusInfo[statusOption as SoftwareStatus].color,
                    textTransform: "none"
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
            backgroundColor: statusInfo[status || "PENDING"].color
          }}
        />
      )}
    </Box>
  );

  /**
   * Renders the action buttons (save and delete) depending on whether the user is an admin.
   */
  const renderActionButtons = () => (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "left", padding: "8px 16px" }}
    >
      {status === SoftwareStatus.ACCEPTED && !isInMyApplications && (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          disabled={false}
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          sx={{
            textTransform: "none",
            color: "#fff",
            marginRight: "6px",
            borderRadius: "25px",
            "&:hover": { background: "#000" }
          }}
        >
          {strings.softwareRegistry.addApplication}
        </Button>
      )}
      {status === SoftwareStatus.ACCEPTED && isInMyApplications && (
        <Button
          variant="contained"
          size="small"
          disabled={true}
          sx={{
            textTransform: "none",
            color: "#fff",
            marginRight: "6px",
            background: "#f9473b",
            borderRadius: "25px",
            "&:hover": { background: "#f9473b" }
          }}
        >
          {strings.softwareRegistry.added}
        </Button>
      )}
      {status === SoftwareStatus.PENDING && (
        <Button
          variant="contained"
          size="small"
          disabled={true}
          sx={{
            textTransform: "none",
            color: "#fff",
            marginRight: "6px",
            background: "#f7cb73",
            borderRadius: "25px",
            "&:hover": { background: "#f7cb73" }
          }}
        >
          {statusInfo.PENDING?.displayText}
        </Button>
      )}
      {status === SoftwareStatus.DEPRECATED && (
        <Button
          variant="contained"
          size="small"
          disabled={true}
          sx={{
            textTransform: "none",
            color: "#fff",
            marginRight: "6px",
            background: "#f7cb73",
            borderRadius: "25px",
            "&:hover": { background: "#f7cb73" }
          }}
        >
          {statusInfo.DEPRECATED?.displayText}
        </Button>
      )}
      {status === SoftwareStatus.DECLINED && (
        <Button
          variant="contained"
          size="small"
          disabled={true}
          sx={{
            textTransform: "none",
            color: "#fff",
            marginRight: "6px",
            background: "#f7cb73",
            borderRadius: "25px",
            "&:hover": { background: "#f7cb73" }
          }}
        >
          {statusInfo.DECLINED?.displayText}
        </Button>
      )}
      {status === SoftwareStatus.UNDER_REVIEW && (
        <Button
          variant="contained"
          size="small"
          disabled={true}
          sx={{
            textTransform: "none",
            color: "#fff",
            marginRight: "6px",
            background: "#f7cb73",
            borderRadius: "25px",
            "&:hover": { background: "#f7cb73" }
          }}
        >
          {statusInfo.UNDER_REVIEW?.displayText}
        </Button>
      )}
      {isAdmin && onRemove && (
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          sx={{
            textTransform: "none",
            borderRadius: "25px",
            fontWeight: "bold",
            color: "#000",
            borderColor: "#000",
            "&:hover": {
              borderColor: "#000",
              backgroundColor: "#f0f0f0"
            }
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
      {tags.slice(0, 3).map((tag) => (
        <Chip
          key={tag}
          label={tag}
          sx={{
            height: "25px",
            borderRadius: "5px",
            padding: "0px",
            margin: "2px",
            backgroundColor: "#F9473B",
            color: "#fff",
            fontSize: "12px",
            whiteSpace: "nowrap",
            maxWidth: "70px",
            minWidth: "70px"
          }}
        />
      ))}
      {tags.length > 3 && (
        <Chip
          label={`+${tags.length - 3}`}
          sx={{
            height: "25px",
            borderRadius: "5px",
            padding: "0px",
            margin: "2px",
            backgroundColor: "#F9473B",
            color: "#fff",
            fontSize: "12px",
            whiteSpace: "nowrap"
          }}
        />
      )}
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
            backgroundColor: (theme) => theme.palette.background.paper,
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            ":hover": {
              boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.3)"
            }
          }}
        >
          <CardActionArea
            sx={{ padding: "14px", marginBottom: "-10px" }}
            component={Link}
            to={`${id}`}
          >
            <CardMedia
              component="img"
              height="80"
              image={image}
              alt={name}
              sx={{
                objectFit: "contain",
                marginBottom: "10px",
                borderRadius: "8px"
              }}
            />
            <CardContent sx={{ padding: 0 }}>
              <Typography
                gutterBottom
                variant="h6"
                overflow={"hidden"}
                textOverflow={"ellipsis"}
                whiteSpace={"nowrap"}
              >
                {name}
              </Typography>
              <Box sx={{ minHeight: "70px" }}>
                <Typography
                  variant="body1"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            {renderActionButtons()}
          </Box>
          {renderStatusBox()}
        </Card>
      ) : (
        <Card
          sx={{
            height: "auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            backgroundColor: (theme) => theme.palette.background.paper,
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            ":hover": {
              boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.3)"
            }
          }}
        >
          <Box
            sx={{
              display: "flex",
              flex: 1,
              alignItems: "center"
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
                flexGrow: 1
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
                    borderRadius: "8px"
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1, paddingLeft: "16px" }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  sx={{
                    marginBottom: "4px"
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
                      maxWidth: "40ch"
                    }}
                  >
                    {description}
                  </Typography>
                </Box>
                <Box
                  alignItems="center"
                  flexWrap="wrap"
                  sx={{ gap: 0.5, height: "30px", marginTop: "10px" }}
                >
                  {renderTags()}
                </Box>
              </CardContent>
            </CardActionArea>
          </Box>
          <Divider flexItem />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "8px"
            }}
          >
            {renderActionButtons()}
          </Box>
          {renderStatusBox()}
        </Card>
      )}
    </>
  );
};

export default MainCard;
