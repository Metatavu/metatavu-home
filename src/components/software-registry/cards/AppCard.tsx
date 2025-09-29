import { FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CardActionArea,
  Link as MuiLink
} from "@mui/material";
import { Link } from "react-router-dom";
import { SoftwareRegistry } from "src/generated/homeLambdasClient";

interface AppCardProps extends SoftwareRegistry {
  isGridView: boolean;
}

const AppCard: FunctionComponent<AppCardProps> = ({
  id,
  image,
  name,
  description,
  tags = [],
  isGridView
}) => {
  return (
    <MuiLink component={Link} to={`${id}`} underline="none" color="inherit">
      {isGridView ? (
        <Card
          sx={{
            height: 320,
            width: 240,
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            ":hover": {
              boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.3)"
            }
          }}
        >
          <CardActionArea sx={{ padding: "16px" }}>
            <CardMedia
              component="img"
              height="100px"
              width="240"
              image={image}
              alt={name}
              sx={{
                objectFit: "contain",
                marginBottom: "16px",
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
              <Box sx={{ minHeight: "90px" }} marginBottom={2}>
                <Typography
                  variant="body1"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {description}
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
                  gap: 2,
                  marginTop: "-8px"
                }}
              >
                {tags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    sx={{
                      borderRadius: "5px",
                      margin: "-5px",
                      backgroundColor: "#F9473B",
                      color: "#fff",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                      maxWidth: "70px",
                      minWidth: "60px"
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      ) : (
        <Card
          sx={{
            width: "100%",
            display: "flex",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            ":hover": {
              boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.3)"
            }
          }}
        >
          <CardActionArea
            sx={{
              padding: "8px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: "150px"
            }}
          >
            <Box
              sx={{
                width: "80px",
                height: "130px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: "16px",
                marginLeft: "8px"
              }}
            >
              <CardMedia
                component="img"
                image={image}
                alt={name}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "cover",
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
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "200px",
                    maxHeight: "80px"
                  }}
                >
                  {description}
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ flexWrap: "wrap", marginTop: "8px" }}
              >
                {tags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    sx={{
                      borderRadius: "5px",
                      backgroundColor: "#ff4d4f",
                      color: "#fff",
                      padding: "5px"
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      )}
    </MuiLink>
  );
};

export default AppCard;
