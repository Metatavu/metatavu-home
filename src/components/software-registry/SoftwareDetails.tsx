import { FunctionComponent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Link, 
  IconButton, 
  Button, 
  Card, 
  CircularProgress 
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import strings from "src/localization/strings";
import { useLambdasApi } from "src/hooks/use-api";
import { useAtomValue } from "jotai";
import { authAtom } from "src/atoms/auth";
import { SoftwareRegistry } from "src/generated/homeLambdasClient";
import AddSoftwareModal from "../software-registry/AddSoftwareModal";

/**
 * Component for displaying detailed information about a specific software entry.
 * Allows users to view software details, add the software to their applications, 
 * remove it from their applications, and edit the software details.
 *
 * @component
 */
const SoftwareDetails: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [software, setSoftware] = useState<SoftwareRegistry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdByUserName, setCreatedByUserName] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const { softwareApi, usersApi } = useLambdasApi();
  const auth = useAtomValue(authAtom);
  const loggedUserId = auth?.token?.sub ?? "";

  /**
   * Fetches software details.
   */
  useEffect(() => {
    fetchSoftwareDetails();
  }, [id]);

  /**
   * Fetches software details based on the id from the route parameters.
   * Also fetches the name of the user who created the software.
   */
  const fetchSoftwareDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await softwareApi.getSoftwareById({ id });
      setSoftware(data);
      if (data?.createdBy) {
        fetchUserName(data.createdBy);
      }
    } catch (error) {
      setError((error as Error).message || "Error fetching software details");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the name of a user based on their user id.
   * @param userId - The ID of the user to fetch.
   */
  const fetchUserName = async (userId: string) => {
    try {
      const users = await usersApi.listUsers();
      const user = users.find(u => u.id === userId);
      if (user) {
        setCreatedByUserName(`${user.firstName} ${user.lastName}`);
      }
    } catch (error) {
      setCreatedByUserName("Unknown User");
      console.error("Error fetching user name", error);
    }
  };

  /**
   * Removes the logged in user from the software's users list.
   */
  const handleRemoveSoftware = async () => {
    if (!id || !software) return;

    try {
      const updatedUsers = software.users?.filter((userId) => userId !== loggedUserId);
      await softwareApi.updateSoftwareById({
        id,
        softwareRegistry: { ...software, users: updatedUsers }
      });
      setSoftware({ ...software, users: updatedUsers });
    } catch (error) {
      setError((error as Error).message || "Error removing user from software");
    }
  };

  /**
   * Adds the logged in user to the software's users list.
   */
  const handleAddSoftware = async () => {
    if (!id || !software) return;
    try {
      const updatedUsers = [...software.users || "", loggedUserId];
      await softwareApi.updateSoftwareById({
        id,
        softwareRegistry: { ...software, users: updatedUsers }
      });
      setSoftware({ ...software, users: updatedUsers });
    } catch (error) {
      setError((error as Error).message || "Error adding user to software");
    }
  };

  /**
   * Updates the software details with the information provided from the edit modal.
   * @param updatedSoftware - The updated software information.
   */
  const handleEditSoftware = async (updatedSoftware: SoftwareRegistry) => {
    if (!id) return;
    try {
      await softwareApi.updateSoftwareById({
        id,
        softwareRegistry: updatedSoftware,
      });
      setSoftware(updatedSoftware);
      setIsEditModalOpen(false);
    } catch (error) {
      setError((error as Error).message || "Error updating software");
    }
  };

  if (loading) {
    return (
      <Card
        sx={{
          p: "25%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography>{strings.placeHolder.pleaseWait}</Typography>
          <CircularProgress
            sx={{
              scale: "150%",
              mt: "5%",
              mb: "5%",
            }}
          />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!software) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">No software details available.</Typography>
      </Box>
    );
  }

  const isUserInList = software.users?.includes(loggedUserId);

  return (
    <Container sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box my={4} display="flex" alignItems="center">
        <IconButton aria-label="back" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Box flexGrow={1} textAlign="center">
          <Typography 
            variant="h4" 
            sx={{ 
              color: "#000", 
              fontWeight: "bold" 
            }}
            >
              {strings.softwareRegistry.application}
          </Typography>
        </Box>
      </Box>
      <Box textAlign="center" mb={4}>
        {software.image && (
          <img src={software.image} 
          alt={software.name} 
          style={{ width: "150px", height: "150px" }} />
        )}
        <Typography gutterBottom 
          sx={{ 
            color: "#000", 
            fontSize: "30px", 
            fontWeight: "bold" 
            }}
          >
          {software.name}
        </Typography>
        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1} mb={2}>
          {software.tags?.map((tag: string, index: number) => (
            <Box
              key={index}
              component="span"
              sx={{
                backgroundColor: "#ff4d4f",
                color: "#fff",
                padding: "6px 8px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: 450,
              }}
            >
              {tag}
            </Box>
          ))}
        </Box>
        <Typography gutterBottom sx={{ color: "#000", fontWeight: "bold" }}>
          {createdByUserName} - {new Date(software.createdAt || "").toLocaleDateString()}
        </Typography>
        <Link href={software.url} target="_blank" rel="noopener" sx={{ color: "#ff4d4f" }}>
          {software.url}
        </Link>
      </Box>
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={6}>
          <Typography sx={{ fontWeight: "bold" }} gutterBottom>
            {strings.softwareRegistry.description}
          </Typography>
          <Typography variant="body1">{software.description}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography sx={{ fontWeight: "bold" }} gutterBottom>
            {strings.softwareRegistry.review}
          </Typography>
          <Typography variant="body1">{software.review}</Typography>
        </Grid>
      </Grid>
      <Box textAlign="center" m={4}>
        {isUserInList ? (
          <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: "25px",
              padding: "7px 10px",
              fontSize: "17px",
              fontWeight: "bold",
              color: "#000",
              borderColor: "#000",
              "&:hover": {
                borderColor: "#000",
                backgroundColor: "#f0f0f0",
              },
            }}
            onClick={handleRemoveSoftware}
          >
            {strings.softwareRegistry.remove}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              borderRadius: "25px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#fff",
              backgroundColor: "#f9473b",
              "&:hover": {
                backgroundColor: "#e63946",
              },
            }}
            onClick={handleAddSoftware}
          >
            {strings.softwareRegistry.addToMyApps}
          </Button>
        )}
        <Button
          variant="contained"
          color="secondary"
          sx={{
            textTransform: "none",
            color: "#fff",
            marginLeft: "20px",
            fontSize: "18px",
            background: "#000",
            borderRadius: "25px",
            "&:hover": { background: "grey" },
          }}
          onClick={() => setIsEditModalOpen(true)}
        >
          {strings.softwareRegistry.editApp}
        </Button>
      </Box>
      {software && (
        <AddSoftwareModal
          open={isEditModalOpen}
          handleClose={() => setIsEditModalOpen(false)}
          handleSave={handleEditSoftware}
          disabled={loading}
          softwareData={software}
          existingSoftwareList={[]}
        />
      )}
    </Container>
  );
};

export default SoftwareDetails;
