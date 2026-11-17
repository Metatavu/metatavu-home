import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useTheme
} from "@mui/material";
import { useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { errorAtom } from "src/atoms/error";
import AppCheckbox from "src/components/generics/appCheckbox";
import AppOverlay from "src/components/generics/appOverlay";
import AppButton from "src/components/generics/buttons/app-button";
import type { UserFlextime } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";

type StatusFilter = "all" | "active" | "inactive";
type SortKey = "name" | "totalBalance" | "monthBalance";
type SortDirection = "asc" | "desc";

const EmployeeFlextimeScreen = () => {
  const { resourceAllocationsApi } = useLambdasApi();
  const [usersFlextime, setUsersFlextime] = useState<UserFlextime[]>([]);
  const [loading, setLoading] = useState(false);

  const [openFilter, setOpenFilter] = useState(false);
  const [dropdown, setDropdown] = useState<string[]>(["Status"]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [chosenStatusFilters, setChosenStatusFilters] = useState<StatusFilter[]>(["all"]);

  const handleDropdown = (category: string) => {
    setDropdown((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category]
    );
  };

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setChosenStatusFilters((previous) => {
      // Clicking All toggles between selecting everything and nothing
      if (filter === "all") {
        return previous.includes("all") ? [] : ["all"];
      }

      // If All was selected, selecting an individual filter
      // removes All and selects only that filter
      if (previous.includes("all")) {
        return [filter];
      }

      // Otherwise, toggle the individual filter
      return previous.includes(filter)
        ? previous.filter((item) => item !== filter)
        : [...previous, filter];
    });
  };

  const handleClearFilters = () => {
    setChosenStatusFilters(["all"]);
  };

  const handleApplyFilters = () => {
    if (
      chosenStatusFilters.includes("all") ||
      (chosenStatusFilters.includes("active") && chosenStatusFilters.includes("inactive")) ||
      chosenStatusFilters.length === 0
    ) {
      setStatusFilter("all");
    } else {
      setStatusFilter(chosenStatusFilters[0]);
    }

    setOpenFilter(false);
  };

  const handleCancel = () => {
    setChosenStatusFilters(statusFilter === "all" ? ["all"] : [statusFilter]);
    setOpenFilter(false);
  };

  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
      setError(`${strings.error.fetchFailedFlextime}: ${errorMessage?.message || error}`);
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

    return hours >= 0 ? theme.palette.success.dark : theme.palette.error.main;
  };

  const getInitials = (firstName?: string, lastName?: string): string => {
    return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();
  };

  const totalBalance = usersFlextime.reduce(
    (sum, user) => sum + (user.flextime?.totalFlextimeBalance ?? 0),
    0
  );

  const filteredAndSortedUsers = useMemo(() => {
    const filteredUsers = usersFlextime.filter((userData) => {
      const isActive = Boolean(userData.user.attributes?.isActive);

      if (statusFilter === "active") {
        return isActive;
      }

      if (statusFilter === "inactive") {
        return !isActive;
      }

      return true;
    });

    return [...filteredUsers].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case "name": {
          const nameA = `${a.user.lastName ?? ""} ${a.user.firstName ?? ""}`;
          const nameB = `${b.user.lastName ?? ""} ${b.user.firstName ?? ""}`;

          comparison = nameA.localeCompare(nameB);
          break;
        }

        case "totalBalance": {
          const balanceA = a.flextime?.totalFlextimeBalance ?? 0;
          const balanceB = b.flextime?.totalFlextimeBalance ?? 0;

          comparison = balanceA - balanceB;
          break;
        }

        case "monthBalance": {
          const balanceA = a.flextime?.monthFlextimeBalance ?? 0;
          const balanceB = b.flextime?.monthFlextimeBalance ?? 0;

          comparison = balanceA - balanceB;
          break;
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [usersFlextime, statusFilter, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleStatusMenuClose = () => {
    setStatusAnchor(null);
  };

  const renderSortLabel = (label: string, key: SortKey, align: "left" | "right" = "left") => (
    <TableSortLabel
      active={sortKey === key}
      direction={sortKey === key ? sortDirection : "asc"}
      onClick={() => handleSort(key)}
      sx={{
        color: "#333 !important",
        fontSize: 13,
        fontWeight: 600,
        justifyContent: align === "right" ? "flex-end" : "flex-start",
        "& .MuiTableSortLabel-icon": {
          color: "#333 !important"
        }
      }}
    >
      {label}
    </TableSortLabel>
  );

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
          <Typography>{strings.employeeFlextime.loading}</Typography>
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
            <Typography variant="body2">{strings.employeeFlextime.totalEmployees}</Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
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
            <Typography variant="body2">{strings.employeeFlextime.combinedBalance}</Typography>

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
        {strings.employeeFlextime.lastUpdated.replace("{0}", currentDate)}
      </Typography>

      {usersFlextime.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center"
          }}
        >
          <Typography color="text.secondary">{strings.employeeFlextime.noDataFound}</Typography>
        </Paper>
      ) : (
        <>
          {/* Status filter */}
          <AppOverlay open={openFilter} onClose={handleCancel} title="Filters">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: { xs: "100%", sm: 470 },
                maxWidth: "100%"
              }}
            >
              {/* Status category */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    cursor: "pointer"
                  }}
                  onClick={() => handleDropdown("Status")}
                >
                  <KeyboardArrowDown
                    sx={{
                      rotate: dropdown.includes("Status") ? "180deg" : "none"
                    }}
                  />

                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Status
                  </Typography>
                </Box>

                {dropdown.includes("Status") && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      pl: 2
                    }}
                  >
                    <AppCheckbox
                      checked={chosenStatusFilters.includes("all")}
                      label="All"
                      disabled={false}
                      onChange={() => handleStatusFilterChange("all")}
                      ariaLabel="All employees"
                    />

                    <AppCheckbox
                      checked={
                        chosenStatusFilters.includes("all") ||
                        chosenStatusFilters.includes("active")
                      }
                      label={strings.employeeFlextime.active}
                      disabled={false}
                      onChange={() => handleStatusFilterChange("active")}
                      ariaLabel="Active employees"
                    />

                    <AppCheckbox
                      checked={
                        chosenStatusFilters.includes("all") ||
                        chosenStatusFilters.includes("inactive")
                      }
                      label={strings.employeeFlextime.inactive}
                      disabled={false}
                      onChange={() => handleStatusFilterChange("inactive")}
                      ariaLabel="Inactive employees"
                    />
                  </Box>
                )}
              </Box>

              {/* Actions */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2
                }}
              >
                <AppButton
                  variant="secondary"
                  text="Clear all"
                  onClick={handleClearFilters}
                  sx={{
                    width: "max-content"
                  }}
                />

                <AppButton
                  variant="primary"
                  text="Apply"
                  onClick={handleApplyFilters}
                  sx={{
                    width: "max-content"
                  }}
                />
              </Box>
            </Box>
          </AppOverlay>

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
              onClick={() => setOpenFilter(true)}
              disabled={openFilter}
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
                    {renderSortLabel(strings.employeeFlextime.employee, "name")}
                  </TableCell>

                  <TableCell>{strings.employeeFlextime.email}</TableCell>

                  <TableCell align="right">
                    {renderSortLabel(
                      strings.employeeFlextime.totalFlextimeBalance,
                      "totalBalance",
                      "right"
                    )}
                  </TableCell>

                  <TableCell align="right">
                    {renderSortLabel(
                      strings.employeeFlextime.currentMonthBalance,
                      "monthBalance",
                      "right"
                    )}
                  </TableCell>

                  <TableCell align="center">{strings.employeeFlextime.status}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredAndSortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No employees found for this filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedUsers.map((userData, index) => {
                    const isActive = Boolean(userData.user.attributes?.isActive);

                    return (
                      <TableRow
                        key={userData.user.attributes?.severaUserId || index}
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
                              {getInitials(userData.user.firstName, userData.user.lastName)}
                            </Avatar>

                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 12,
                                whiteSpace: "nowrap"
                              }}
                            >
                              {userData.user.firstName} {userData.user.lastName}
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
                            {userData.user.email || strings.employeeFlextime.notAvailable}
                          </Typography>
                        </TableCell>

                        {/* Total balance */}
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: getFlextimeColor(userData.flextime?.totalFlextimeBalance)
                            }}
                          >
                            {formatFlextimeHours(userData.flextime?.totalFlextimeBalance)}
                          </Typography>
                        </TableCell>

                        {/* Current month balance */}
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: getFlextimeColor(userData.flextime?.monthFlextimeBalance)
                            }}
                          >
                            {formatFlextimeHours(userData.flextime?.monthFlextimeBalance)}
                          </Typography>
                        </TableCell>

                        {/* Status dropdown - temporary, no status changes */}
                        <TableCell align="center">
                          <Button
                            type="button"
                            variant="outlined"
                            size="small"
                            endIcon={<KeyboardArrowDownIcon />}
                            onClick={(event) => setStatusAnchor(event.currentTarget)}
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

                          <Menu
                            anchorEl={statusAnchor}
                            open={Boolean(statusAnchor)}
                            onClose={handleStatusMenuClose}
                          >
                            <MenuItem onClick={handleStatusMenuClose}>
                              {strings.employeeFlextime.active}
                            </MenuItem>

                            <MenuItem onClick={handleStatusMenuClose}>
                              {strings.employeeFlextime.inactive}
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default EmployeeFlextimeScreen;
