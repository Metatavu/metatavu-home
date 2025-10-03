import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Chip
} from "@mui/material";
import { DateTime } from "luxon";
import { useLambdasApi } from "src/hooks/use-api";
import type { UserFlextime } from "src/generated/homeLambdasClient";
import strings from "src/localization/en.json";

/**
 * Full-screen view for displaying flextime data for all employees.
 * @returns A React functional component rendering the employee flextime screen.
 */
const EmployeeFlextimeScreen: () => JSX.Element = () => {
  const { resourceAllocationsApi } = useLambdasApi();
  const [usersFlextime, setUsersFlextime] = useState<UserFlextime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentDate = DateTime.now().toLocaleString(DateTime.DATE_FULL);

  useEffect(() => {
    loadFlextimeData();
  }, []);

  /**
   * Loads flextime data from the backend and handles loading/error state.
   */
  const loadFlextimeData = async () => {
    if (!resourceAllocationsApi) {
      setError(strings.error.missingEmailOrId);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await resourceAllocationsApi.listUsersFlextime();
      setUsersFlextime(data);
    } catch (err) {
      console.error(err);
      setError(strings.error.fetchFailedFlextime);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formats a flextime balance in hours with appropriate sign.
   * @param hours - The number of hours.
   * @returns A string representation of the formatted balance.
   */
  const formatFlextimeHours = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) return "N/A";
    const sign = hours >= 0 ? "+" : "";
    return `${sign}${hours.toFixed(2)}h`;
  };

  /**
   * Determines the color to use for a flextime balance value.
   * @param hours - The flextime balance.
   * @returns A string hex color.
   */
  const getFlextimeColor = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) return "#666";
    return hours >= 0 ? "#4caf50" : "#f44336";
  };

  /**
   * Calculates the total flextime balance of all users.
   * @returns The numeric total balance.
   */
  const getTotalBalance = (): number => {
    return usersFlextime.reduce((sum, user) => sum + (user.flextime?.totalFlextimeBalance || 0), 0);
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
          <Typography>{strings.employeeFlextime.loading}</Typography>
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography color="error" variant="h6" textAlign="center">
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          {strings.employeeFlextime.title}
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {strings.employeeFlextime.subtitle}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {strings.employeeFlextime.lastUpdated.replace("{0}", currentDate)}
        </Typography>
      </Box>
      <Box mb={4} display="flex" gap={2}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {strings.employeeFlextime.totalEmployees}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {usersFlextime.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {strings.employeeFlextime.combinedBalance}
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{ color: getFlextimeColor(getTotalBalance()) }}
            >
              {formatFlextimeHours(getTotalBalance())}
            </Typography>
          </CardContent>
        </Card>
      </Box>
      {usersFlextime.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" textAlign="center" color="textSecondary">
              {strings.employeeFlextime.noDataFound}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell>
                  <Typography variant="h6" fontWeight="bold">{strings.employeeFlextime.employee}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" fontWeight="bold">{strings.employeeFlextime.email}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight="bold">{strings.employeeFlextime.totalFlextimeBalance}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight="bold">{strings.employeeFlextime.currentMonthBalance}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6" fontWeight="bold">{strings.employeeFlextime.status}</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersFlextime
                .sort((a, b) => `${a.user.lastName} ${a.user.firstName}`.localeCompare(`${b.user.lastName} ${b.user.firstName}`))
                .map((userData, index) => (
                <TableRow 
                  key={userData.user.id} 
                  hover
                  sx={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "white" }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {userData.user.firstName} {userData.user.lastName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {userData.user.id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {userData.user.email || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: getFlextimeColor(userData.flextime?.totalFlextimeBalance),
                        fontWeight: "bold"
                      }}
                    >
                      {formatFlextimeHours(userData.flextime?.totalFlextimeBalance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="h6"
                      sx={{ 
                        color: getFlextimeColor(userData.flextime?.monthFlextimeBalance),
                        fontWeight: "bold"
                      }}
                    >
                      {formatFlextimeHours(userData.flextime?.monthFlextimeBalance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={userData.user.attributes?.isActive ? strings.employeeFlextime.active : strings.employeeFlextime.inactive}
                      color={userData.user.attributes?.isActive ? "success" : "warning"}
                      variant="filled"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default EmployeeFlextimeScreen;