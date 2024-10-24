import { Card, CardContent, Typography, Skeleton, Grid, CardMedia } from "@mui/material";
import { Link } from "react-router-dom";
import strings from "../../localization/strings";
import UserRoleUtils from "../../utils/user-role-utils";
import { useMemo, useState } from "react";
import { useLambdasApi } from "src/hooks/use-api";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { errorAtom } from "src/atoms/error";
import { softwareAtom } from "src/atoms/software";
import { authAtom } from "src/atoms/auth";

/**
 * SoftwareRegistry card component
 */
const SoftwareRegistryCard = () => {
  const adminMode = UserRoleUtils.adminMode();
  const { softwareApi } = useLambdasApi();
  const auth = useAtomValue(authAtom);
  const loggedUserId = auth?.token?.sub ?? "";
  const setError = useSetAtom(errorAtom);
  const [applications, setApplications] = useAtom(softwareAtom);

  const [loading, setLoading] = useState(false);

  const fetchSoftware = async () => {
    setLoading(true);
    try {
      const fetchedApplications = await softwareApi.listSoftware();
      setApplications(fetchedApplications);
    } catch (error) {
      setError(`Error fetching software data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useMemo(() => {
    fetchSoftware();
  }, []);

  /**
   * Filter pending software (admin mode) or recommended software (user mode)
   */
  const pendingSoftware = useMemo(() => {
    return applications.filter((app) => app.status === "PENDING");
  }, [applications]);

  const recommendedSoftware = useMemo(() => {
    return applications.filter((app) => app.recommend?.includes(loggedUserId));
  }, [applications]);

  /**
   * Render the card content, showing different details based on admin/user mode
   */
  const renderSoftwareDetails = () => {
    if (loading) {
      return (
        <Grid item container xs={12}>
          <Skeleton
            width="100%"
          />
        </Grid>
      );
    }

    return (
      <>
        {!adminMode && recommendedSoftware.length > 0 && (
          <>
            <Typography fontWeight="bold" gutterBottom>
              {strings.softwareRegistry.recommendations}
            </Typography>
            <Grid display="flex" container alignItems="center" m={1}>
              {recommendedSoftware.map((app) => (
                <Grid item key={app.id}>
                  <CardMedia
                    component="img"
                    height="60"
                    image={app.image}
                    alt={app.name}
                    sx={{
                      width: "60px",
                      objectFit: "contain",
                      margin: "6px",
                      borderRadius: "8px",
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {adminMode && pendingSoftware.length > 0 && (
          <>
            <Typography fontWeight="bold" gutterBottom>
              {strings.softwareRegistry.newSoftware}
            </Typography>
            <Grid display="flex" container alignItems="center" m={1}>
              {pendingSoftware.map((app) => (
                <Grid item key={app.id}>
                  <CardMedia
                    component="img"
                    height="60"
                    image={app.image}
                    alt={app.name}
                    sx={{
                      width: "60px",
                      objectFit: "contain",
                      margin: "6px",
                      borderRadius: "8px",
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </>
    );
  };

  return (
    <Link
      to={adminMode ? "/admin/allsoftware" : "/softwareregistry"}
      style={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          "&:hover": {
            background: "#efefef",
          },
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={"bold"} style={{ marginTop: 6, marginBottom: 3 }}>
            {adminMode
              ? strings.softwareRegistry.softwareRegistryAdmin
              : strings.softwareRegistry.softwareRegistry}
          </Typography>
          <Grid container>
            {renderSoftwareDetails()}
          </Grid>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SoftwareRegistryCard;
