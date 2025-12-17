import { HelpOutline } from "@mui/icons-material";
import { alpha, Box, Button, Checkbox, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useAtom, useAtomValue } from "jotai";
import { DateTime } from "luxon";
import { userProfileAtom } from "src/atoms/auth";
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
  const [onCallData, setOnCallData] = useAtom(onCallAtom);
  const { isAccountant } = useUserRole();
  const userProfile = useAtomValue(userProfileAtom);
  const loggedInEmail = userProfile?.email;

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
   *
   */
  const handleCheckboxChange = async (week: number, currentPaid: boolean) => {
    try {
      await updatePaidStatus(selectedDate.year, week, currentPaid);

      setOnCallData((prev) =>
        prev.map((item) =>
          item.year === selectedDate.year && item.week === week
            ? { ...item, paid: !currentPaid }
            : item
        )
      );
    } catch (error) {
      console.error("Failed to update paid status:", error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "week",
      headerName: strings.timeExpressions.week,
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: true
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
            border: isLoggedInUser(params.row.email) ? "2px solid black" : "none",
            borderRadius: 2,
            px: 1
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
            fontWeight: isLoggedInUser(params.value) ? "bold" : "normal"
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
      renderCell: (params) =>
        isAccountant ? (
          <Checkbox
            onClick={(e) => e.stopPropagation()}
            onChange={() => handleCheckboxChange(params.row.week, params.value)}
            checked={params.value}
            sx={{
              "&.Mui-checked": {
                color: alpha(customTheme.colors.paidGreen, 0.8)
              },
              "&:not(.Mui-checked)": {
                color: alpha("#ff6384", 0.8)
              }
            }}
          />
        ) : (
          // Readonly icon for non-accountants, green if paid, red if not paid.
          <HelpOutline
            sx={{
              color: params.value
                ? alpha(customTheme.colors.paidGreen, 0.8)
                : alpha("#ff6384", 0.8),
              cursor: "default"
            }}
          />
        )
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 3 }}>
        <Typography
          variant="h4"
          className="button-text"
          sx={customTheme.customStyles.listViewTypography}
        >
          {strings.oncall.oncallShifts} {selectedDate.year}
        </Typography>

        <Box sx={{ display: "flex" }}>
          <Button
            onClick={() => setSelectedDate(selectedDate.minus({ year: 1 }))}
            disabled={selectedDate.year === 2020}
            sx={customTheme.customStyles.listViewButton}
          >
            <Typography variant="h4" sx={customTheme.customStyles.listViewTypography}>
              {strings.oncall.previousYear}
            </Typography>
          </Button>
          <Button
            onClick={() => setSelectedDate(selectedDate.plus({ year: 1 }))}
            disabled={selectedDate.year === DateTime.now().year}
            sx={customTheme.customStyles.listViewButton}
          >
            <Typography variant="h4" sx={customTheme.customStyles.listViewTypography}>
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
            color: "#bdbdbd",
            border: "1px solid #eee",
            borderRadius: 4,
            background: "#fafafa",
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
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#eeeeee"
            },
            "& .MuiDataGrid-cell": { fontSize: 16, color: "black" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#cfc7c7"
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold"
            },
            "& .default-row": {
              backgroundColor: "#f5f5f5"
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
