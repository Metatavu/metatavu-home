import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Button, Grid, IconButton, Typography, useTheme } from "@mui/material";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SoftwareRegistry } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import RecommendCard from "./cards/recommendCard";

/**
 * Recommendations component props.
 */
interface RecommendationsProps {
  applications: SoftwareRegistry[];
  onAddUser: (appId: string) => Promise<void>;
}

/**
 * Recommendations component.
 *
 * This component renders a list of recommended software for the user, displayed in a carousel format.
 * Each application is displayed as a card, and user can add an application to their list.
 *
 * @param RecommendationsProps the props for the Recommendations component.
 * @returns The rendered Recommendations component.
 */
const Recommendations = ({ applications, onAddUser }: RecommendationsProps) => {
  const swiperRef = useRef<any>(null); // Reference to Swiper
  const navigate = useNavigate();
  const { usersApi } = useLambdasApi();
  const theme = useTheme();

  // Combined state for app loading and user name loading
  const [loadingStates, setLoadingStates] = useState<{
    appId: string | null;
    users: { [key: string]: boolean };
  }>({ appId: null, users: {} });

  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  /**
   * Scroll the carousel to the left.
   */
  const handleScrollLeft = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  /**
   * Scroll the carousel to the right.
   */
  const handleScrollRight = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  /**
   * Fetch the user's name by user id.
   *
   * @param {string | undefined} userId - The id of the user whose name should be fetched.
   */
  const fetchUserName = async (userId: string | undefined) => {
    if (!userId || userNames[userId] || loadingStates.users[userId]) {
      return;
    }

    setLoadingStates((prev) => ({
      ...prev,
      users: { ...prev.users, [userId]: true }
    }));

    try {
      const users = await usersApi.listUsers();
      const user = users.find((user) => user.id === userId);

      if (user) {
        setUserNames((prev) => ({
          ...prev,
          [userId]: `${user.firstName} ${user.lastName}`
        }));
      } else {
        console.warn(`User with ID ${userId} not found`);
      }
    } catch (error) {
      const errorMessage = await (error as any)?.response?.json();
      console.error(
        `${strings.softwareRegistry.recommendationsFetchUserFailed}: ${errorMessage?.message || error}`
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        users: { ...prev.users, [userId]: false }
      }));
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: { xs: "26px", sm: "40px 50px" },
        boxSizing: "border-box",
        gap: { xs: "15px", sm: "30px" },
        textAlign: "left",
        fontSize: { xs: "18px", sm: "30px" },
        color: theme.palette.text.primary,
        fontFamily: "Poppins",
        marginBottom: "30px"
      }}
    >
      <Typography variant="h3" sx={{ alignSelf: "flex-start", fontWeight: "bold", mb: 2 }}>
        {strings.softwareRegistry.recommendations}
      </Typography>

      {applications.length > 0 ? (
        <Grid container sx={{ position: "relative", alignItems: "center" }}>
          <IconButton
            onClick={handleScrollLeft}
            sx={{
              backgroundColor: theme.palette.primary.main,
              marginLeft: "4px",
              color: theme.palette.getContrastText(theme.palette.primary.main),
              position: "absolute",
              left: "-50px",
              zIndex: 1,
              top: "50%",
              transform: "translateY(-50%)",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Swiper ref={swiperRef} spaceBetween={60} slidesPerView="auto">
            {applications.map((app) => (
              <SwiperSlide key={app.id} style={{ width: "260px" }}>
                <RecommendCard
                  app={app}
                  onAddUser={onAddUser}
                  fetchUserName={fetchUserName}
                  userNames={userNames}
                  loadingUsers={loadingStates.users}
                  loadingAppId={loadingStates.appId}
                  setLoadingAppId={setLoadingStates}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <IconButton
            onClick={handleScrollRight}
            sx={{
              backgroundColor: theme.palette.primary.main,
              marginRight: "4px",
              color: theme.palette.getContrastText(theme.palette.primary.main),
              position: "absolute",
              right: "-50px",
              zIndex: 1,
              top: "50%",
              transform: "translateY(-50%)",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Grid>
      ) : (
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, mt: 3 }}>
          {strings.softwareRegistry.noRecommendations}
        </Typography>
      )}
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/softwareregistry/allsoftware")}
          sx={{
            textTransform: "none",
            color: theme.palette.getContrastText(theme.palette.secondary.main),
            backgroundColor: theme.palette.secondary.main,
            fontSize: "18px",
            borderRadius: "25px",
            "&:hover": { background: theme.palette.secondary.dark }
          }}
        >
          {strings.softwareRegistry.allApplications}
        </Button>
      </Box>
    </Box>
  );
};

export default Recommendations;
