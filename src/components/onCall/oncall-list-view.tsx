import { CancelOutlined, CheckCircleOutline } from "@mui/icons-material";
import { alpha, Box, Button, Checkbox, Typography, useTheme } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useAtomValue, useSetAtom } from "jotai";
import { DateTime } from "luxon";
import { userProfileAtom } from "src/atoms/auth";
import { errorAtom } from "src/atoms/error";
import useUserRole from "src/hooks/use-user-role";
import strings from "src/localization/strings";
import { customTheme } from "src/theme";
import { formatUsername } from "src/utils/oncall-utils";
import { onCallAtom } from "../../atoms/oncall";

/**
 * Component properties
 */
interface Props {
  selectedDate: DateTime;
  setSelectedDate: (date: DateTime) => void;
  updatePaidStatus: (year: number, week: number, paid: boolean) => Promise<void>;
}

/**
 * On call list view component
 *
 * @param props component properties
 */
const OnCallListView = ({ selectedDate, setSelectedDate, updatePaidStatus }: Props) => {
  const onCallData = useAtomValue(onCallAtom);
  const { isAccountant } = useUserRole();
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInEmail = userProfile?.email;
  const setError = useSetAtom(errorAtom);
  const theme = useTheme();

  /**
   * Identify rows that belong to the logged in user
   * @param email - On call user's email
   * @returns 'true' if email matches logged in users email.
   */
  const isLoggedInUser = (email: string) => {
    return loggedInEmail && email && loggedInEmail.toLowerCase() === email.toLowerCase();
  };

  /**
   * Handle checkbox change for paid status
   * Make API call to update status and update local state on success
   *
   * @param week - Week number
   * @param currentPaid - Current paid status
   */
  const handleCheckboxChange = async (week: number, currentPaid: boolean) => {
    try {
      await updatePaidStatus(selectedDate.year, week, currentPaid);
    } catch {
      setError(strings.oncall.errorUpdatingPaidStatus);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "week",
      headerName: strings.timeExpressions.week,
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: true,
      renderCell: (params) => (
        <Typography sx={{ color: theme.palette.text.primary }}>{params.value}</Typography>
      )
    },
    {
      field: "person",
      headerName: strings.vacationRequest.person,
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: true,
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: isLoggedInUser(params.row.email) ? "bold" : "normal",
            border: isLoggedInUser(params.row.email)
              ? `2px solid ${theme.palette.primary.main}`
              : "none",
            borderRadius: 2,
            px: 1,
            color: theme.palette.text.primary
          }}
        >
          {formatUsername(params.value)}
        </Typography>
      )
    },
    {
      field: "email",
      headerName: strings.userTable.email,
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: true,
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: isLoggedInUser(params.value) ? "bold" : "normal",
            color: theme.palette.text.primary
          }}
        >
          {params.value}
        </Typography>
      )
    },
    {
      field: "paid",
      headerName: strings.oncall.paid,
      headerAlign: "center",
      align: "center",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        if (isAccountant) {
          return (
            <Checkbox
              onClick={(e) => e.stopPropagation()}
              onChange={() => handleCheckboxChange(params.row.week, params.value)}
              checked={params.value}
              sx={{
                "&.Mui-checked": {
                  color: alpha(customTheme(theme).colors.paidGreen, 0.8)
                },
                "&:not(.Mui-checked)": {
                  color: alpha(customTheme(theme).colors.unpaidRed, 0.8)
                }
              }}
            />
          );
        }

        const Icon = params.value ? CheckCircleOutline : CancelOutlined;
        const iconColor = params.value
          ? alpha(customTheme(theme).colors.paidGreen, 0.8)
          : alpha(customTheme(theme).colors.unpaidRed, 0.8);

        return <Icon sx={{ color: iconColor, cursor: "default" }} />;
      }
    }
  ];

  const rows = onCallData
    .filter((item) => item.year === selectedDate.year)
    .map((item, idx) => ({
      id: idx,
      paid: item.paid,
      week: item.week,
      person: item.username ?? strings.oncall.noUsernameOnCall,
      email: item.email ?? "-"
    }));

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          my: 3
        }}
      >
        <Typography
          variant="h4"
          className="button-text"
          sx={customTheme(theme).customStyles.listViewTypography}
        >
          {strings.oncall.oncallShifts} {selectedDate.year}
        </Typography>

        <Box sx={{ display: "flex" }}>
          <Button
            onClick={() => setSelectedDate(selectedDate.minus({ year: 1 }))}
            disabled={selectedDate.year === 2020}
            sx={customTheme(theme).customStyles.listViewButton}
          >
            <Typography variant="h4" sx={customTheme(theme).customStyles.listViewTypography}>
              {strings.oncall.previousYear}
            </Typography>
          </Button>
          <Button
            onClick={() => setSelectedDate(selectedDate.plus({ year: 1 }))}
            disabled={selectedDate.year === DateTime.now().year}
            sx={customTheme(theme).customStyles.listViewButton}
          >
            <Typography variant="h4" sx={customTheme(theme).customStyles.listViewTypography}>
              {strings.oncall.nextYear}
            </Typography>
          </Button>
        </Box>
      </Box>

      {rows.length === 0 ? (
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            py: 6,
            fontSize: 24,
            fontWeight: "bold",
            color: theme.palette.text.secondary,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.paper,
            mt: 2
          }}
        >
          {strings.oncall.noDataForYear}
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          hideFooter
          sx={{
            marginBottom: "30px",
            border: `1px solid ${alpha(theme.palette.text.primary, 0.3)}`,
            "& .MuiDataGrid-row:hover": {
              backgroundColor: theme.palette.action.hover
            },
            "& .MuiDataGrid-cell": {
              fontSize: 16,
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.15)}`
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.3)}`
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold"
            },
            "& .default-row": {
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
          initialState={{
            sorting: { sortModel: [{ field: "week", sort: "asc" }] }
          }}
        />
      )}
    </>
  );
};

export default OnCallListView;
