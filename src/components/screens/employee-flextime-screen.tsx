import React, { useState, useEffect } from "react";
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

interface UserFlextimeData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    attributes: {
      severaUserId: string;
      isActive: boolean;
    };
  };
  flextime: {
    totalFlextimeBalance: number;
    monthFlextimeBalance: number;
  };
}

/**
 * Fetch users with their flextime data for opted-in users
 */
const fetchUsersFlextime = async (keywordId: string = "isSeveraOptIn"): Promise<UserFlextimeData[]> => {
  try {
    const response = await fetch(`http://localhost:3000/users/flextime?keywordId=${encodeURIComponent(keywordId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: UserFlextimeData[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch users flextime:", error);
    throw new Error("Failed to load employee time data");
  }
};

/**
 * Full-screen component for displaying employee flextime data in a dedicated tab
 */
const EmployeeFlextimeScreen: React.FC = () => {
  const [usersFlextime, setUsersFlextime] = useState<UserFlextimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentDate = DateTime.now().toLocaleString(DateTime.DATE_FULL);

  useEffect(() => {
    loadFlextimeData();
  }, []);

  const loadFlextimeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsersFlextime("isSeveraOptIn");
      setUsersFlextime(data);
    } catch (err) {
      setError("Failed to load employee time data");
    } finally {
      setLoading(false);
    }
  };

  const formatFlextimeHours = (hours: number | null): string => {
    if (hours === null || hours === undefined) return "N/A";
    const sign = hours >= 0 ? "+" : "";
    return `${sign}${hours.toFixed(2)}h`;
  };

  const getFlextimeColor = (hours: number | null): string => {
    if (hours === null || hours === undefined) return "#666";
    return hours >= 0 ? "#4caf50" : "#f44336";
  };

  const getTotalBalance = () => {
    return usersFlextime.reduce((sum, user) => sum + (user.flextime.totalFlextimeBalance || 0), 0);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading employee time data...
          </Typography>
        </Box>
      </Container>
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
          Employee Time Totals and Balances
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Overview of flextime balances for all opted-in employees
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Last updated: {currentDate}
        </Typography>
      </Box>

      <Box mb={4} display="flex" gap={2}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              Total Employees
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {usersFlextime.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              Combined Balance
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
              No employee time data found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell>
                  <Typography variant="h6" fontWeight="bold">Employee</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" fontWeight="bold">Email</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight="bold">Total Flextime Balance</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" fontWeight="bold">Current Month Balance</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6" fontWeight="bold">Status</Typography>
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
                        ID: {userData.user.attributes.severaUserId}
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
                        color: getFlextimeColor(userData.flextime.totalFlextimeBalance),
                        fontWeight: "bold"
                      }}
                    >
                      {formatFlextimeHours(userData.flextime.totalFlextimeBalance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="h6"
                      sx={{ 
                        color: getFlextimeColor(userData.flextime.monthFlextimeBalance),
                        fontWeight: "bold"
                      }}
                    >
                      {formatFlextimeHours(userData.flextime.monthFlextimeBalance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={userData.user.attributes?.isActive ? "Active" : "Inactive"}
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