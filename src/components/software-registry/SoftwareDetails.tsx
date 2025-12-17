import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  Link,
  Typography
} from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authAtom } from "src/atoms/auth";
import { softwareAtom } from "src/atoms/software";
import { usersAtom } from "src/atoms/user";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { getFullUserName } from "src/utils/user-name-utils";
import BackButton from "../generics/back-button";
import AddSoftwareModal from "./AddSoftwareModal";

/**
 * Component for displaying detailed information about a specific software entry.
 * Allows users to view software details, add the software to their applications,
 * remove it from their applications, and edit the software details.
 *
 * @component
 */
const SoftwareDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [software, setSoftware] = useState<SoftwareRegistry | null>(null);
  const [softwareList, setSoftwareList] = useAtom(softwareAtom);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { softwareApi } = useLambdasApi();
  const auth = useAtomValue(authAtom);
  const loggedUserId = auth?.token?.sub ?? "";
  const { adminMode } = useUserRole();
  const users = useAtomValue(usersAtom) || [];

  /**
   * Fetches software details.
   */
  useEffect(() => {
    fetchSoftwareDetails();
  }, [id]);

  useEffect(() => {
    fetchSoftwaresToList();
  }, []);

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
    } catch (error) {
      setError((error as Error).message || "Error fetching software details");
    } finally {
      setLoading(false);
    }
  };

  /**
   * List software and update the state.
   */
  const fetchSoftwaresToList = async () => {
    setLoading(true);
    try {
      const fetchedSoftware = await softwareApi.listSoftware();
      setSoftwareList(fetchedSoftware);
    } catch (error) {
      setError((error as Error).message || strings.softwareRegistry.errorFetchingSoftwareToList);
    } finally {
      setLoading(false);
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
   * Disables the AddSoftware button if the software is not approved
   */
  const isDisabled = () => {
    if (
      software?.status === "DECLINED" ||
      software?.status === "DEPRECATED" ||
      software?.status === "UNDER_REVIEW" ||
      software?.status === "PENDING"
    ) {
      return true;
    }
    return false;
  };

  /**
   * Adds the logged in user to the software's users list.
   */
  const handleAddSoftware = async () => {
    if (!id || !software) return;
    try {
      const updatedUsers = [...(software.users || ""), loggedUserId];
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
        softwareRegistry: updatedSoftware
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
          justifyContent: "center"
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography>{strings.placeHolder.pleaseWait}</Typography>
          <CircularProgress
            sx={{
              scale: "150%",
              mt: "5%",
              mb: "5%"
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
      <Box my={4} textAlign="center">
        <Typography variant="h2">{strings.softwareRegistry.application}</Typography>
      </Box>
      <Box textAlign="center" mb={4}>
        {software.image && (
          <img
            src={software.image}
            alt={software.name}
            style={{ width: "200px", height: "200px", objectFit: "contain" }}
          />
        )}
        <Typography gutterBottom variant="h3">
          {software.name}
        </Typography>
        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1} mb={2}>
          {software.tags?.map((tag) => (
            <Box
              key={tag}
              component="span"
              sx={{
                backgroundColor: "#F9473B",
                color: "#fff",
                padding: "6px 8px",
                borderRadius: "5px",
                fontSize: "14px",
                fontWeight: 450
              }}
            >
              {tag}
            </Box>
          ))}
        </Box>
        <Typography gutterBottom sx={{ color: "#000", fontWeight: "bold" }}>
          {getFullUserName(users.find((u) => u.id === software.createdBy))} -{" "}
          {new Date(software.createdAt || "").toLocaleDateString()}
        </Typography>
        <Link href={software.url} target="_blank" rel="noopener" sx={{ color: "#F9473B" }}>
          {software.url}
        </Link>
      </Box>
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {strings.softwareRegistry.description}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "normal",
              maxHeight: "220px",
              overflowY: "auto"
            }}
          >
            {software.description}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {strings.softwareRegistry.review}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "normal",
              maxHeight: "220px",
              overflowY: "auto"
            }}
          >
            {software.review}
          </Typography>
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
                backgroundColor: "#f0f0f0"
              }
            }}
            onClick={handleRemoveSoftware}
          >
            {strings.softwareRegistry.remove}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            disabled={isDisabled()}
            sx={{
              textTransform: "none",
              borderRadius: "25px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#000"
              }
            }}
            onClick={handleAddSoftware}
          >
            {strings.softwareRegistry.addToMyApps}
          </Button>
        )}
        {adminMode && (
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
              "&:hover": { background: "grey" }
            }}
            onClick={() => setIsEditModalOpen(true)}
          >
            {strings.softwareRegistry.editApp}
          </Button>
        )}
      </Box>
      {software && (
        <AddSoftwareModal
          open={isEditModalOpen}
          handleClose={() => setIsEditModalOpen(false)}
          handleSave={handleEditSoftware}
          disabled={loading}
          softwareData={software}
          existingSoftwareList={softwareList}
        />
      )}
      <BackButton styles={{ marginBottom: 2 }} />
    </Container>
  );
};

export default SoftwareDetails;
