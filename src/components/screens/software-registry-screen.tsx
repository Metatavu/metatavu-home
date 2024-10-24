import {
  Button,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Alert,
  Container,
  IconButton,
  Card,
} from "@mui/material";
import { useState, useEffect, useMemo, useRef } from "react";
import Content from "../software-registry/myContent";
import AddSoftwareModal from "../software-registry/AddSoftwareModal";
import Recommendations from "../software-registry/Recommendations";
import Sidebar from "../software-registry/Sidebar";
import strings from "src/localization/strings";
import { useAtom, useAtomValue } from "jotai";
import { authAtom } from "src/atoms/auth";
import { useLambdasApi } from "src/hooks/use-api";
import { softwareAtom } from "src/atoms/software";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";
import GridViewIcon from "@mui/icons-material/GridView";
import ListViewIcon from "@mui/icons-material/List";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import useCreateSoftware from "src/hooks/use-create-software";

/**
 * Software registry screen component
 */
const SoftwareScreen = () => {
  const { softwareApi } = useLambdasApi();
  const auth = useAtomValue(authAtom);
  const loggedUserId = auth?.token?.sub ?? "";
  const [isGridView, setIsGridView] = useState(true);
  const [applications, setApplications] = useAtom(softwareAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>(""); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [showAll, setShowAll] = useState(false);
  const recommendationRef = useRef<null | HTMLDivElement>(null); 
  const { createSoftware } = useCreateSoftware(loggedUserId, setApplications); 

  /**
   * Scrolls to the recommendations section.
   */
  const scrollToRecommendations = () => {
    if (recommendationRef.current) {
      recommendationRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  /**
   * Filters the applications based on the logged-in user's id and the application status.
   *
   * @returns The list of filtered applications owned by the logged in user.
   */
  const myApplications = useMemo(
    () => applications.filter((app) =>
      app.users?.includes(loggedUserId) && app.status === "ACCEPTED"
    ),
    [applications, loggedUserId]
  );

  /**
   * Filters applications based on search input and tag selection.
   *
   * @returns Filtered applications matching the search and tags.
   */
  const filteredApplications = useMemo(
    () => myApplications.filter((app) => {
      const matchesSearch = app.name.toLowerCase().includes(searchValue.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
        (app.tags && selectedTags.some(tag => app.tags?.includes(tag)));
      return matchesSearch && matchesTags;
    }),
    [myApplications, selectedTags, searchValue]
  );

  /**
   * Retrieves the applications recommended for the logged in user.
   *
   * @returns The list of recommended applications.
   */
  const recommendedApplications = useMemo(
    () => applications.filter((app) => app.recommend?.includes(loggedUserId)),
    [applications, loggedUserId]
  );

  /**
   * Retrieves unique tags from the filtered applications.
   *
   * @returns The list of unique tags.
   */
  const filteredTags = useMemo(() => {
    const tags = new Set<string>();
    filteredApplications.forEach((app) => app.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, [filteredApplications]);

  /**
   * Fetches all software data.
   * This function retrieves the list of software applications from the API and updates the state.
   */
  const fetchSoftwareData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedApplications = await softwareApi.listSoftware();
      setApplications(fetchedApplications);
    } catch (error) {
      setError(`Error fetching software data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates the user's association with a specific application.
   * Either adds the user to the list or removes them based on the application ID.
   *
   * @param {string} appId - The ID of the application to update.
   */
  const handleUserUpdate = async (appId: string) => {
    setLoading(true);

    try {
      const app = applications.find(app => app.id === appId);

      if (app) {
        const isUserInApp = app.users?.includes(loggedUserId);

        const updatedApp: SoftwareRegistry = {
          ...app,
          users: isUserInApp ? app.users : [...(app.users || []), loggedUserId],
          recommend: app.recommend?.filter(id => id !== loggedUserId),
        };

        await softwareApi.updateSoftwareById({ id: appId, softwareRegistry: updatedApp });

        setApplications(prevApps =>
          prevApps.map(a => (a.id === appId ? updatedApp : a))
        );
      }
    } catch (error) {
      setError(`Error updating software: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the software data if the user is logged in.
   */
  useEffect(() => {
    fetchSoftwareData();
  }, [loggedUserId, auth]);

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

  return (
    <Container>
      <Grid container direction="column" alignItems="center" mt={4}>
        <Typography sx={{ fontWeight: "bold", fontSize: "35px" }} m={4}>
          {strings.softwareRegistry.applications}
        </Typography>
        {recommendedApplications.length > 0 && (
          <Grid item container justifyContent="center" alignItems="center" mb={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "20px", color: "#f9473b" }}>
              {strings.softwareRegistry.recommendationMessage.replace(
                "{recommendationCount}",
                recommendedApplications.length.toString()
              )}
            </Typography>
            <IconButton
              onClick={scrollToRecommendations}
              sx={{
                color: "#f9473b",
                backgroundColor: "transparent",
                ":hover": {
                  backgroundColor: "transparent",
                  boxShadow: "none",
                },
              }}
            >
              <ArrowDownwardIcon />
            </IconButton>
          </Grid>
        )}
        <Grid item container justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: "bold", fontSize: "30px" }}>
            {strings.softwareRegistry.myApplications}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsModalOpen(true)}
            sx={{
              textTransform: "none",
              color: "#fff",
              fontSize: "18px",
              background: "#f9473b",
              borderRadius: "100px",
              "&:hover": { background: "#000" },
            }}
          >
            {strings.softwareRegistry.addApplication}
          </Button>
        </Grid>
        <Grid item container justifyContent="right" mt={2}>
          <Box>
            <IconButton
              onClick={() => setIsGridView(true)}
              sx={{
                backgroundColor: isGridView ? "#f9473b" : "#f2f2f2",
                color: isGridView ? "#fff" : "#000",
                borderRadius: "4px",
                padding: "6px",
                marginRight: "10px",
                ":hover": {
                  backgroundColor: "#000",
                  color: "#fff",
                },
              }}
            >
              <GridViewIcon />
            </IconButton>
            <IconButton
              onClick={() => setIsGridView(false)}
              sx={{
                backgroundColor: !isGridView ? "#f9473b" : "#f2f2f2",
                color: !isGridView ? "#fff" : "#000",
                borderRadius: "4px",
                padding: "6px",
                ":hover": {
                  backgroundColor: "#000",
                  color: "#fff",
                },
              }}
            >
              <ListViewIcon />
            </IconButton>
          </Box>
        </Grid>
        <Grid container justifyContent="flex-start" mt={2}>
          <Grid item mr={2}>
            <Sidebar
              onTagSelection={setSelectedTags}
              filteredApplicationsCount={filteredApplications.length}
              availableTags={filteredTags}
              onSearch={setSearchValue}
            />
          </Grid>
          <Grid item xs>
            {error && (
              <Box mb={2} width="100%">
                <Alert severity="error">{error}</Alert>
              </Box>
            )}
            {loading ? (
              <Box textAlign="center">
                <CircularProgress size={50} sx={{ mt: 2 }} />
              </Box>
            ) : (
              <Content
                applications={
                  showAll ? 
                  filteredApplications : 
                  filteredApplications.slice(0, 4)
                }
                isGridView={isGridView}
              />
            )}
            {filteredApplications.length > 4 && (
              <Box textAlign="center" mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowAll(!showAll)}
                  sx={{
                    textTransform: "none",
                    color: "#fff",
                    fontSize: "18px",
                    background: "#f9473b",
                    borderRadius: "100px",
                    "&:hover": { background: "#000" },
                  }}
                >
                  {
                    showAll ? 
                    strings.softwareRegistry.showLess : 
                    strings.softwareRegistry.showMore
                  }
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid
        container
        direction="column"
        alignItems="center"
        mt={4}
        ref={recommendationRef}
      >
        <Recommendations
          applications={recommendedApplications}
          onAddUser={handleUserUpdate}
        />
      </Grid>
      <AddSoftwareModal
        open={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        handleSave={createSoftware}
        disabled={loading}
        existingSoftwareList={applications}
      />
    </Container>
  );
};

export default SoftwareScreen;
