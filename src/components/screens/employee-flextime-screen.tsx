import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { errorAtom } from "src/atoms/error";
import type { UserFlextime } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import BackButton from "../generics/back-button";

const EmployeeFlextimeScreen = () => {
  const { resourceAllocationsApi } = useLambdasApi();
  const [usersFlextime, setUsersFlextime] = useState<UserFlextime[]>([]);
  const [loading, setLoading] = useState(false);

  const setError = useSetAtom(errorAtom);
  const theme = useTheme();

  const currentDate = DateTime.now().toLocaleString(DateTime.DATE_SHORT);

  useEffect(() => {
    loadFlextimeData();
  }, []);

  const loadFlextimeData = async () => {
    if (!resourceAllocationsApi) {
      setError(strings.error.fetchFailedFlextime);
      return;
    }

    setLoading(true);

    try {
      const data = await resourceAllocationsApi.listUsersFlextime();
      setUsersFlextime(data);
    } catch (error: any) {
      const errorMessage = await error?.response?.json();
      setError(
        `${strings.error.fetchFailedFlextime}: ${errorMessage?.message || error}`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatFlextimeHours = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) {
      return strings.employeeFlextime.notAvailable;
    }

    const sign = hours >= 0 ? "+" : "";
    return `${sign}${hours.toFixed(2)}h`;
  };

  const getFlextimeColor = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) {
      return theme.palette.text.secondary;
    }

    return hours >= 0
      ? theme.palette.success.dark
      : theme.palette.error.main;
  };

  const totalBalance = usersFlextime.reduce(
    (sum, user) =>
      sum + (user.flextime?.totalFlextimeBalance ?? 0),
    0
  );

  const getInitials = (firstName?: string, lastName?: string): string => {
    return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`
      .toUpperCase();
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
          <Typography>
            {strings.employeeFlextime.loading}
          </Typography>
          <CircularProgress sx={{ mt: 2 }} />
        </Box>
      </Card>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 5,
        mb: 4,
        px: { xs: 2, md: 4 }
      }}
    >
      {/* Page title */}
      <Box
        sx={{
          textAlign: "center",
          mb: 3
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary
          }}
        >
          Employee balance
        </Typography>
      </Box>

      {/* Summary cards */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          mb: 2,
          flexWrap: "wrap"
        }}
      >
        <Card
          elevation={0}
          sx={{
            width: { xs: "100%", sm: 255 },
            backgroundColor: "#e4eff3",
            borderRadius: 2
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",
              py: 1.5,
              "&:last-child": { pb: 1.5 }
            }}
          >
            <Typography variant="body2">
              {strings.employeeFlextime.totalEmployees}
            </Typography>

            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mt: 0.5 }}
            >
              {usersFlextime.length}
            </Typography>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            width: { xs: "100%", sm: 255 },
            backgroundColor: "#e4eff3",
            borderRadius: 2
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",
              py: 1.5,
              "&:last-child": { pb: 1.5 }
            }}
          >
            <Typography variant="body2">
              {strings.employeeFlextime.combinedBalance}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mt: 0.5,
                color: getFlextimeColor(totalBalance)
              }}
            >
              {formatFlextimeHours(totalBalance)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Last updated */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          mb: 3,
          color: theme.palette.text.secondary
        }}
      >
        {strings.employeeFlextime.lastUpdated.replace(
          "{0}",
          currentDate
        )}
      </Typography>

      {usersFlextime.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center"
          }}
        >
          <Typography color="text.secondary">
            {strings.employeeFlextime.noDataFound}
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Filter button - visual only in phase 1 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 1.5
            }}
          >
            <Button
              type="button"
              variant="contained"
              disableElevation
              startIcon={<FilterListIcon />}
              sx={{
                minWidth: 42,
                width: 42,
                height: 42,
                backgroundColor: "#f9e5d9",
                color: "#333",
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#f2d6c5"
                },
                "& .MuiButton-startIcon": {
                  margin: 0
                }
              }}
              aria-label="Filter employees by status"
            />
          </Box>

          {/* Employee table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              backgroundColor: "transparent",
              overflowX: "auto"
            }}
          >
            <Table
              sx={{
                minWidth: 750,
                borderCollapse: "separate",
                borderSpacing: "0 0"
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#dedede",
                    "& .MuiTableCell-root": {
                      borderBottom: "none",
                      py: 1,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#333"
                    },
                    "& .MuiTableCell:first-of-type": {
                      borderTopLeftRadius: 7,
                      borderBottomLeftRadius: 7
                    },
                    "& .MuiTableCell:last-of-type": {
                      borderTopRightRadius: 7,
                      borderBottomRightRadius: 7
                    }
                  }}
                >
                  <TableCell>
                    {strings.employeeFlextime.employee}
                  </TableCell>

                  <TableCell>
                    {strings.employeeFlextime.email}
                  </TableCell>

                  <TableCell align="right">
                    {strings.employeeFlextime.totalFlextimeBalance}
                  </TableCell>

                  <TableCell align="right">
                    {strings.employeeFlextime.currentMonthBalance}
                  </TableCell>

                  <TableCell align="center">
                    {strings.employeeFlextime.status}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {[...usersFlextime]
                  .sort((a, b) =>
                    `${a.user.lastName} ${a.user.firstName}`.localeCompare(
                      `${b.user.lastName} ${b.user.firstName}`
                    )
                  )
                  .map((userData, index) => {
                    const isActive =
                      Boolean(userData.user.attributes?.isActive);

                    return (
                      <TableRow
                        key={
                          userData.user.attributes?.severaUserId || index
                        }
                        hover
                        sx={{
                          "& .MuiTableCell-root": {
                            py: 1.2,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            fontSize: 12
                          },
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        {/* Employee name and avatar */}
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 23,
                                height: 23,
                                fontSize: 10,
                                fontWeight: 600,
                                backgroundColor: "#006b80"
                              }}
                            >
                              {getInitials(
                                userData.user.firstName,
                                userData.user.lastName
                              )}
                            </Avatar>

                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 12,
                                whiteSpace: "nowrap"
                              }}
                            >
                              {userData.user.firstName}{" "}
                              {userData.user.lastName}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Email */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: 12,
                              whiteSpace: "nowrap"
                            }}
                          >
                            {userData.user.email ||
                              strings.employeeFlextime.notAvailable}
                          </Typography>
                        </TableCell>

                        {/* Total balance */}
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: getFlextimeColor(
                                userData.flextime?.totalFlextimeBalance
                              )
                            }}
                          >
                            {formatFlextimeHours(
                              userData.flextime?.totalFlextimeBalance
                            )}
                          </Typography>
                        </TableCell>

                        {/* Current month balance */}
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: getFlextimeColor(
                                userData.flextime?.monthFlextimeBalance
                              )
                            }}
                          >
                            {formatFlextimeHours(
                              userData.flextime?.monthFlextimeBalance
                            )}
                          </Typography>
                        </TableCell>

                        {/* Status - visual only in phase 1 */}
                        <TableCell align="center">
                          <Button
                            type="button"
                            variant="outlined"
                            size="small"
                            endIcon={<KeyboardArrowDownIcon />}
                            sx={{
                              minWidth: 95,
                              height: 29,
                              px: 1,
                              py: 0,
                              borderRadius: 1.5,
                              borderColor: "#ccc",
                              color: isActive ? "#167b28" : "#999",
                              fontSize: 11,
                              fontWeight: 400,
                              textTransform: "none",
                              backgroundColor: "#fff",
                              "&:hover": {
                                borderColor: "#aaa",
                                backgroundColor: "#fafafa"
                              },
                              "& .MuiButton-endIcon": {
                                marginLeft: 0.5
                              }
                            }}
                          >
                            {isActive
                              ? strings.employeeFlextime.active
                              : strings.employeeFlextime.inactive}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })} 
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <BackButton styles={{ mt: 3, mb: 2 }} />
    </Container>
  );
};

export default EmployeeFlextimeScreen;