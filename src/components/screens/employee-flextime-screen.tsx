import {
	Box,
	Card,
	CardContent,
	CircularProgress,
	Container,
	MenuItem,
	Paper,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	useTheme,
} from "@mui/material";
import { useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { errorAtom } from "src/atoms/error";
import type { UserFlextime } from "src/generated/homeLambdasClient";
import { useLambdasApi } from "src/hooks/use-api";
import strings from "src/localization/strings";
import BackButton from "../generics/back-button";

const getUserId = (user: UserFlextime["user"]): string | undefined => {
	return (user as any).id;
};
/**
 * Full-screen view for displaying flextime data for all employees.
 */
const EmployeeFlextimeScreen = () => {
	const { usersApi, resourceAllocationsApi } = useLambdasApi();
	const [usersFlextime, setUsersFlextime] = useState<UserFlextime[]>([]);
	const [loading, setLoading] = useState(false);
	const setError = useSetAtom(errorAtom);
	const currentDate = DateTime.now().toLocaleString(DateTime.DATE_FULL);
	const theme = useTheme();

	useEffect(() => {
		loadFlextimeData();
	}, []);

	/**
	 * Loads flextime data from the backend and handles loading/error state.
	 */
	const loadFlextimeData = async () => {
		if (!resourceAllocationsApi) {
			setError(strings.error.fetchFailedFlextime);
			return;
		}

		setLoading(true);

		try {
			const data = await resourceAllocationsApi.listUsersFlextime();
			setUsersFlextime(data);
		} catch (err) {
			setError(`${strings.error.fetchFailedFlextime}, ${err}`);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusChange = async (userId: string, active: boolean) => {
		try {
			if (!usersApi) return;
			await usersApi.updateUserStatus({
				userId,
				updateUserStatusRequest: {
					isActive: active,
				},
			});
			setUsersFlextime((prev) =>
				prev.map((u) =>
					getUserId(u.user) === userId
						? {
								...u,
								user: {
									...u.user,
									attributes: {
										...u.user.attributes,
										isActive: active,
									},
								},
							}
						: u,
				),
			);
		} catch {
			setError("Failed to update user status");
			loadFlextimeData();
		}
	};
	/**
	 * @returns A string representation of the formatted balance.
	 */

	const formatFlextimeHours = (hours: number | null | undefined): string => {
		if (hours === null || hours === undefined)
			return strings.employeeFlextime.notAvailable;
		const sign = hours >= 0 ? "+" : "";
		return `${sign}${hours.toFixed(2)}h`;
	};

	/**
	 * Determines the color to use for a flextime balance value.
	 * @param hours - The flextime balance.
	 * @returns A string hex color.
	 */
	const getFlextimeColor = (hours: number | null | undefined): string => {
		if (hours === null || hours === undefined)
			return theme.palette.text.secondary;
		return hours >= 0 ? theme.palette.success.main : theme.palette.error.main;
	};

	/**
	 * Calculates the total flextime balance of all users.
	 * @returns The numeric total balance.
	 */
	const getTotalBalance = (): number => {
		return usersFlextime.reduce(
			(sum, user) => sum + (user.flextime?.totalFlextimeBalance || 0),
			0,
		);
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
					<Typography>{strings.employeeFlextime.loading}</Typography>
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
							<TableRow sx={{ backgroundColor: theme.palette.action.selected }}>
								<TableCell>
									<Typography variant="h6" fontWeight="bold">
										{strings.employeeFlextime.employee}
									</Typography>
								</TableCell>
								<TableCell>
									<Typography variant="h6" fontWeight="bold">
										{strings.employeeFlextime.email}
									</Typography>
								</TableCell>
								<TableCell align="right">
									<Typography variant="h6" fontWeight="bold">
										{strings.employeeFlextime.totalFlextimeBalance}
									</Typography>
								</TableCell>
								<TableCell align="right">
									<Typography variant="h6" fontWeight="bold">
										{strings.employeeFlextime.currentMonthBalance}
									</Typography>
								</TableCell>
								<TableCell align="center">
									<Typography variant="h6" fontWeight="bold">
										{strings.employeeFlextime.status}
									</Typography>
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{usersFlextime
								.sort((a, b) =>
									`${a.user.lastName} ${a.user.firstName}`.localeCompare(
										`${b.user.lastName} ${b.user.firstName}`,
									),
								)
								.map((userData, index) => {
									const isActive = userData.user.attributes?.isActive !== false;
									return (
										<TableRow
											key={userData.user.attributes?.severaUserId || index}
											hover
											sx={{
												backgroundColor:
													index % 2 === 0
														? theme.palette.background.default
														: theme.palette.background.paper,
												borderBottom: `3px solid ${theme.palette.divider}`,
											}}
										>
											<TableCell>
												<Box>
													<Typography variant="body1" fontWeight="medium">
														{userData.user.firstName} {userData.user.lastName}
													</Typography>
												</Box>
											</TableCell>

											<TableCell>
												<Typography variant="body2">
													{userData.user.email ||
														strings.employeeFlextime.notAvailable}
												</Typography>
											</TableCell>

											<TableCell align="right">
												<Typography
													variant="h6"
													sx={{
														color: getFlextimeColor(
															userData.flextime?.totalFlextimeBalance,
														),
														fontWeight: "bold",
													}}
												>
													{formatFlextimeHours(
														userData.flextime?.totalFlextimeBalance,
													)}
												</Typography>
											</TableCell>
											<TableCell align="right">
												<Typography
													variant="h6"
													sx={{
														color: getFlextimeColor(
															userData.flextime?.monthFlextimeBalance,
														),
														fontWeight: "bold",
													}}
												>
													{formatFlextimeHours(
														userData.flextime?.monthFlextimeBalance,
													)}
												</Typography>
											</TableCell>
											<TableCell align="center">
												<Select
													value={isActive ? "active" : "inactive"}
													onChange={(e) => {
														const userId = getUserId(userData.user);
														if (!userId) return;

														handleStatusChange(
															userId,
															e.target.value === "active",
														);
													}}
													size="small"
													sx={{
														minWidth: 120,
														"& .MuiSelect-select": {
															color: isActive
																? theme.palette.success.main
																: theme.palette.text.disabled,
														},
													}}
												>
													<MenuItem value="active">
														{strings.employeeFlextime.active}
													</MenuItem>
													<MenuItem value="inactive">
														{strings.employeeFlextime.inactive}
													</MenuItem>
												</Select>
											</TableCell>
										</TableRow>
									);
								})}
						</TableBody>
					</Table>
				</TableContainer>
			)}
			<BackButton styles={{ mt: 3, mb: 2 }} />
		</Container>
	);
};

export default EmployeeFlextimeScreen;
