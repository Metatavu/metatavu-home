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
              boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.3)",
            },
          }}
        >
          <CardActionArea sx={{ padding: "16px" }}>
            <CardMedia
              component="img"
              height="90"
              image={image}
              alt={name}
              sx={{
                objectFit: "contain",
                marginBottom: "16px",
                borderRadius: "8px",
              }}
            />
            <CardContent sx={{ padding: 0 }}>
              <Typography
                gutterBottom
                variant="h6"
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {name}
              </Typography>
              <Box sx={{ minHeight: "90px" }}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {description}
                </Typography>
              </Box>
              <Box alignItems="center" sx={{ minHeight: "60px", maxHeight: "60px" }}>
                {tags.map((tag, index) => (
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
              boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.3)",
            },
          }}
        >
          <CardActionArea
            sx={{
              padding: "8px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: "150px",
            }}
          >
            <Box
              sx={{
                width: "150px",
                height: "100px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: "16px",
                marginLeft: "8px",
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
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxHeight: "48px",
                    whiteSpace: "normal",
                  }}
                >
                  {description}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5} sx={{ flexWrap: "wrap", marginTop: "8px" }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    sx={{
                      borderRadius: "5px",
                      backgroundColor: "#ff4d4f",
                      color: "#fff",
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
