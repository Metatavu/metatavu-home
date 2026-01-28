import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import GridViewIcon from "@mui/icons-material/GridView";
import ListViewIcon from "@mui/icons-material/List";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Typography,
  useTheme
} from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { authAtom } from "src/atoms/auth";
import { softwareAtom } from "src/atoms/software";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";
import { SoftwareStatus } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import useCreateSoftware from "src/hooks/use-create-software";
import strings from "src/localization/strings";
import BackButton from "../generics/back-button";
import AddSoftwareModal from "../software-registry/AddSoftwareModal";
import Content from "../software-registry/myContent";
import Recommendations from "../software-registry/Recommendations";
import Sidebar from "../software-registry/Sidebar";

/**
 * Software registry screen component
 */
const SoftwareScreen = () => {
  const { softwareApi } = useLambdasApi();
  const auth = useAtomValue(authAtom);
  const loggedUserId = auth?.token?.sub ?? "";
  const [isGridView, setIsGridView] = useState(true);
  const [software, setApplications] = useAtom(softwareAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const recommendationRef = useRef<null | HTMLDivElement>(null);
  const { createSoftware } = useCreateSoftware(loggedUserId, setApplications);
  const theme = useTheme();

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
  const mySoftware = useMemo(
    () =>
      software.filter(
        (software) =>
          software.users?.includes(loggedUserId) && software.status === SoftwareStatus.ACCEPTED
      ),
    [software, loggedUserId]
  );

  /**
   * Filters applications based on search input and tag selection.
   *
   * @returns Filtered applications matching the search and tags.
   */
  const filteredSoftware = useMemo(() => {
    return mySoftware.filter((software) => {
      const matchesName = software.name.toLowerCase().includes(searchValue.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        (software.tags && selectedTags.some((tag) => software.tags?.includes(tag)));
      const matchesTagSearch = software.tags?.some((tag) =>
        tag.toLowerCase().includes(searchValue.toLowerCase())
      );
      return (matchesName || matchesTagSearch) && matchesTags;
    });
  }, [mySoftware, selectedTags, searchValue]);

  /**
   * Retrieves the applications recommended for the logged in user.
   *
   * @returns The list of recommended applications.
   */
  const recommendedApplications = useMemo(
    () =>
      software.filter(
        (app) => app.recommend?.includes(loggedUserId) && app.status === SoftwareStatus.ACCEPTED
      ),
    [software, loggedUserId]
  );

  /**
   * Retrieves unique tags from the filtered applications.
   *
   * @returns The list of unique tags.
   */
  const filteredTags = useMemo(() => {
    const tags = new Set<string>();
    filteredSoftware.forEach((app) => {
      app.tags?.forEach((tag) => {
        tags.add(tag);
      });
    });
    return Array.from(tags);
  }, [filteredSoftware]);

  /**
   * Fetches all software data.
   * This function retrieves the list of software applications from the API and updates the state.
   */
  const fetchSoftwareData = async () => {
    setLoading(true);
    try {
      const fetchedSoftware = await softwareApi.listSoftware();
      setApplications(fetchedSoftware);
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
      const app = software.find((app) => app.id === appId);

      if (app) {
        const isUserInApp = app.users?.includes(loggedUserId);

        const updatedApp: SoftwareRegistry = {
          ...app,
          users: isUserInApp ? app.users : [...(app.users || []), loggedUserId],
          recommend: app.recommend?.filter((id) => id !== loggedUserId)
        };

        await softwareApi.updateSoftwareById({ id: appId, softwareRegistry: updatedApp });

        setApplications((prevApps) => prevApps.map((a) => (a.id === appId ? updatedApp : a)));
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
    if (loggedUserId) {
      fetchSoftwareData();
    }
  }, []);

  const isListView = !isGridView;

  if (loading) {
    return (
      <Card
        sx={{
          p: "25%",
          display: "flex",
          justifyContent: "center",
          backgroundColor: theme.palette.background.paper
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

  return (
    <Container>
      <Grid container direction="column" alignItems="center" mt={4}>
        <Typography variant="h2" m={4}>
          {strings.softwareRegistry.applications}
        </Typography>
        {recommendedApplications.length > 0 && (
          <Grid item container justifyContent="center" alignItems="center" mb={4}>
            <Typography sx={{ fontWeight: 600, fontSize: 18, color: theme.palette.primary.main }}>
              {strings.softwareRegistry.recommendationMessage.replace(
                "{recommendationCount}",
                recommendedApplications.length.toString()
              )}
            </Typography>
            <IconButton
              onClick={scrollToRecommendations}
              sx={{
                color: theme.palette.primary.main,
                backgroundColor: "transparent",
                ":hover": {
                  backgroundColor: "transparent",
                  boxShadow: "none"
                }
              }}
            >
              <ArrowDownwardIcon />
            </IconButton>
          </Grid>
        )}
        <Grid item container justifyContent="space-between" alignItems="center">
          <Typography variant="h3">{strings.softwareRegistry.myApplications}</Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setIsModalOpen(true)}
            sx={{
              textTransform: "none",
              color: theme.palette.common.white,
              fontSize: "18px",
              borderRadius: "100px"
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
                backgroundColor: isGridView
                  ? theme.palette.primary.main
                  : theme.palette.background.paper,
                color: isGridView
                  ? theme.palette.getContrastText(theme.palette.primary.main)
                  : theme.palette.text.primary,
                borderRadius: "4px",
                padding: "6px",
                marginRight: "10px",
                ":hover": {
                  backgroundColor: theme.palette.primary.dark,
                  color: theme.palette.getContrastText(theme.palette.primary.dark)
                }
              }}
            >
              <GridViewIcon />
            </IconButton>
            <IconButton
              onClick={() => setIsGridView(false)}
              sx={{
                backgroundColor: isListView
                  ? theme.palette.primary.main
                  : theme.palette.background.paper,

                color: isListView
                  ? theme.palette.getContrastText(theme.palette.primary.main)
                  : theme.palette.text.primary,
                borderRadius: "4px",
                padding: "6px",
                ":hover": {
                  backgroundColor: theme.palette.primary.dark,
                  color: theme.palette.getContrastText(theme.palette.primary.dark)
                }
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
              filteredApplicationsCount={filteredSoftware.length}
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
                applications={showAll ? filteredSoftware : filteredSoftware.slice(0, 4)}
                isGridView={isGridView}
              />
            )}
            {filteredSoftware.length > 4 && (
              <Box textAlign="center" mt={3}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setShowAll(!showAll)}
                  sx={{
                    textTransform: "none",
                    fontSize: "18px",
                    borderRadius: "100px"
                  }}
                >
                  {showAll ? strings.softwareRegistry.showLess : strings.softwareRegistry.showMore}
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid container direction="column" alignItems="center" mt={4} ref={recommendationRef}>
        <Recommendations applications={recommendedApplications} onAddUser={handleUserUpdate} />
      </Grid>
      <AddSoftwareModal
        open={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        handleSave={createSoftware}
        disabled={loading}
        existingSoftwareList={software}
      />
      <BackButton styles={{ marginBottom: 2 }} />
    </Container>
  );
};

export default SoftwareScreen;
